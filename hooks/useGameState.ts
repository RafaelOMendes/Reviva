import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { bgMusicRef } from '../app/_layout';
import { PUZZLES, buildGrid, PuzzleData } from '../constants/puzzleData';
import { useProgress } from './useProgress';

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
}

export interface GameActions {
    handleKeyPress: (key: string) => void;
    handleBackspace: () => void;
    handleEnter: () => void;
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

    const { savePuzzleProgress } = useProgress();

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

    const processGridUpdate = useCallback((newGrid: string[][]) => {
        const isRowFull = newGrid[activeRow].every(cell => cell !== '');
        const newCorrectRows = [...correctRows];

        if (checkRow(activeRow, newGrid)) {
            newCorrectRows[activeRow] = true;
            setCorrectRows(newCorrectRows);

            if (newCorrectRows.every(Boolean)) {
                setGameStatus('won');
                playSound('win');
                savePuzzleProgress(puzzle.id, { completed: true, hintsUsed: 0, timeSpent: timer });
            } else {
                playSound('correct');
                const nextRow = newCorrectRows.findIndex((c, i) => i > activeRow && !c);
                if (nextRow !== -1) {
                    setActiveRow(nextRow);
                    setActiveCol(0);
                } else {
                    const firstNextRow = newCorrectRows.findIndex(c => !c);
                    if (firstNextRow !== -1) {
                        setActiveRow(firstNextRow);
                        setActiveCol(0);
                    }
                }
            }
        } else if (isRowFull) {
            playSound('wrong');
        }
    }, [activeRow, correctRows, checkRow, timer, puzzle.id, savePuzzleProgress]);

    const handleKeyPress = useCallback((key: string) => {
        if (gameStatus !== 'playing') return;
        if (correctRows[activeRow]) return;

        const letter = key.toUpperCase();
        if (!/^[A-ZÇ]$/.test(letter)) return;

        let targetCol = activeCol;
        if (lockedCells[activeRow][targetCol]) {
            while (targetCol < COLS && lockedCells[activeRow][targetCol]) {
                targetCol++;
            }
            if (targetCol >= COLS) return; // Não há espaço livre
        }

        setUserGrid((prev) => {
            const newGrid = prev.map((r) => [...r]);
            newGrid[activeRow][targetCol] = letter;

            const isCompleted = checkRow(activeRow, newGrid);

            if (!isCompleted) {
                let nextCol = targetCol + 1;
                while (nextCol < COLS && lockedCells[activeRow][nextCol]) {
                    nextCol++;
                }
                if (nextCol < COLS) {
                    setActiveCol(nextCol);
                } else if (targetCol !== activeCol) {
                    setActiveCol(targetCol);
                }
            }

            processGridUpdate(newGrid);
            return newGrid;
        });
    }, [activeRow, activeCol, correctRows, gameStatus, COLS, processGridUpdate, lockedCells, checkRow]);

    const handleBackspace = useCallback(() => {
        if (gameStatus !== 'playing') return;
        if (correctRows[activeRow]) return;

        setUserGrid((prev) => {
            const newGrid = prev.map((r) => [...r]);
            let colToClear = -1;

            if (!lockedCells[activeRow][activeCol] && newGrid[activeRow][activeCol] !== '') {
                colToClear = activeCol;
            } else {
                let prevCol = activeCol - 1;
                while (prevCol >= 0 && lockedCells[activeRow][prevCol]) {
                    prevCol--;
                }
                if (prevCol >= 0) {
                    colToClear = prevCol;
                }
            }

            if (colToClear !== -1) {
                newGrid[activeRow][colToClear] = '';
                setActiveCol(colToClear);
            }
            return newGrid;
        });
    }, [activeRow, activeCol, correctRows, gameStatus, lockedCells]);

    const handleEnter = useCallback(() => {
        if (gameStatus !== 'playing') return;

        const isRowFull = userGrid[activeRow].every(cell => cell !== '');
        if (isRowFull && !checkRow(activeRow, userGrid)) {
            playSound('wrong');
        }

        const nextRow = correctRows.findIndex((c, i) => i > activeRow && !c);
        if (nextRow !== -1) {
            setActiveRow(nextRow);
            setActiveCol(0);
        } else {
            const firstNextRow = correctRows.findIndex(c => !c);
            if (firstNextRow !== -1) {
                setActiveRow(firstNextRow);
                setActiveCol(0);
            }
        }
    }, [activeRow, correctRows, gameStatus, userGrid, checkRow]);

    const selectCell = useCallback((row: number, col: number) => {
        if (correctRows[row]) return;
        if (lockedCells[row][col]) return;
        setActiveRow(row);
        setActiveCol(col);
    }, [correctRows, lockedCells]);

    const useHint = useCallback(() => {
        if (gameStatus !== 'playing' || correctRows[activeRow]) return;

        if (hintLevels[activeRow] < 2) {
            // Revela a próxima dica de texto
            setHintLevels(prev => {
                const next = [...prev];
                next[activeRow]++;
                return next;
            });
        } else {
            // Já revelou as 3 dicas (índices 0, 1 e 2). Começa a preencher letras
            const unrevealedCols: number[] = [];
            for (let c = 0; c < COLS; c++) {
                if (userGrid[activeRow][c] !== SOLUTION[activeRow][c]) {
                    unrevealedCols.push(c);
                }
            }

            if (unrevealedCols.length > 0) {
                // Revela de 1 a 3 letras
                const numToReveal = Math.min(unrevealedCols.length, Math.floor(Math.random() * 3) + 1);

                // Shuffle
                for (let i = unrevealedCols.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [unrevealedCols[i], unrevealedCols[j]] = [unrevealedCols[j], unrevealedCols[i]];
                }

                const colsToReveal = unrevealedCols.slice(0, numToReveal);

                setUserGrid(prev => {
                    const newGrid = prev.map(r => [...r]);
                    for (const c of colsToReveal) {
                        newGrid[activeRow][c] = SOLUTION[activeRow][c];
                    }
                    processGridUpdate(newGrid);
                    return newGrid;
                });

                setLockedCells(prev => {
                    const newLocked = prev.map(r => [...r]);
                    for (const c of colsToReveal) {
                        newLocked[activeRow][c] = true;
                    }
                    return newLocked;
                });
            }
        }
    }, [activeRow, correctRows, gameStatus, hintLevels, COLS, userGrid, SOLUTION, processGridUpdate, lockedCells]);

    const resetGame = useCallback(() => {
        setUserGrid(createEmptyGrid());
        setLockedCells(Array.from({ length: ROWS }, () => Array(COLS).fill(false)));
        setActiveRow(0);
        setActiveCol(0);
        setCorrectRows(Array(ROWS).fill(false));
        setHintLevels(Array(ROWS).fill(0));
        setGameStatus('playing');
        setTimer(0);
    }, [createEmptyGrid, ROWS, COLS]);

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
        handleKeyPress,
        handleBackspace,
        handleEnter,
        selectCell,
        useHint,
        resetGame,
    };
}
