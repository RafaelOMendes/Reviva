import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PuzzleProgress {
  id: string;
  completed: boolean;
  timeSpent: number; // em segundos
  hintsUsed: number;
}

const STORAGE_KEY = '@reviva_progress';

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, PuzzleProgress>>({});
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setProgress(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const savePuzzleProgress = useCallback(async (puzzleId: string, puzzleData: Omit<PuzzleProgress, 'id'>) => {
    try {
      setProgress((prev) => {
        const newProgress = {
          ...prev,
          [puzzleId]: { id: puzzleId, ...puzzleData },
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress)).catch(e => console.error('Failed to save progress', e));
        return newProgress;
      });
    } catch (e) {
      console.error('Failed to save progress state', e);
    }
  }, []);

  const clearProgress = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setProgress({});
    } catch (e) {
      console.error('Failed to clear progress', e);
    }
  }, []);

  const removePuzzleProgress = useCallback(async (puzzleId: string) => {
    setProgress((prev) => {
      if (!prev[puzzleId]) return prev;
      const next = { ...prev };
      delete next[puzzleId];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((e) =>
        console.error('Failed to remove puzzle progress', e)
      );
      return next;
    });
  }, []);

  return {
    progress,
    loading,
    savePuzzleProgress,
    removePuzzleProgress,
    clearProgress,
    loadProgress,
  };
}
