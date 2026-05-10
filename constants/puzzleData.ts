// Reviva — Dados do Puzzle
// Grade 7 colunas × 9 linhas (baseada no Figma)

export interface PuzzleWord {
  word: string;
  clues: string[];
}

export interface PuzzleData {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  words: PuzzleWord[];
  cols: number;
  rows: number;
}

export const PUZZLES: PuzzleData[] = [
  {
    id: 'level-1',
    title: 'Artes e Entretenimento',
    difficulty: 'Fácil',
    cols: 7,
    rows: 9,
    words: [
      { word: 'CANTORA', clues: ['Artista que se expressa através da voz e da melodia', 'Costuma se apresentar em shows e grava álbuns', 'Profissional da música com talento vocal'] },
      { word: 'CINEMAS', clues: ['Espaços onde filmes são exibidos ao público', 'Possui telão, poltronas e cheiro de pipoca', 'Salas escuras dedicadas à sétima arte'] },
      { word: 'NOVELAS', clues: ['Histórias em série transmitidas pela televisão', 'Dividida em capítulos e muito popular no Brasil', 'Dramaturgia que costuma passar no horário nobre'] },
      { word: 'ARTISTA', clues: ['Pessoa que cria ou pratica uma forma de arte', 'Pode ser um pintor, escultor ou ator', 'Profissional criativo e talentoso'] },
      { word: 'QUADROS', clues: ['Pintura ou desenho em uma moldura', 'Costumam ser pendurados nas paredes para decoração', 'Obras de arte expostas em galerias'] },
      { word: 'TEATROS', clues: ['Locais onde peças e espetáculos são encenados', 'Possui palco, coxias e cortinas vermelhas', 'Casa das artes cênicas e musicais'] },
      { word: 'MUSICAS', clues: ['Arte de combinar sons de forma harmoniosa', 'Pode ser tocada em instrumentos ou cantada', 'Composições sonoras que emocionam'] },
      { word: 'JORNAIS', clues: ['Publicações periódicas com notícias e informações', 'Podem ser impressos em papel ou lidos online', 'Trazem as manchetes do dia a dia'] },
      { word: 'POESIAS', clues: ['Composições literárias com ritmo e beleza expressiva', 'Muitas vezes possuem rimas e estrofes', 'Textos artísticos cheios de sentimento'] },
    ],
  },
  {
    id: 'level-2',
    title: 'Animais do Brasil',
    difficulty: 'Fácil',
    cols: 6,
    rows: 5,
    words: [
      { word: 'TUCANO', clues: ['Ave de bico longo e colorido', 'Símbolo frequente da fauna brasileira', 'Seu bico grande ajuda a pegar frutas'] },
      { word: 'JACARE', clues: ['Réptil dos rios e pântanos', 'Tem couro duro e dentes afiados', 'Primo distante dos crocodilos'] },
      { word: 'MACACO', clues: ['Primata ágil que vive em árvores', 'Adora comer bananas', 'Animal muito inteligente e brincalhão'] },
      { word: 'CORUJA', clues: ['Ave noturna símbolo da sabedoria', 'Consegue girar a cabeça quase completamente', 'Tem olhos grandes e caça à noite'] },
      { word: 'IGUANA', clues: ['Lagarto verde de hábitos arborícolas', 'Tem uma crista nas costas', 'Réptil que gosta de tomar sol nos galhos'] },
    ],
  }
];

// Converte o puzzle em uma grade de letras 2D
export function buildGrid(puzzle: PuzzleData): string[][] {
  return puzzle.words.map((pw) => pw.word.split(''));
}
