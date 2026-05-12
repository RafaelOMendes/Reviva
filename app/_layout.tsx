import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export const bgMusicRef = { current: null as Audio.Sound | null };

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Buscar todos os arquivos theme_X.mp3 dinamicamente
  const themeFilesRef = useRef<any[]>([]);
  useEffect(() => {
    try {
      // @ts-ignore - require.context é suportado pelo Metro no Expo Router
      const themeContext = require.context('../assets/sounds', false, /theme_\d+\.mp3$/);
      themeFilesRef.current = themeContext.keys()
        .sort((a: string, b: string) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
          const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
          return numA - numB;
        })
        .map((key: string) => themeContext(key));
    } catch (error) {
      console.log('Error loading themes:', error);
    }
  }, []);

  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const currentThemeIndex = useRef(0);

  // Lógica para tocar a música de fundo sequencialmente em todo o app
  useEffect(() => {
    let isMounted = true;

    async function playBackgroundMusic() {
      if (themeFilesRef.current.length === 0) {
         setTimeout(() => {
           if (isMounted) playBackgroundMusic();
         }, 500);
         return;
      }

      try {
        const asset = themeFilesRef.current[currentThemeIndex.current];
        const { sound } = await Audio.Sound.createAsync(
          asset,
          { shouldPlay: true, volume: 0.15 } // Volume baixo
        );

        if (!isMounted) {
          sound.unloadAsync();
          return;
        }

        backgroundMusic.current = sound;
        bgMusicRef.current = sound;

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded && status.didJustFinish && !status.isLooping) {
            // Toca a próxima
            currentThemeIndex.current = (currentThemeIndex.current + 1) % themeFilesRef.current.length;
            await sound.unloadAsync();
            if (isMounted) {
              playBackgroundMusic();
            }
          }
        });
      } catch (error) {
        console.log('Error playing background music:', error);
      }
    }

    playBackgroundMusic();

    return () => {
      isMounted = false;
      backgroundMusic.current?.unloadAsync();
      bgMusicRef.current = null;
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      />
    </SafeAreaProvider>
  );
}
