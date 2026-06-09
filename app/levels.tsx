import React, { useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { PUZZLES, THEMES, PuzzleData } from '../constants/puzzleData';
import { useProgress } from '../hooks/useProgress';
import { getLastLevel } from '../hooks/gameStorage';

// Paleta quente dos tiles (estilo do mockup)
const TILE = {
  bg: '#F6E7C1',
  bgInner: '#FBF1D5',
  border: 'rgba(255, 255, 255, 0.85)',
  text: '#5B4327',
  shadow: '#3A2C14',
  done: '#6FAE7C',
};

// Escolhe um emoji de acordo com palavras-chave do tema/título.
// (não há arquivos de ícone nos assets, então usamos emoji — sempre renderiza)
// A ordem importa: títulos específicos vêm antes dos genéricos para não colidir
// (ex.: "Festa Junina" antes de "Festa", "Estação de Trem" antes de "Viagem",
// "Na Farmácia" antes de "Saúde", "Quintal" antes de "Jardim").
function iconFor(theme: string, title: string): string {
  const s = `${theme} ${title}`.toLowerCase();
  const has = (...words: string[]) => words.some((w) => s.includes(w));

  // Cozinha
  if (has('tempero')) return '🧂';
  if (has('utensílio', 'utensilio', 'panela', 'vasilha')) return '🍳';
  if (has('cozinha', 'comida', 'lanche', 'aliment')) return '🍲';
  // Escola e letras
  if (has('escrever', 'escrita', 'tinteiro', 'leitura')) return '🖋️';
  if (has('aula', 'escola', 'material')) return '✏️';
  // Corpo e beleza
  if (has('rosto', 'sentidos', 'sorriso')) return '😊';
  if (has('banho', 'beleza', 'perfume', 'vaidade')) return '🧴';
  // Casa e jardim (quintal antes de jardim — o tema já contém "jardim")
  if (has('quintal', 'céu', 'ceu', 'natureza')) return '🏡';
  if (has('jardim', 'flor')) return '🪴';
  // Mercado
  if (has('mercado', 'compras', 'comércio', 'comercio')) return '🛒';
  // Saúde (farmácia antes de saúde para diferenciar os dois níveis)
  if (has('farmácia', 'farmacia')) return '💊';
  if (has('saúde', 'saude', 'remédio', 'remedio', 'medicina')) return '🩺';
  // Festas (junina antes de festa)
  if (has('junina', 'são joão', 'sao joao', 'fogueira')) return '🔥';
  if (has('festa', 'festeja', 'comemora', 'baile')) return '🎉';
  // Música e cinema (palco antes de cinema)
  if (has('palco', 'cantora', 'cantor')) return '🎤';
  if (has('cinema', 'filme', 'atriz', 'estrela')) return '🎬';
  // Viagens (trem antes de viagem)
  if (has('trem', 'estação', 'estacao')) return '🚂';
  if (has('viagem', 'viagens', 'passeio', 'lugares', 'transporte')) return '✈️';
  // Vida no campo (roça/cantiga antes de plantação/campo)
  if (has('roça', 'roca', 'cantiga')) return '🤠';
  if (has('plantação', 'plantacao', 'colheita', 'lavoura', 'fazenda', 'campo')) return '🌾';
  // Infância
  if (has('brincadeira', 'infância', 'infancia', 'criança', 'crianca')) return '🧸';
  // Moda
  if (has('costura', 'estilo', 'moda', 'roupa')) return '👗';

  return '🧩';
}

export default function MenuScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { progress, loading } = useProgress();

  // Caminho contínuo: todos os puzzles, na ordem dos temas (nada bloqueado)
  const levels: PuzzleData[] = useMemo(
    () =>
      THEMES.flatMap((t) =>
        t.puzzleIds
          .map((id) => PUZZLES.find((p) => p.id === id))
          .filter((p): p is PuzzleData => Boolean(p))
      ),
    []
  );

  // Geometria da trilha
  const TILE_SIZE = 152;
  const offset = width * 0.09; // deslocamento esquerda/direita dos tiles
  const rowWidth = width - 20; // largura útil (path tem paddingHorizontal 10)
  const leftCenter = offset + TILE_SIZE / 2; // centro X do tile à esquerda
  const rightCenter = rowWidth - offset - TILE_SIZE / 2; // centro X do tile à direita

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Image
            source={require('../assets/images/title.png')}
            style={[styles.titleImg, { width: width * 0.82 }]}
            resizeMode="contain"
          />

          {/* Coruja + balão de fala */}
          <View style={styles.owlRow}>
            <Image
              source={require('../assets/images/owl.png')}
              style={styles.owlImg}
              resizeMode="contain"
            />
            <View style={styles.bubble}>
              <Text style={styles.bubbleName}>Saulo:</Text>
              <Text style={styles.bubbleText}>Comece por aqui!</Text>
              <View style={styles.bubbleTail} />
            </View>
          </View>

          {/* Trilha de níveis */}
          <View style={styles.path}>
            {levels.map((p, i) => {
              const isRight = i % 2 === 1;
              const prevIsRight = (i - 1) % 2 === 1;
              const done = Boolean(progress[p.id]?.completed);
              // Trilha: sai da BORDA lateral do tile anterior, na altura baixa-média e
              // logo do lado de fora da box; termina no CENTRO da próxima box.
              const side = prevIsRight ? -1 : 1;
              const prevCenter = prevIsRight ? rightCenter : leftCenter;
              const nextCenter = isRight ? rightCenter : leftCenter;
              const start = {
                x: prevCenter + side * (TILE_SIZE / 2 + 22), // puxado rumo ao centro da tela
                y: -TILE_SIZE * 0.19, // altura baixa-média do tile
              };
              const end = {
                x: nextCenter, // metade (centro) da próxima box
                y: DOTS_HEIGHT - 22, // mais afastado da próxima box
              };
              return (
                <View key={p.id} style={styles.pathRow}>
                  {i > 0 && <Dots start={start} end={end} />}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(`/game/${p.id}`)}
                    style={[
                      styles.tile,
                      {
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        alignSelf: isRight ? 'flex-end' : 'flex-start',
                        marginLeft: isRight ? 0 : offset,
                        marginRight: isRight ? offset : 0,
                      },
                      done && styles.tileDone,
                    ]}
                  >
                    <View style={styles.tileInner}>
                      <Text style={styles.tileIcon}>{iconFor(p.theme, p.title)}</Text>
                      <Text style={styles.tileLabel} numberOfLines={2}>
                        {p.title}
                      </Text>
                    </View>
                    {done && (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Botão voltar flutuante */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Conector pontilhado em CURVA: os pontos saem do canto inferior direito do
// tile de cima (subindo um pouco) e descem em arco até o topo do próximo tile.
// startX = X do canto inferior direito do tile anterior; endX = centro X do próximo.
const DOTS_COUNT = 4;
const DOTS_HEIGHT = 64;
const DOT_SIZE = 16;

type Pt = { x: number; y: number };

function Dots({ start, end }: { start: Pt; end: Pt }) {
  // Curva quadrática de start (borda do tile) até end (centro do próximo tile).
  const S = start;
  const E = end;
  // Arco arredondado: desloca o controle para fora (lado da saída) + leve queda.
  const mx = (S.x + E.x) / 2;
  const my = (S.y + E.y) / 2;
  const BOW = 40; // quanto maior, mais arredondado
  const C = { x: mx + (E.x >= S.x ? 1 : -1) * BOW, y: my + 16 };

  const bezier = (t: number) => {
    const mt = 1 - t;
    return {
      x: mt * mt * S.x + 2 * mt * t * C.x + t * t * E.x,
      y: mt * mt * S.y + 2 * mt * t * C.y + t * t * E.y,
    };
  };

  // Amostra a curva e mede o comprimento acumulado para espaçar os pontos por
  // distância igual (amostragem uniforme em t deixaria os pontos desiguais).
  const SAMPLES = 80;
  const pts: Pt[] = [bezier(0)];
  const cum: number[] = [0];
  for (let i = 1; i <= SAMPLES; i++) {
    const p = bezier(i / SAMPLES);
    cum.push(cum[i - 1] + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y));
    pts.push(p);
  }
  const total = cum[SAMPLES];

  const pointAtLength = (target: number) => {
    let i = 1;
    while (i < SAMPLES && cum[i] < target) i++;
    const seg = cum[i] - cum[i - 1] || 1;
    const f = (target - cum[i - 1]) / seg;
    const a = pts[i - 1];
    const b = pts[i];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  };

  return (
    <View style={styles.dots} pointerEvents="none">
      {Array.from({ length: DOTS_COUNT }).map((_, k) => {
        // 1º ponto exatamente no início (borda do tile), espaçamento igual
        const p = pointAtLength((total * k) / (DOTS_COUNT - 1));
        return (
          <View
            key={k}
            style={[
              styles.dot,
              { position: 'absolute', left: p.x - DOT_SIZE / 2, top: p.y - DOT_SIZE / 2 },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 60,
  },
  titleImg: {
    height: 120,
    marginTop: 0,
  },
  owlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  owlImg: {
    width: 104,
    height: 104,
  },
  bubble: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 22,
    width: 16,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    transform: [{ rotate: '45deg' }],
  },
  bubbleName: {
    fontSize: 12,
    color: '#8A6D3B',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 17,
    color: '#3A2C14',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  path: {
    alignSelf: 'stretch',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  pathRow: {
    width: '100%',
    alignItems: 'center',
  },
  dots: {
    alignSelf: 'stretch',
    height: DOTS_HEIGHT,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#fdcc58',
    borderWidth: 2,
    borderColor: '#837359',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  tile: {
    borderRadius: 24,
    backgroundColor: TILE.bg,
    borderWidth: 4,
    borderColor: TILE.border,
    padding: 6,
    shadowColor: TILE.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
  },
  tileDone: {
    borderColor: TILE.done,
  },
  tileInner: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: TILE.bgInner,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tileIcon: {
    fontSize: 64,
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
    color: TILE.text,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  doneBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: TILE.done,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  doneBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(31, 41, 55, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backArrow: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -10,
  },
});
