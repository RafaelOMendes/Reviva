import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
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
  const fontSize = Math.max(19, Math.min(28, keyWidth * 0.58));

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

export function Keyboard({ onKeyPress, onBackspace }: KeyboardProps) {
  const { width, height } = useWindowDimensions();

  // Teclas calculadas dinamicamente pela largura disponível
  const availableWidth = width - H_PADDING * 2;
  const keyWidth = Math.floor((availableWidth - KEY_GAP * (KEYS_PER_ROW - 1)) / KEYS_PER_ROW);

  // Altura da tecla um pouco maior para facilitar o toque
  const keyHeight = Math.min(74, Math.max(52, height * 0.086));

  const handleKey = useCallback((k: string) => () => onKeyPress(k), [onKeyPress]);

  return (
    <View style={[styles.container, { paddingHorizontal: H_PADDING }]}>
      {/* Fundo de vidro com transição bem curta no topo */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={['transparent', '#000', '#000']}
            locations={[0, 0.06, 1]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <BlurView
          intensity={20}
          tint="default"
          experimentalBlurMethod="dimezisBlurView"
          style={[StyleSheet.absoluteFill, { opacity: 0.8 }]}
        />
      </MaskedView>

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

      {/* Linha 3 — letras (largura fixa) + apagar, deslocada à direita */}
      <View style={[styles.row, { gap: KEY_GAP, marginLeft: keyWidth * 1.3 }]}>
        {ROW3.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} keyWidth={keyWidth} keyHeight={keyHeight} />
        ))}
        <Key label="⌫" onPress={onBackspace} isSpecial flex={1} keyWidth={keyWidth} keyHeight={keyHeight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingTop: 28,
    paddingBottom: 14,
    gap: KEY_GAP,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: KEY_GAP,
  },
});
