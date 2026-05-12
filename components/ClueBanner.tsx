import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface ClueBannerProps {
  clues: string[];
}

export function ClueBanner({ clues }: ClueBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const cluesKey = clues.join('|');

  // Vai para a dica mais recente quando as dicas mudam (ex: nova dica adicionada ou troca de palavra)
  // Usamos cluesKey como dependência para não disparar toda vez que o componente pai renderizar com um novo array.
  useEffect(() => {
    if (clues.length > 0) {
      setCurrentIndex(clues.length - 1);
    }
  }, [cluesKey, clues.length]);

  // Anima a troca de texto sempre que a dica alvo mudar
  useEffect(() => {
    const targetText = clues[currentIndex] !== undefined ? clues[currentIndex] : (clues[clues.length - 1] || '');
    
    if (targetText && targetText !== displayText) {
      if (!displayText) {
        // Primeira vez (montagem), apenas define o texto sem animar
        setDisplayText(targetText);
      } else {
        // Mudança de dica, anima fade out -> troca texto -> fade in
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setDisplayText(targetText);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
        });
      }
    }
  }, [currentIndex, cluesKey]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < clues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (clues.length > 1) {
      // Opcional: voltar para a primeira dica se clicar na última? 
      // Vamos manter o comportamento de ciclo se clicar na própria dica.
      setCurrentIndex(0);
    }
  };

  const hasMultiple = clues.length > 1;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={[styles.container, hasMultiple && styles.containerWithNav]} 
        activeOpacity={hasMultiple ? 0.8 : 1}
        onPress={hasMultiple ? handleNext : undefined}
      >
        <View style={styles.headerRow}>
          <Text style={styles.label}>DICA</Text>
          {hasMultiple && (
            <Text style={styles.counterText}>{currentIndex + 1} / {clues.length}</Text>
          )}
        </View>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <Animated.Text style={[styles.clueText, { opacity: fadeAnim }]}>
            {displayText}
          </Animated.Text>
        </ScrollView>
      </TouchableOpacity>

      {hasMultiple && (
        <>
          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonLeft, currentIndex === 0 && styles.navButtonDisabled]} 
            onPress={handlePrev}
            disabled={currentIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonRight, currentIndex === clues.length - 1 && styles.navButtonDisabled]} 
            onPress={() => {
              if (currentIndex < clues.length - 1) {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            disabled={currentIndex === clues.length - 1}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    marginHorizontal: 16,
    position: 'relative',
  },
  container: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 180,
    minHeight: 80,
  },
  containerWithNav: {
    paddingHorizontal: 54, // Espaço para não encavalar com os botões
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -28, // metade da altura (56)
    width: 56,
    height: 56,
    backgroundColor: '#5C807A', // Verde um pouco mais claro que Colors.primary (#4A6762)
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  navButtonLeft: {
    left: -12,
  },
  navButtonRight: {
    right: -12,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
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
