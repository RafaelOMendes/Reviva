// Reviva — Dados do Puzzle
// Carregados de niveis.json (raiz do projeto)

import niveisData from '../niveis.json';
import desafiosData from '../desafios.json';

export type FormatoAcrostico = 'coluna_fixa' | 'escada_diagonal';

export interface PuzzleWord {
  word: string;
  clues: string[];
  indiceLetraOculta: number; // coluna da letra que compõe o acróstico
}

export interface PuzzleData {
  id: string;
  title: string;
  theme: string;
  themeId: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  words: PuzzleWord[];
  cols: number;
  rows: number;
  palavraOculta: string;
  formatoAcrostico: FormatoAcrostico;
  indiceColunaOculta: number | null; // null em escada_diagonal
}

export interface Theme {
  id: string;
  name: string;
  puzzleIds: string[];
}

function difficultyFromCols(cols: number): PuzzleData['difficulty'] {
  if (cols <= 5) return 'Fácil';
  if (cols === 6) return 'Médio';
  return 'Difícil';
}

interface RawPalavra {
  palavra: string;
  dicas: string[];
  indice_letra_oculta: number;
}

interface RawAssunto {
  nome: string;
  palavra_oculta: string;
  formato_acrostico: FormatoAcrostico;
  tamanho_palavras_horizontais: number;
  indice_coluna_oculta: number | null;
  palavras: RawPalavra[];
}

interface RawTema {
  nome: string;
  assuntos: RawAssunto[];
}

const RAW = niveisData as { temas: RawTema[] };

export const THEMES: Theme[] = [];
export const PUZZLES: PuzzleData[] = [];

RAW.temas.forEach((tema, ti) => {
  const themeId = `t${ti + 1}`;
  const puzzleIds: string[] = [];

  tema.assuntos.forEach((assunto, si) => {
    const id = `${themeId}-s${si + 1}`;
    puzzleIds.push(id);

    PUZZLES.push({
      id,
      title: assunto.nome,
      theme: tema.nome,
      themeId,
      difficulty: difficultyFromCols(assunto.tamanho_palavras_horizontais),
      cols: assunto.tamanho_palavras_horizontais,
      rows: assunto.palavras.length,
      palavraOculta: assunto.palavra_oculta,
      formatoAcrostico: assunto.formato_acrostico,
      indiceColunaOculta: assunto.indice_coluna_oculta,
      words: assunto.palavras.map((p) => ({
        word: p.palavra,
        clues: p.dicas,
        indiceLetraOculta: p.indice_letra_oculta,
      })),
    });
  });

  THEMES.push({ id: themeId, name: tema.nome, puzzleIds });
});

// --- Desafios diários -----------------------------------------------------
// Carregados de desafios.json (lista plana de "assuntos", um por dia do mês).
// Ficam FORA de THEMES (não entram na trilha), mas vão para PUZZLES para que a
// tela de jogo encontre cada um por id. Id no formato `d{1..31}`.
const RAW_DESAFIOS = desafiosData as RawAssunto[];

export const DAILY_CHALLENGES: PuzzleData[] = RAW_DESAFIOS.map((assunto, di) => {
  const puzzle: PuzzleData = {
    id: `d${di + 1}`,
    title: assunto.nome,
    theme: 'Desafio Diário',
    themeId: 'daily',
    difficulty: difficultyFromCols(assunto.tamanho_palavras_horizontais),
    cols: assunto.tamanho_palavras_horizontais,
    rows: assunto.palavras.length,
    palavraOculta: assunto.palavra_oculta,
    formatoAcrostico: assunto.formato_acrostico,
    indiceColunaOculta: assunto.indice_coluna_oculta,
    words: assunto.palavras.map((p) => ({
      word: p.palavra,
      clues: p.dicas,
      indiceLetraOculta: p.indice_letra_oculta,
    })),
  };
  PUZZLES.push(puzzle); // descobrível por useGameState via PUZZLES.find
  return puzzle;
});

// Escolhe o desafio do dia a partir da data (dia do mês 1..31). Meses mais
// curtos simplesmente nunca chegam aos últimos. "Por enquanto" — base local.
export function getDailyChallenge(date: Date = new Date()): PuzzleData {
  const day = date.getDate(); // 1..31
  const index = Math.min(day, DAILY_CHALLENGES.length) - 1;
  return DAILY_CHALLENGES[index];
}

export function buildGrid(puzzle: PuzzleData): string[][] {
  return puzzle.words.map((pw) => pw.word.split(''));
}
