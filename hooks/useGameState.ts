import { useState, useCallback } from 'react';
import { PUZZLE, buildGrid } from '../constants/puzzleData';

export type GameStatus = 'playing' | 'won';

export interface GameState {
  userGrid: string[][];        // O que o usuário digitou
  activeRow: number;           // Linha atualmente selecionada
  activeCol: number;           // Coluna atualmente selecionada
  correctRows: boolean[];      // Quais linhas estão corretas
  gameStatus: GameStatus;
  showHint: boolean;
}

export interface GameActions {
  handleKeyPress: (key: string) => void;
  handleBackspace: () => void;
  handleEnter: () => void;
  selectCell: (row: number, col: number) => void;
  toggleHint: () => void;
  resetGame: () => void;
}

const COLS = PUZZLE.cols;
const ROWS = PUZZLE.rows;
const SOLUTION = buildGrid(PUZZLE);

function createEmptyGrid(): string[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
}

export function useGameState(): GameState & GameActions {
  const [userGrid, setUserGrid] = useState<string[][]>(createEmptyGrid);
  const [activeRow, setActiveRow] = useState(0);
  const [activeCol, setActiveCol] = useState(0);
  const [correctRows, setCorrectRows] = useState<boolean[]>(Array(ROWS).fill(false));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [showHint, setShowHint] = useState(false);

  const checkRow = useCallback((row: number, grid: string[][]): boolean => {
    return grid[row].join('') === SOLUTION[row].join('');
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;
    if (correctRows[activeRow]) return; // Linha já correta, não editar

    const letter = key.toUpperCase();
    if (!/^[A-ZÇ]$/.test(letter)) return;

    setUserGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      newGrid[activeRow][activeCol] = letter;

      // Verificar se a linha foi completada corretamente
      const newCorrectRows = [...correctRows];
      if (checkRow(activeRow, newGrid)) {
        newCorrectRows[activeRow] = true;
        setCorrectRows(newCorrectRows);

        // Verificar vitória
        if (newCorrectRows.every(Boolean)) {
          setGameStatus('won');
        } else {
          // Avançar para próxima linha disponível
          const nextRow = newCorrectRows.findIndex((c, i) => i > activeRow && !c);
          if (nextRow !== -1) {
            setActiveRow(nextRow);
            setActiveCol(0);
          }
        }
      }

      return newGrid;
    });

    // Avançar coluna automaticamente
    if (activeCol < COLS - 1) {
      setActiveCol((c) => c + 1);
    }
  }, [activeRow, activeCol, correctRows, gameStatus, checkRow]);

  const handleBackspace = useCallback(() => {
    if (gameStatus !== 'playing') return;
    if (correctRows[activeRow]) return;

    setUserGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      if (newGrid[activeRow][activeCol] !== '') {
        newGrid[activeRow][activeCol] = '';
      } else if (activeCol > 0) {
        newGrid[activeRow][activeCol - 1] = '';
        setActiveCol((c) => c - 1);
      }
      return newGrid;
    });

    if (userGrid[activeRow][activeCol] === '' && activeCol > 0) {
      setActiveCol((c) => c - 1);
    }
  }, [activeRow, activeCol, correctRows, gameStatus, userGrid]);

  const handleEnter = useCallback(() => {
    if (gameStatus !== 'playing') return;
    // Move para a próxima linha não-correta
    const nextRow = correctRows.findIndex((c, i) => i > activeRow && !c);
    if (nextRow !== -1) {
      setActiveRow(nextRow);
      setActiveCol(0);
    }
  }, [activeRow, correctRows, gameStatus]);

  const selectCell = useCallback((row: number, col: number) => {
    if (correctRows[row]) return; // Não selecionar linha correta
    setActiveRow(row);
    setActiveCol(col);
  }, [correctRows]);

  const toggleHint = useCallback(() => {
    setShowHint((v) => !v);
  }, []);

  const resetGame = useCallback(() => {
    setUserGrid(createEmptyGrid());
    setActiveRow(0);
    setActiveCol(0);
    setCorrectRows(Array(ROWS).fill(false));
    setGameStatus('playing');
    setShowHint(false);
  }, []);

  return {
    userGrid,
    activeRow,
    activeCol,
    correctRows,
    gameStatus,
    showHint,
    handleKeyPress,
    handleBackspace,
    handleEnter,
    selectCell,
    toggleHint,
    resetGame,
  };
}
