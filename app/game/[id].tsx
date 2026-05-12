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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/Header';
import { CrosswordGrid } from '../../components/CrosswordGrid';
import { ClueBanner } from '../../components/ClueBanner';
import { Keyboard } from '../../components/Keyboard';
import { useGameState } from '../../hooks/useGameState';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function GameScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  
  // hook recebe o id do puzzle (fallback para level-1 se não tiver)
  const game = useGameState((id as string) || 'level-1');
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // triggerBounce não é mais estritamente necessário aqui, a animação vai para o Cell
  // O nível atual da dica (0 a 2)
  const hintLevel = game.hintLevels[game.activeRow] || 0;
  const wordClues = game.puzzle?.words[game.activeRow]?.clues || [];
  const activeClues = wordClues.slice(0, hintLevel + 1);

  const isLandscape = width > height;

  const modalFontTitle = Math.min(28, width * 0.07);
  const modalPadding = Math.min(32, width * 0.08);

  if (!game.puzzle) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Header
          title={game.puzzle.title}
          progressText={`${game.correctRows.filter(Boolean).length}/${game.puzzle.rows} palavras`}
          onBack={() => router.replace('/levels')}
          onUseHint={game.useHint}
          timer={game.timer}
        />

        <View style={styles.mainArea}>
          <View style={styles.gridWrapper}>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <CrosswordGrid
                userGrid={game.userGrid}
                activeRow={game.activeRow}
                activeCol={game.activeCol}
                correctRows={game.correctRows}
                lockedCells={game.lockedCells}
                onCellPress={game.selectCell}
              />
            </Animated.View>
          </View>

          <View style={styles.bannerWrapper}>
            <ClueBanner clues={activeClues} />
          </View>
        </View>

        <Keyboard
          onKeyPress={game.handleKeyPress}
          onBackspace={game.handleBackspace}
          onEnter={game.handleEnter}
        />
      </View>

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
              Você completou o puzzle no tempo de {formatTime(game.timer)}!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => router.replace('/levels')}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Voltar ao Menu</Text>
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
  mainArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  gridWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bannerWrapper: {
    marginVertical: 4,
  },
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
