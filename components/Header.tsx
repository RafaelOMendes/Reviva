import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface HeaderProps {
  onBack?: () => void;
  onUseHint?: () => void;
  onReset?: () => void;
  timer?: number;
  title?: string;
  progressText?: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Header({ onBack, onUseHint, onReset, timer = 0, title = 'Reviva', progressText }: HeaderProps) {
  return (
    <BlurView
      intensity={60}
      tint="default"
      experimentalBlurMethod="dimezisBlurView"
      style={styles.container}
    >
      <View style={styles.side}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {title}
        </Text>
        {progressText ? (
          <Text style={styles.progress}>{progressText}</Text>
        ) : null}
        <Text style={styles.timer}>{formatTime(timer)}</Text>
      </View>

      <View style={[styles.side, styles.sideRight]}>
        {onReset ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onReset}
            activeOpacity={0.7}
            accessibilityLabel="Recomeçar nível"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onUseHint}
          activeOpacity={0.7}
          accessibilityLabel="Usar dica"
          accessibilityRole="button"
        >
          <Text style={styles.hintIcon}>💡</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 32,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  disabledButton: {
    opacity: 0.5,
  },
  backArrow: {
    fontSize: 28,
    color: Colors.textLight,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.3,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  timer: {
    fontSize: 16,
    color: Colors.textLight,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  progress: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Os dois lados têm a mesma largura para que o bloco central (nome, contador
  // e timer) fique exatamente no meio do header, mesmo a esquerda tendo 1 botão
  // e a direita 2 (resetar + dica).
  side: {
    width: 84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
    gap: 4,
  },
  hintIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
