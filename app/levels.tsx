import React, { useMemo, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { PUZZLES, THEMES, PuzzleData } from '../constants/puzzleData';
import { Colors } from '../constants/colors';
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

  // --- Autoscroll para o último nível aberto ---
  const scrollRef = useRef<ScrollView>(null);
  const pathYRef = useRef(0);            // posição vertical do container da trilha
  const pathReadyRef = useRef(false);
  const rowYRef = useRef<Record<string, number>>({}); // y de cada tile dentro da trilha
  const pendingScrollRef = useRef<string | null>(null);

  const tryScroll = useCallback(() => {
    const id = pendingScrollRef.current;
    if (!id || !pathReadyRef.current) return;
    const ry = rowYRef.current[id];
    if (ry == null) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, pathYRef.current + ry - 120), animated: true });
    pendingScrollRef.current = null;
  }, []);

  // Roda toda vez que a tela ganha foco (abertura e volta de um nível).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getLastLevel().then((id) => {
        if (!active || !id) return;
        pendingScrollRef.current = id;
        tryScroll();                       // tenta já (layout pode estar pronto)
        requestAnimationFrame(tryScroll);  // e de novo no próximo frame
      });
      return () => {
        active = false;
      };
    }, [tryScroll])
  );

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

  // Todos os níveis concluídos? (muda a mensagem do cartão final)
  const allDone = useMemo(
    () => !loading && levels.length > 0 && levels.every((p) => progress[p.id]?.completed),
    [loading, levels, progress]
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
          ref={scrollRef}
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
          <View
            style={styles.path}
            onLayout={(e) => {
              pathYRef.current = e.nativeEvent.layout.y;
              pathReadyRef.current = true;
              tryScroll();
            }}
          >
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
                <View
                  key={p.id}
                  style={styles.pathRow}
                  onLayout={(e) => {
                    rowYRef.current[p.id] = e.nativeEvent.layout.y;
                    tryScroll();
                  }}
                >
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

          {/* Fim da trilha: mensagem carinhosa + easter egg do Saulo */}
          <TrailEnd allDone={allDone} />
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

// --- Fim da trilha ---------------------------------------------------------
// Cartão de encerramento mostrado abaixo do último nível. Avisa, com um tom
// afetuoso pensado para a terceira idade, que novos níveis estão a caminho —
// e esconde um easter egg: tocar no Saulo algumas vezes revela um recadinho
// secreto com uma chuvinha de corações. A dica "psiu" deixa o segredo
// descobrível para quem não está acostumado a procurar.
const SECRET_AT = 5; // toques na coruja até liberar o segredo
const HEART_EMOJIS = ['💛', '🌻', '🌟', '🌷', '✨', '💛'];

// Frases do Saulo a cada toque, antes de revelar o segredo.
const SAULO_PHRASES = [
  'Você é especial demais! 💛',
  'Cada palavra sua vale ouro.',
  'Que orgulho de você!',
  'Mais um toquinho, vai…',
];

function TrailEnd({ allDone }: { allDone: boolean }) {
  const [secret, setSecret] = useState(false);
  const [phrase, setPhrase] = useState('Psiu… toque em mim! 🦉');
  const tapsRef = useRef(0);

  const owlScale = useRef(new Animated.Value(1)).current;
  const secretAnim = useRef(new Animated.Value(0)).current;
  const hearts = useRef(HEART_EMOJIS.map(() => new Animated.Value(0))).current;

  const tapOwl = useCallback(() => {
    // Pulinho da coruja a cada toque
    Animated.sequence([
      Animated.spring(owlScale, { toValue: 1.18, useNativeDriver: true, speed: 50, bounciness: 16 }),
      Animated.spring(owlScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 16 }),
    ]).start();

    if (secret) return; // segredo já revelado: só o pulinho continua

    const next = tapsRef.current + 1;
    tapsRef.current = next;

    if (next >= SECRET_AT) {
      setSecret(true);
      setPhrase('Você achou o meu segredo! 🌟');
      Animated.spring(secretAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
      // Corações sobem e somem
      hearts.forEach((h, i) => {
        h.setValue(0);
        Animated.timing(h, {
          toValue: 1,
          duration: 1500,
          delay: i * 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    } else {
      setPhrase(SAULO_PHRASES[(next - 1) % SAULO_PHRASES.length]);
    }
  }, [secret, owlScale, secretAnim, hearts]);

  return (
    <View style={styles.endCard}>
      {/* Corações flutuantes do easter egg */}
      <View style={styles.heartsLayer} pointerEvents="none">
        {hearts.map((h, i) => {
          const translateY = h.interpolate({ inputRange: [0, 1], outputRange: [0, -150] });
          const opacity = h.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] });
          const drift = (i % 2 === 0 ? -1 : 1) * (14 + (i % 3) * 10);
          const translateX = h.interpolate({ inputRange: [0, 1], outputRange: [0, drift] });
          return (
            <Animated.Text
              key={i}
              style={[
                styles.heart,
                { left: `${18 + i * 12}%`, opacity, transform: [{ translateY }, { translateX }] },
              ]}
            >
              {HEART_EMOJIS[i]}
            </Animated.Text>
          );
        })}
      </View>

      {/* Saulo (tocável) + balão de fala */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={tapOwl}
        accessibilityRole="button"
        accessibilityLabel="Toque na coruja Saulo para uma surpresa"
      >
        <Animated.Image
          source={require('../assets/images/owl.png')}
          style={[styles.endOwl, { transform: [{ scale: owlScale }] }]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.endBubble}>
        <Text style={styles.endBubbleText}>{phrase}</Text>
      </View>

      <Text style={styles.endTitle}>
        {allDone ? 'Você concluiu tudo! 🏆' : 'Fim da trilha… por enquanto! 🌻'}
      </Text>

      <Text style={styles.endBody}>
        Novos níveis já estão sendo preparados com muito carinho e chegam em breve.
        Enquanto isso, descanse, tome um cafezinho e volte sempre que quiser — o Saulo
        vai estar aqui te esperando. 💛
      </Text>

      {secret ? (
        <Animated.View
          style={[
            styles.secretBox,
            {
              opacity: secretAnim,
              transform: [
                { scale: secretAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
              ],
            },
          ]}
        >
          <Text style={styles.secretTitle}>🌟 Segredo do Saulo 🌟</Text>
          <Text style={styles.secretText}>
            A sua dedicação é o nosso maior presente. Obrigado por jogar com a gente!
          </Text>
        </Animated.View>
      ) : (
        <Text style={styles.endHint}>Psiu… será que a corujinha guarda um segredo?</Text>
      )}
    </View>
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
  // --- Cartão de fim de trilha ---
  endCard: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: TILE.border,
    shadowColor: TILE.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
  },
  heartsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  heart: {
    position: 'absolute',
    bottom: 64,
    fontSize: 30,
  },
  endOwl: {
    width: 110,
    height: 110,
  },
  endBubble: {
    backgroundColor: '#FBF1D5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    minHeight: 38,
    justifyContent: 'center',
  },
  endBubbleText: {
    fontSize: 16,
    color: '#5B4327',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  endTitle: {
    fontSize: 22,
    color: '#3A2C14',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 10,
  },
  endBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5B4327',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  endHint: {
    fontSize: 14,
    color: '#8A6D3B',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 16,
    fontStyle: 'italic',
  },
  secretBox: {
    marginTop: 18,
    backgroundColor: Colors.acrosticBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.acrosticBorder,
  },
  secretTitle: {
    fontSize: 15,
    color: Colors.secondary,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  secretText: {
    fontSize: 16,
    lineHeight: 23,
    color: '#5B4327',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
