// Reviva — Dados do Puzzle
// Grade 7 colunas × 9 linhas (baseada no Figma)

export interface PuzzleWord {
  word: string;
  clue: string;
}

export interface PuzzleData {
  words: PuzzleWord[];
  cols: number;
  rows: number;
}

export const PUZZLE: PuzzleData = {
  cols: 7,
  rows: 9,
  words: [
    { word: 'CANTORA', clue: 'Artista que se expressa através da voz e da melodia' },
    { word: 'CINEMAS', clue: 'Espaços onde filmes são exibidos ao público' },
    { word: 'NOVELAS', clue: 'Histórias em série transmitidas pela televisão' },
    { word: 'ARTISTA', clue: 'Pessoa que cria ou pratica uma forma de arte' },
    { word: 'QUADROS', clue: 'Pintura ou desenho em uma moldura' },
    { word: 'TEATROS', clue: 'Locais onde peças e espetáculos são encenados' },
    { word: 'MUSICAS', clue: 'Arte de combinar sons de forma harmoniosa' },
    { word: 'JORNAIS', clue: 'Publicações periódicas com notícias e informações' },
    { word: 'POESIAS', clue: 'Composições literárias com ritmo e beleza expressiva' },
  ],
};

// Converte o puzzle em uma grade de letras 2D
export function buildGrid(puzzle: PuzzleData): string[][] {
  return puzzle.words.map((pw) => pw.word.split(''));
}
