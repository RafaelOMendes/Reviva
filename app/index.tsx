import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { PUZZLE } from '../constants/puzzleData';
import { Header } from '../components/Header';
import { CrosswordGrid } from '../components/CrosswordGrid';
import { ClueBanner } from '../components/ClueBanner';
import { Keyboard } from '../components/Keyboard';
import { useGameState } from '../hooks/useGameState';

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const game = useGameState();
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const triggerBounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.03,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const currentClue = PUZZLE.words[game.activeRow]?.clue ?? '';

  // Em landscape (largura > altura), reduz os espaçamentos verticais
  const isLandscape = width > height;
  const sectionHeaderMb = isLandscape ? 6 : 12;
  const sectionHeaderMt = isLandscape ? 2 : 4;

  // Escala os valores do modal proporcionalmente
  const modalFontTitle = Math.min(28, width * 0.07);
  const modalPadding = Math.min(32, width * 0.08);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          onBack={() => router.back()}
          onHint={game.toggleHint}
        />

        {/* Área rolável — grade + dica */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabeçalho da seção */}
          <View style={[styles.sectionHeader, { marginBottom: sectionHeaderMb, marginTop: sectionHeaderMt }]}>
            <Text style={styles.sectionTitle}>Palavras Cruzadas</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>
                {game.correctRows.filter(Boolean).length}/{PUZZLE.rows}
              </Text>
            </View>
          </View>

          {/* Grade */}
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <CrosswordGrid
              userGrid={game.userGrid}
              activeRow={game.activeRow}
              activeCol={game.activeCol}
              correctRows={game.correctRows}
              onCellPress={game.selectCell}
            />
          </Animated.View>

          {/* Banner de dica */}
          <ClueBanner
            clue={game.showHint ? currentClue : 'Toque em 💡 para revelar a dica'}
          />
        </ScrollView>

        {/* Teclado — fixo no fundo */}
        <Keyboard
          onKeyPress={game.handleKeyPress}
          onBackspace={game.handleBackspace}
          onEnter={game.handleEnter}
        />
      </View>

      {/* Modal de Vitória */}
      <Modal
        visible={game.gameStatus === 'won'}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { padding: modalPadding, maxWidth: Math.min(380, width * 0.9) }]}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={[styles.modalTitle, { fontSize: modalFontTitle }]}>Parabéns!</Text>
            <Text style={styles.modalSubtitle}>
              Você completou todas as {PUZZLE.rows} palavras!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={game.resetGame}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Jogar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMedium,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  progressBadge: {
    backgroundColor: Colors.activeRow,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Modal de vitória
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  modalTitle: {
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modalSubtitle: {
    fontSize: 15,
    color: Colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
