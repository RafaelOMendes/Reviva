// Reviva — Dados do Puzzle
// Carregados de niveis.json (raiz do projeto)

import niveisData from '../niveis.json';

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

export function buildGrid(puzzle: PuzzleData): string[][] {
  return puzzle.words.map((pw) => pw.word.split(''));
}
