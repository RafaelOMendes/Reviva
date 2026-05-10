import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Colors } from '../constants/colors';

const ROW1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'];
const ROW3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

const H_PADDING = 10;
const KEY_GAP = 4;
const KEYS_PER_ROW = ROW1.length; // 10 teclas na linha mais larga

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

interface KeyProps {
  label: string;
  onPress: () => void;
  isSpecial?: boolean;
  keyWidth: number;
  keyHeight: number;
  flex?: number;
}

function Key({ label, onPress, isSpecial, keyWidth, keyHeight, flex }: KeyProps) {
  const fontSize = Math.max(11, Math.min(16, keyWidth * 0.42));

  return (
    <TouchableOpacity
      style={[
        {
          width: flex ? undefined : keyWidth,
          flex: flex ?? undefined,
          height: keyHeight,
          backgroundColor: isSpecial ? Colors.keySpecialBg : Colors.keyBackground,
          borderRadius: Math.max(6, keyHeight * 0.14),
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Text
        style={{
          fontSize: isSpecial ? fontSize + 2 : fontSize,
          fontWeight: '600',
          color: isSpecial ? Colors.primary : Colors.textDark,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          includeFontPadding: false,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Keyboard({ onKeyPress, onBackspace, onEnter }: KeyboardProps) {
  const { width, height } = useWindowDimensions();

  // Teclas calculadas dinamicamente pela largura disponível
  const availableWidth = width - H_PADDING * 2;
  const keyWidth = Math.floor((availableWidth - KEY_GAP * (KEYS_PER_ROW - 1)) / KEYS_PER_ROW);

  // Altura da tecla proporcional à altura da tela (menor em telas pequenas)
  const keyHeight = Math.min(50, Math.max(36, height * 0.062));

  const handleKey = useCallback((k: string) => () => onKeyPress(k), [onKeyPress]);

  return (
    <View style={[styles.container, { paddingHorizontal: H_PADDING }]}>
      {/* Linha 1 */}
      <View style={[styles.row, { gap: KEY_GAP }]}>
        {ROW1.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} keyWidth={keyWidth} keyHeight={keyHeight} />
        ))}
      </View>

      {/* Linha 2 */}
      <View style={[styles.row, { gap: KEY_GAP }]}>
        {ROW2.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} keyWidth={keyWidth} keyHeight={keyHeight} />
        ))}
      </View>

      {/* Linha 3 — backspace + letras + enter */}
      <View style={[styles.row, { gap: KEY_GAP }]}>
        <Key label="⌫" onPress={onBackspace} isSpecial flex={1.4} keyWidth={keyWidth} keyHeight={keyHeight} />
        {ROW3.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} keyWidth={keyWidth} keyHeight={keyHeight} />
        ))}
        <Key label="↵" onPress={onEnter} isSpecial flex={1.4} keyWidth={keyWidth} keyHeight={keyHeight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gridBackground,
    paddingTop: 10,
    paddingBottom: 14,
    gap: KEY_GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: KEY_GAP,
  },
});
