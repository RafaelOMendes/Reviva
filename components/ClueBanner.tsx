import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface ClueBannerProps {
  clue: string;
}

export function ClueBanner({ clue }: ClueBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>DICA</Text>
      <Text style={styles.clueText}>{clue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  clueText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textLight,
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});
