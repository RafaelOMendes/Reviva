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
  onHint?: () => void;
}

export function Header({ onBack, onHint }: HeaderProps) {
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

      <Text style={styles.title}>Reviva</Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onHint}
        activeOpacity={0.7}
        accessibilityLabel="Dica"
        accessibilityRole="button"
      >
        <Text style={styles.hintIcon}>💡</Text>
      </TouchableOpacity>
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
  },
  backArrow: {
    fontSize: 22,
    color: Colors.textDark,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  hintIcon: {
    fontSize: 22,
  },
});
