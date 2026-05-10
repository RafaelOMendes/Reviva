import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';

interface ClueBannerProps {
  clue: string;
}

export function ClueBanner({ clue }: ClueBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>DICA</Text>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <Text style={styles.clueText}>{clue}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 180, // Limita a altura caso tenha 3 dicas longas
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  clueText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textLight,
    lineHeight: 26,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
