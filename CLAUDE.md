# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Reviva is a React Native (Expo) crossword puzzle game. UI text and inline comments are in Portuguese (pt-BR); keep that convention when editing user-visible strings.

## Commands

```bash
npm install                 # install deps
npx expo start --tunnel     # dev server (README's recommended invocation)
npm run android             # expo start --android
npm run ios                 # expo start --ios
npm run web                 # expo start --web
```

There are no lint or test scripts configured. TypeScript runs in `strict` mode (extends `expo/tsconfig.base`); rely on the bundler / editor for type errors.

Entry point is `expo-router/entry` (set in `package.json#main`). The root-level `App.tsx` is leftover scaffolding and is **not** used — do not edit it expecting it to take effect.

## Architecture

### Routing (Expo Router, file-based under `app/`)

- `app/_layout.tsx` — root layout. Loads Plus Jakarta Sans fonts and **also owns the global background-music engine** (see Audio below).
- `app/index.tsx` — splash / welcome.
- `app/levels.tsx` — level picker.
- `app/game/[id].tsx` — gameplay screen. Reads `id` via `useLocalSearchParams` and passes it to `useGameState(id)`.

### Game state — `hooks/useGameState.ts`

This single hook is the "brain" of a puzzle. It returns a combined `GameState & GameActions` object that the game screen and child components consume directly.

Key model facts (non-obvious):

- **Puzzles are row-based, not a true 2D crossword.** `buildGrid()` in `constants/puzzleData.ts` just splits each `PuzzleWord.word` into a row. There is no shared-letter intersection logic — each row is solved independently. Row width is fixed per puzzle (`cols`).
- The user progresses row-by-row. When a row is filled correctly, `correctRows[row] = true`, the active row jumps to the next incomplete row, and `correct.mp3` plays. When all rows are correct, status becomes `'won'` and `win.mp3` plays.
- **`lockedCells[row][col]`** are cells revealed by hints. Cell selection, typing, and backspace **must all skip locked cells** — when adding new input/navigation behavior, mirror the existing `while (lockedCells[row][c]) c++/c--` loops in `handleKeyPress` / `handleBackspace` / `selectCell`.
- **Hint progression has two phases** (`useHint`): levels 0→2 reveal additional text clues for the active row; once `hintLevels[row] === 2`, further hint taps reveal 1–3 random letters and lock those cells.
- The solution grid is cached in a `useRef` at mount: `useRef(buildGrid(puzzle)).current`. Changing the active puzzle requires a remount, not a state update.

### Audio (cross-module mutable ref pattern)

`app/_layout.tsx` exports a module-level singleton:

```ts
export const bgMusicRef = { current: null as Audio.Sound | null };
```

- Background music is a **playlist auto-discovered via `require.context`** over `assets/sounds/theme_\d+\.mp3`, sorted numerically and looped. Adding `theme_4.mp3` is enough to extend the playlist — no code change.
- `useGameState` imports `bgMusicRef` directly to implement **ducking**: when `correct`/`win` plays, the bg-music volume drops from `0.15` to `0.02`, then restores after the SFX duration. If you add a new SFX, follow the same pattern in `playSound`.
- Sound effects (`correct.mp3`, `win.mp3`) are preloaded once per `useGameState` mount and unloaded on cleanup. Do not call `Audio.Sound.createAsync` per keypress.

### Progress persistence — `hooks/useProgress.ts`

`AsyncStorage` under the key `@reviva_progress`, shape `Record<puzzleId, PuzzleProgress>`. `useGameState` calls `savePuzzleProgress` on win only.

### Design tokens

`constants/colors.ts` is the palette source of truth. The font family `PlusJakartaSans_{400Regular,600SemiBold,700Bold}` is loaded once in the root layout — refer to those exact strings in `fontFamily` style props.

### Puzzle data

`constants/puzzleData.ts` imports `../niveis.json` (root) at build time (Metro/`resolveJsonModule`) and flattens it into two exports:

- `PUZZLES: PuzzleData[]` — every "assunto" (one per puzzle), id format `t{N}-s{M}` (theme/subject indices, 1-based).
- `THEMES: Theme[]` — groupings used by `app/levels.tsx`'s `SectionList`.

Each puzzle carries acrostic metadata: `palavraOculta` (the hidden vertical word), `formatoAcrostico` (`coluna_fixa` | `escada_diagonal`), `indiceColunaOculta` (null in diagonal mode), and per-word `indiceLetraOculta` (which column in that row is part of the acrostic). The game screen passes `acrosticCols = words.map(w => w.indiceLetraOculta)` to `CrosswordGrid`, which highlights those cells with the coral palette (`Colors.acrostic*`). The hidden word is revealed in the victory modal.

`difficulty` is derived from `cols` (≤5 Fácil, 6 Médio, ≥7 Difícil) since `niveis.json` doesn't carry it.
