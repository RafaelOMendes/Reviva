import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { PUZZLE } from '../constants/puzzleData';

const COLS = PUZZLE.cols;
const ROW_NUMBER_WIDTH = 22; // largura reservada para o número da linha
const GRID_H_PADDING = 12;   // padding interno da grade
const GRID_MARGIN = 16;      // margem horizontal da grade
const CELL_GAP = 4;

interface CrosswordGridProps {
  userGrid: string[][];
  activeRow: number;
  activeCol: number;
  correctRows: boolean[];
  onCellPress: (row: number, col: number) => void;
}

interface CellProps {
  letter: string;
  isActive: boolean;
  isActiveRow: boolean;
  isCorrect: boolean;
  size: number;
  onPress: () => void;
}

function Cell({ letter, isActive, isActiveRow, isCorrect, size, onPress }: CellProps) {
  let bgColor = Colors.cellBackground;
  let borderColor = Colors.cellBorder;
  let textColor = Colors.textDark;

  if (isCorrect) {
    bgColor = Colors.cellCorrect;
    borderColor = Colors.cellCorrect;
    textColor = Colors.cellCorrectText;
  } else if (isActive) {
    bgColor = Colors.cellBackground;
    borderColor = Colors.primary;
  } else if (isActiveRow) {
    bgColor = Colors.activeRow;
    borderColor = Colors.activeRow;
  }

  const fontSize = Math.max(10, Math.min(18, size * 0.46));

  return (
    <TouchableOpacity
      style={[
        {
          width: size,
          height: size,
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: isActive ? 2 : 1,
          borderRadius: Math.max(4, size * 0.12),
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={{
          fontSize,
          fontWeight: '600',
          color: textColor,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          textTransform: 'uppercase',
          includeFontPadding: false,
        }}
      >
        {letter}
      </Text>
    </TouchableOpacity>
  );
}

export function CrosswordGrid({
  userGrid,
  activeRow,
  activeCol,
  correctRows,
  onCellPress,
}: CrosswordGridProps) {
  const { width } = useWindowDimensions();

  // Recalcula o tamanho da célula sempre que a largura mudar
  const availableWidth =
    width - GRID_MARGIN * 2 - GRID_H_PADDING * 2 - ROW_NUMBER_WIDTH - CELL_GAP * (COLS - 1);
  const cellSize = Math.floor(availableWidth / COLS);

  const handlePress = useCallback(
    (row: number, col: number) => () => onCellPress(row, col),
    [onCellPress]
  );

  return (
    <View style={[styles.container, { marginHorizontal: GRID_MARGIN }]}>
      {userGrid.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          <View style={styles.rowNumberContainer}>
            <Text style={styles.rowNumber}>{rowIdx + 1}</Text>
          </View>
          {row.map((letter, colIdx) => (
            <Cell
              key={`${rowIdx}-${colIdx}`}
              letter={letter}
              isActive={rowIdx === activeRow && colIdx === activeCol}
              isActiveRow={rowIdx === activeRow && !correctRows[rowIdx]}
              isCorrect={correctRows[rowIdx]}
              size={cellSize}
              onPress={handlePress(rowIdx, colIdx)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gridBackground,
    borderRadius: 16,
    padding: GRID_H_PADDING,
    gap: CELL_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: CELL_GAP,
    alignItems: 'center',
  },
  rowNumberContainer: {
    width: ROW_NUMBER_WIDTH,
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  rowNumber: {
    fontSize: 10,
    color: Colors.textMedium,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
