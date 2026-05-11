import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { PUZZLES } from '../constants/puzzleData';
import { useProgress } from '../hooks/useProgress';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function MenuScreen() {
  const router = useRouter();
  const { progress, loading } = useProgress();

  const handleSelectPuzzle = (id: string) => {
    router.push(`/game/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Reviva</Text>
            <Text style={styles.subtitle}>Selecione um Puzzle</Text>
          </View>
        </View>

        {!loading && (
          <FlatList
            data={PUZZLES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const pData = progress[item.id];
              const isCompleted = pData?.completed;

              return (
                <TouchableOpacity
                  style={[styles.card, isCompleted && styles.cardCompleted]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectPuzzle(item.id)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, isCompleted && styles.textCompleted]}>
                      {item.title}
                    </Text>
                    {isCompleted && (
                      <Text style={styles.badgeEmoji}>✅</Text>
                    )}
                  </View>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.difficulty}>
                      Dificuldade: {item.difficulty}
                    </Text>
                    {isCompleted && pData.timeSpent > 0 && (
                      <Text style={styles.stats}>
                        Tempo: {formatTime(pData.timeSpent)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 28,
    color: Colors.textDark,
    fontWeight: '600',
  },
  headerTitles: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMedium,
    marginTop: 8,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  listContent: {
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.gridBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardCompleted: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F1F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    fontFamily: 'PlusJakartaSans_700Bold',
    flex: 1,
  },
  textCompleted: {
    color: Colors.primary,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficulty: {
    fontSize: 14,
    color: Colors.textMedium,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  stats: {
    fontSize: 14,
    color: Colors.textMedium,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});
