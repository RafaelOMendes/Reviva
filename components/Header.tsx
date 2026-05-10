import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface HeaderProps {
  onBack?: () => void;
  onUseHint?: () => void;
  timer?: number;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Header({ onBack, onUseHint, timer = 0 }: HeaderProps) {
  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>Reviva</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    backgroundColor: Colors.background,
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
    color: Colors.textDark,
    fontWeight: '600',
  },
  centerContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  timer: {
    fontSize: 16,
    color: Colors.textMedium,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
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
