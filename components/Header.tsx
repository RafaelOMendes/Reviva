import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';

interface HeaderProps {
  onBack?: () => void;
  onUseHint?: () => void;
  timer?: number;
  title?: string;
  progressText?: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Header({ onBack, onUseHint, timer = 0, title = 'Reviva', progressText }: HeaderProps) {
  return (
    <BlurView
      intensity={60}
      tint="default"
      experimentalBlurMethod="dimezisBlurView"
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityLabel="Voltar"
        accessibilityRole="button"
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <View style={styles.centerContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {progressText ? (
          <Text style={styles.progress}>{progressText}</Text>
        ) : null}
        <Text style={styles.timer}>{formatTime(timer)}</Text>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onUseHint}
          activeOpacity={0.7}
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
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.5,
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
  rightActions: {
    flexDirection: 'row',
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
