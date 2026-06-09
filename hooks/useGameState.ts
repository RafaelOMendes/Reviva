import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { bgMusicRef } from '../app/_layout';
import { PUZZLES, buildGrid, PuzzleData } from '../constants/puzzleData';
import { useProgress } from './useProgress';
import { loadSavedGrid, saveGrid, clearSavedGrid } from './gameStorage';

export type GameStatus = 'playing' | 'won';

export interface GameState {
    puzzle: PuzzleData | undefined;
    userGrid: string[][];        // O que o usuário digitou
    activeRow: number;           // Linha atualmente selecionada
    activeCol: number;           // Coluna atualmente selecionada
    correctRows: boolean[];      // Quais linhas estão corretas
    gameStatus: GameStatus;
    hintLevels: number[];        // Quantas dicas de texto já foram reveladas por linha (0 a 2)
    timer: number;
    lockedCells: boolean[][];    // Células bloqueadas (reveladas por dica)
    hydrated: boolean;           // true quando o estado salvo já foi carregado do AsyncStorage
    justWon: boolean;            // true só quando a vitória aconteceu agora (não ao reabrir nível concluído)
}

export interface GameActions {
    handleKeyPress: (key: string) => void;
    handleBackspace: () => void;
    selectCell: (row: number, col: number) => void;
    useHint: () => void;
    resetGame: () => void;
}

export function useGameState(puzzleId: string): GameState & GameActions {
    const puzzle = PUZZLES.find(p => p.id === puzzleId) || PUZZLES[0];
    const COLS = puzzle.cols;
    const ROWS = puzzle.rows;
    const SOLUTION = useRef(buildGrid(puzzle)).current;

    const createEmptyGrid = useCallback(() => {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    }, [ROWS, COLS]);

    const [userGrid, setUserGrid] = useState<string[][]>(createEmptyGrid);
    const [activeRow, setActiveRow] = useState(0);
    const [activeCol, setActiveCol] = useState(0);
    const [correctRows, setCorrectRows] = useState<boolean[]>(Array(ROWS).fill(false));
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
    const [hintLevels, setHintLevels] = useState<number[]>(Array(ROWS).fill(0));
    const [timer, setTimer] = useState(0);
    const [lockedCells, setLockedCells] = useState<boolean[][]>(() =>
        Array.from({ length: ROWS }, () => Array(COLS).fill(false))
    );
    const [justWon, setJustWon] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Refs espelham o estado para que toques rápidos leiam sempre o valor mais
    // recente — sem isso, digitar rápido usa um `activeCol`/grid defasado do
    // closure e o app "come" letras (escreve duas vezes na mesma célula).
    const activeRowRef = useRef(0);
    const activeColRef = useRef(0);
    const userGridRef = useRef<string[][]>(userGrid);
    const correctRowsRef = useRef<boolean[]>(correctRows);
    const lockedCellsRef = useRef<boolean[][]>(lockedCells);
    const hintLevelsRef = useRef<number[]>(hintLevels);
    const gameStatusRef = useRef<GameStatus>('playing');
    const timerRef = useRef(0);
    const hydratedRef = useRef(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { timerRef.current = timer; }, [timer]);

    // Atualiza posição ativa em ref + estado ao mesmo tempo (ref = síncrono)
    const setActivePos = useCallback((row: number, col: number) => {
        activeRowRef.current = row;
        activeColRef.current = col;
        setActiveRow(row);
        setActiveCol(col);
    }, []);

    const { savePuzzleProgress, removePuzzleProgress } = useProgress();

    // --- Persistência da grade (palavras digitadas) por nível ---
    const writeGrid = useCallback(() => {
        // Não mexe no storage antes de carregar o estado salvo, senão um flush
        // precoce (sair do nível antes da hidratação) apagaria o que já existia.
        if (!hydratedRef.current) return;
        const blank =
            userGridRef.current.every((r) => r.every((c) => c === '')) &&
            hintLevelsRef.current.every((h) => h === 0) &&
            !lockedCellsRef.current.some((r) => r.some(Boolean));
        if (blank) {
            // Nada preenchido: não cria/limpa a chave (mantém o storage enxuto).
            clearSavedGrid(puzzle.id);
        } else {
            saveGrid(puzzle.id, {
                userGrid: userGridRef.current,
                lockedCells: lockedCellsRef.current,
                hintLevels: hintLevelsRef.current,
                timer: timerRef.current,
            });
        }
    }, [puzzle.id]);

    const persistState = useCallback(() => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveTimer.current = null;
            writeGrid();
        }, 300);
    }, [writeGrid]);

    // Carrega o estado salvo ao montar (ou ao trocar de nível).
    useEffect(() => {
        let active = true;
        (async () => {
            const saved = await loadSavedGrid(puzzle.id);
            const dimsOk =
                !!saved &&
                saved.userGrid?.length === ROWS &&
                saved.userGrid.every((r) => r.length === COLS);
            if (active && dimsOk && saved) {
                const locked =
                    saved.lockedCells?.length === ROWS &&
                    saved.lockedCells.every((r) => r.length === COLS)
                        ? saved.lockedCells
                        : Array.from({ length: ROWS }, () => Array(COLS).fill(false));
                const hints =
                    saved.hintLevels?.length === ROWS ? saved.hintLevels : Array(ROWS).fill(0);
                const cr = saved.userGrid.map((r, i) => r.join('') === SOLUTION[i].join(''));
                const won = cr.every(Boolean);
                let firstRow = cr.findIndex((c) => !c);
                if (firstRow === -1) firstRow = 0;
                let firstCol = 0;
                while (firstCol < COLS && locked[firstRow]?.[firstCol]) firstCol++;
                if (firstCol >= COLS) firstCol = 0;

                userGridRef.current = saved.userGrid;
                lockedCellsRef.current = locked;
                hintLevelsRef.current = hints;
                correctRowsRef.current = cr;
                gameStatusRef.current = won ? 'won' : 'playing';
                timerRef.current = saved.timer ?? 0;
                activeRowRef.current = firstRow;
                activeColRef.current = firstCol;

                setUserGrid(saved.userGrid);
                setLockedCells(locked);
                setHintLevels(hints);
                setCorrectRows(cr);
                setGameStatus(won ? 'won' : 'playing');
                setTimer(saved.timer ?? 0);
                setActiveRow(firstRow);
                setActiveCol(firstCol);
            }
            if (active) {
                hydratedRef.current = true;
                setHydrated(true);
            }
        })();
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [puzzle.id]);

    // Grava o progresso ao sair da tela (flush imediato do que estiver pendente).
    useEffect(() => {
        return () => {
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                saveTimer.current = null;
            }
            writeGrid();
        };
    }, [writeGrid]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameStatus === 'playing') {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameStatus]);



    // Refs para armazenar as instâncias pré-carregadas dos sons
    const correctSound = useRef<Audio.Sound | null>(null);
    const winSound = useRef<Audio.Sound | null>(null);

    // Pré-carregamento dos sons
    useEffect(() => {
        async function loadSounds() {
            try {
                const [correct, win] = await Promise.all([
                    Audio.Sound.createAsync(require('../assets/sounds/correct.mp3')),
                    Audio.Sound.createAsync(require('../assets/sounds/win.mp3'))
                ]);
                correctSound.current = correct.sound;
                winSound.current = win.sound;
            } catch (error) {
                console.log('Error loading sounds:', error);
            }
        }
        loadSounds();

        // Cleanup: descarrega os sons ao sair da tela
        return () => {
            correctSound.current?.unloadAsync();
            winSound.current?.unloadAsync();
        };
    }, []); // Dependência vazia, vai usar o playSound do render inicial, mas playSound não tem dependências de estado problemáticas aqui

    // Função para tocar o som instantaneamente e abaixar a música de fundo
    const playSound = useCallback(async (type: 'correct' | 'wrong' | 'win') => {
        try {
            let soundToPlay: Audio.Sound | null = null;
            if (type === 'correct') soundToPlay = correctSound.current;
            else if (type === 'win') soundToPlay = winSound.current;

            if (soundToPlay) {
                // Abaixa a música de fundo
                if (bgMusicRef.current) {
                    await bgMusicRef.current.setVolumeAsync(0.02);
                }

                await soundToPlay.replayAsync();

                const status = await soundToPlay.getStatusAsync();
                if (status.isLoaded && status.durationMillis) {
                    setTimeout(() => {
                        bgMusicRef.current?.setVolumeAsync(0.15);
                    }, status.durationMillis);
                } else {
                    setTimeout(() => {
                        bgMusicRef.current?.setVolumeAsync(0.15);
                    }, 1500);
                }
            }
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }, []);

    const checkRow = useCallback((row: number, grid: string[][]): boolean => {
        return grid[row].join('') === SOLUTION[row].join('');
    }, [SOLUTION]);

    // Recebe a linha explicitamente (lida da ref) para não depender do closure.
    const processGridUpdate = useCallback((newGrid: string[][], row: number) => {
        if (!checkRow(row, newGrid)) {
            const isRowFull = newGrid[row].every(cell => cell !== '');
            if (isRowFull) playSound('wrong');
            return;
        }

        const newCorrectRows = [...correctRowsRef.current];
        newCorrectRows[row] = true;
        correctRowsRef.current = newCorrectRows;
        setCorrectRows(newCorrectRows);

        if (newCorrectRows.every(Boolean)) {
            gameStatusRef.current = 'won';
            setGameStatus('won');
            setJustWon(true);
            playSound('win');
            savePuzzleProgress(puzzle.id, { completed: true, hintsUsed: 0, timeSpent: timerRef.current });
        } else {
            playSound('correct');
            let nextRow = newCorrectRows.findIndex((c, i) => i > row && !c);
            if (nextRow === -1) nextRow = newCorrectRows.findIndex(c => !c);
            if (nextRow !== -1) setActivePos(nextRow, 0);
        }
    }, [checkRow, playSound, savePuzzleProgress, puzzle.id, setActivePos]);

    const handleKeyPress = useCallback((key: string) => {
        if (!hydratedRef.current) return;
        if (gameStatusRef.current !== 'playing') return;
        const row = activeRowRef.current;
        if (correctRowsRef.current[row]) return;

        const letter = key.toUpperCase();
        if (!/^[A-ZÇ]$/.test(letter)) return;

        const locked = lockedCellsRef.current[row];
        let targetCol = activeColRef.current;
        while (targetCol < COLS && locked[targetCol]) targetCol++;
        if (targetCol >= COLS) return; // Não há espaço livre

        const newGrid = userGridRef.current.map((r) => [...r]);
        newGrid[row][targetCol] = letter;
        userGridRef.current = newGrid;

        if (!checkRow(row, newGrid)) {
            let nextCol = targetCol + 1;
            while (nextCol < COLS && locked[nextCol]) nextCol++;
            const landing = nextCol < COLS ? nextCol : targetCol;
            activeColRef.current = landing;
            setActiveCol(landing);
        }

        setUserGrid(newGrid);
        processGridUpdate(newGrid, row);
        persistState();
    }, [COLS, checkRow, processGridUpdate, persistState]);

    const handleBackspace = useCallback(() => {
        if (!hydratedRef.current) return;
        if (gameStatusRef.current !== 'playing') return;
        const row = activeRowRef.current;
        if (correctRowsRef.current[row]) return;

        const locked = lockedCellsRef.current[row];
        const col = activeColRef.current;
        const newGrid = userGridRef.current.map((r) => [...r]);
        let colToClear = -1;

        if (!locked[col] && newGrid[row][col] !== '') {
            colToClear = col;
        } else {
            let prevCol = col - 1;
            while (prevCol >= 0 && locked[prevCol]) prevCol--;
            if (prevCol >= 0) colToClear = prevCol;
        }

        if (colToClear !== -1) {
            newGrid[row][colToClear] = '';
            userGridRef.current = newGrid;
            activeColRef.current = colToClear;
            setActiveCol(colToClear);
            setUserGrid(newGrid);
            persistState();
        }
    }, [persistState]);

    const selectCell = useCallback((row: number, col: number) => {
        if (correctRowsRef.current[row]) return;
        if (lockedCellsRef.current[row][col]) return;
        setActivePos(row, col);
    }, [setActivePos]);

    const useHint = useCallback(() => {
        if (!hydratedRef.current) return;
        if (gameStatusRef.current !== 'playing') return;
        const row = activeRowRef.current;
        if (correctRowsRef.current[row]) return;

        if (hintLevelsRef.current[row] < 2) {
            // Revela a próxima dica de texto
            const next = [...hintLevelsRef.current];
            next[row]++;
            hintLevelsRef.current = next;
            setHintLevels(next);
            persistState();
            return;
        }

        // Já revelou as 3 dicas (índices 0, 1 e 2). Começa a preencher letras
        const grid = userGridRef.current;
        const unrevealedCols: number[] = [];
        for (let c = 0; c < COLS; c++) {
            if (grid[row][c] !== SOLUTION[row][c]) unrevealedCols.push(c);
        }
        if (unrevealedCols.length === 0) return;

        // Revela de 1 a 3 letras
        const numToReveal = Math.min(unrevealedCols.length, Math.floor(Math.random() * 3) + 1);

        // Shuffle
        for (let i = unrevealedCols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unrevealedCols[i], unrevealedCols[j]] = [unrevealedCols[j], unrevealedCols[i]];
        }
        const colsToReveal = unrevealedCols.slice(0, numToReveal);

        const newGrid = grid.map(r => [...r]);
        for (const c of colsToReveal) newGrid[row][c] = SOLUTION[row][c];
        userGridRef.current = newGrid;
        setUserGrid(newGrid);

        const newLocked = lockedCellsRef.current.map(r => [...r]);
        for (const c of colsToReveal) newLocked[row][c] = true;
        lockedCellsRef.current = newLocked;
        setLockedCells(newLocked);

        processGridUpdate(newGrid, row);
        persistState();
    }, [COLS, SOLUTION, processGridUpdate, persistState]);

    const resetGame = useCallback(() => {
        const emptyGrid = createEmptyGrid();
        const emptyLocked = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
        const emptyCorrect = Array(ROWS).fill(false);
        const emptyHints = Array(ROWS).fill(0);

        if (saveTimer.current) {
            clearTimeout(saveTimer.current);
            saveTimer.current = null;
        }

        userGridRef.current = emptyGrid;
        lockedCellsRef.current = emptyLocked;
        correctRowsRef.current = emptyCorrect;
        hintLevelsRef.current = emptyHints;
        gameStatusRef.current = 'playing';
        timerRef.current = 0;
        activeRowRef.current = 0;
        activeColRef.current = 0;

        setUserGrid(emptyGrid);
        setLockedCells(emptyLocked);
        setActiveRow(0);
        setActiveCol(0);
        setCorrectRows(emptyCorrect);
        setHintLevels(emptyHints);
        setGameStatus('playing');
        setJustWon(false);
        setTimer(0);

        // Apaga o que estava salvo deste nível: grade digitada + marca de conclusão.
        clearSavedGrid(puzzle.id);
        removePuzzleProgress(puzzle.id);
    }, [createEmptyGrid, ROWS, COLS, puzzle.id, removePuzzleProgress]);

    return {
        puzzle,
        userGrid,
        activeRow,
        activeCol,
        correctRows,
        gameStatus,
        hintLevels,
        timer,
        lockedCells,
        hydrated,
        justWon,
        handleKeyPress,
        handleBackspace,
        selectCell,
        useHint,
        resetGame,
    };
}
