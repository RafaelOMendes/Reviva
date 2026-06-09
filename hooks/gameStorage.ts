// Persistência do jogo por nível + último nível aberto.
// Cada nível guarda sua grade em uma chave própria (@reviva_grid_<id>) para
// evitar condição de corrida ao salvar a cada tecla (escritas independentes).
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedGrid {
  userGrid: string[][];        // letras digitadas
  lockedCells: boolean[][];    // células reveladas por dica (bloqueadas)
  hintLevels: number[];        // dicas de texto reveladas por linha
  timer: number;               // segundos decorridos
}

const gridKey = (puzzleId: string) => `@reviva_grid_${puzzleId}`;
const LAST_LEVEL_KEY = '@reviva_last_level';

export async function loadSavedGrid(puzzleId: string): Promise<SavedGrid | null> {
  try {
    const data = await AsyncStorage.getItem(gridKey(puzzleId));
    return data ? (JSON.parse(data) as SavedGrid) : null;
  } catch (e) {
    console.error('Failed to load saved grid', e);
    return null;
  }
}

export async function saveGrid(puzzleId: string, grid: SavedGrid): Promise<void> {
  try {
    await AsyncStorage.setItem(gridKey(puzzleId), JSON.stringify(grid));
  } catch (e) {
    console.error('Failed to save grid', e);
  }
}

export async function clearSavedGrid(puzzleId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(gridKey(puzzleId));
  } catch (e) {
    console.error('Failed to clear saved grid', e);
  }
}

export async function setLastLevel(puzzleId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_LEVEL_KEY, puzzleId);
  } catch (e) {
    console.error('Failed to save last level', e);
  }
}

export async function getLastLevel(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_LEVEL_KEY);
  } catch (e) {
    console.error('Failed to read last level', e);
    return null;
  }
}
