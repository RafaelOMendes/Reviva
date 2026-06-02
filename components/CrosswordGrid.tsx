import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';

const GRID_H_PADDING = 12;
const GRID_MARGIN = 16;
const CELL_GAP = 4;

interface CrosswordGridProps {
  userGrid: string[][];
  activeRow: number;
  activeCol: number;
  correctRows: boolean[];
  lockedCells: boolean[][];
  onCellPress: (row: number, col: number) => void;
  scrollViewRef?: React.RefObject<any>;
  acrosticCols?: number[]; // coluna da letra do acróstico por linha
}

interface CellProps {
  letter: string;
  isActive: boolean;
  isActiveRow: boolean;
  isCorrect: boolean;
  isLocked: boolean;
  isAcrostic: boolean;
  size: number;
  onPress: () => void;
}

function Cell({ letter, isActive, isActiveRow, isCorrect, isLocked, isAcrostic, size, onPress }: CellProps) {
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Flash verde ao acertar
  useEffect(() => {
    if (isCorrect) {
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [isCorrect, flashAnim]);

  let baseBgColor = Colors.cellBackground;
  let borderColor = Colors.cellBorder;
  let textColor = Colors.textDark;

  if (isCorrect) {
    baseBgColor = isAcrostic ? Colors.acrosticCorrect : Colors.cellCorrect;
    borderColor = isAcrostic ? Colors.acrosticCorrect : Colors.cellCorrect;
    textColor = isAcrostic ? Colors.acrosticCorrectText : Colors.cellCorrectText;
  } else if (isLocked) {
    baseBgColor = '#E2E8F0';
    borderColor = '#CBD5E1';
    textColor = Colors.primary;
  } else if (isActive) {
    baseBgColor = isAcrostic ? Colors.acrosticBg : Colors.cellBackground;
    borderColor = Colors.primary;
  } else if (isActiveRow) {
    baseBgColor = isAcrostic ? Colors.acrosticActiveRow : Colors.activeRow;
    borderColor = isAcrostic ? Colors.acrosticBorder : Colors.activeRow;
  } else if (isAcrostic) {
    baseBgColor = Colors.acrosticBg;
    borderColor = Colors.acrosticBorder;
    textColor = Colors.secondary;
  }

  // Interpola para um verde claro durante o flash
  const animatedBgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseBgColor, '#A7F3D0']
  });

  const fontSize = Math.max(10, Math.min(18, size * 0.46));

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.8}
      onPress={isLocked ? undefined : onPress}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            backgroundColor: animatedBgColor,
            borderColor: borderColor,
            borderWidth: isActive ? 2 : 1,
            borderRadius: Math.max(4, size * 0.12),
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
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
      </Animated.View>
    </TouchableOpacity>
  );
}

export function CrosswordGrid({
  userGrid,
  activeRow,
  activeCol,
  correctRows,
  lockedCells,
  onCellPress,
  scrollViewRef,
  acrosticCols,
}: CrosswordGridProps) {
  const { width, height } = useWindowDimensions();
  
  if (!userGrid || userGrid.length === 0) return null;

  const COLS = userGrid[0].length;
  const ROWS = userGrid.length;

  const availableWidth =
    width - GRID_MARGIN * 2 - GRID_H_PADDING * 2 - CELL_GAP * (COLS - 1);
    
  // Estimativa de altura: Altura total - (Header ~70 + Teclado ~40-50% da largura + Margens/Banner ~200)
  const estimatedOtherElementsHeight = Math.min(width * 0.5, height * 0.4) + 200;
  const availableHeight = height - estimatedOtherElementsHeight - (GRID_H_PADDING * 2) - (CELL_GAP * (ROWS - 1));
  
  const widthCellSize = Math.floor(availableWidth / COLS);
  const heightCellSize = Math.floor(availableHeight / ROWS);
  
  // Garante que o tamanho não seja negativo nem grande demais, e escolhe o menor para caber na tela
  const cellSize = Math.max(10, Math.min(widthCellSize, heightCellSize));

  // Efeito para rolar automaticamente até a linha ativa
  useEffect(() => {
    if (scrollViewRef?.current) {
      const yOffset = GRID_H_PADDING + activeRow * (cellSize + CELL_GAP);
      // Tenta centralizar a linha ativa com base no availableHeight
      const scrollPosition = Math.max(0, yOffset - availableHeight / 2 + cellSize / 2);
      
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  }, [activeRow, cellSize, availableHeight, scrollViewRef]);

  const handlePress = useCallback(
    (row: number, col: number) => () => onCellPress(row, col),
    [onCellPress]
  );

  return (
    <View style={[styles.container, { marginHorizontal: GRID_MARGIN }]}>
      {userGrid.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((letter, colIdx) => (
            <Cell
              key={`${rowIdx}-${colIdx}`}
              letter={letter}
              isActive={rowIdx === activeRow && colIdx === activeCol}
              isActiveRow={rowIdx === activeRow && !correctRows[rowIdx]}
              isCorrect={correctRows[rowIdx]}
              isLocked={lockedCells?.[rowIdx]?.[colIdx] || false}
              isAcrostic={acrosticCols?.[rowIdx] === colIdx}
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
});
