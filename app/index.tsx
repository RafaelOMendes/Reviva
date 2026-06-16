import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getDailyChallenge } from '../constants/puzzleData';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Valores das animações
  const titleAnim = useRef(new Animated.Value(0)).current;
  const owlAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação flutuante para o Título (vai para cima e para baixo)
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleAnim, {
          toValue: -12, // sobe 12 pixels
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 0, // volta para a posição original
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Animação de respiração (aumentar e diminuir levemente) para a Coruja
    Animated.loop(
      Animated.sequence([
        Animated.timing(owlAnim, {
          toValue: 1.04, // aumenta 4%
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(owlAnim, {
          toValue: 1, // volta ao normal
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [titleAnim, owlAnim]);

  const handleStart = () => {
    router.push('/levels');
  };

  // Desafio diário: escolhe o nível pelo dia atual do celular.
  const today = new Date();
  const handleDaily = () => {
    const challenge = getDailyChallenge(today);
    router.push(`/game/${challenge.id}`);
  };

  return (
    <ImageBackground 
      source={require('../assets/images/background.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />

      {/* Título Animado */}
      <Animated.Image 
        source={require('../assets/images/title.png')}
        style={[
          styles.titleImage,
          { transform: [{ translateY: titleAnim }] }
        ]}
        resizeMode="contain"
      />

      {/* Coruja Animada */}
      <Animated.Image 
        source={require('../assets/images/owl.png')}
        style={[
          styles.owlImage,
          { transform: [{ scale: owlAnim }] }
        ]}
        resizeMode="contain"
      />

      {/* Botões: Começar + Desafio Diário */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>COMEÇAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dailyButton}
          activeOpacity={0.8}
          onPress={handleDaily}
          accessibilityRole="button"
          accessibilityLabel={`Desafio diário, nível de hoje, dia ${today.getDate()}`}
        >
          <Text style={styles.dailyButtonText}>🗓️  DESAFIO DIÁRIO</Text>
          <Text style={styles.dailySubtext}>Nível de hoje • dia {today.getDate()}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleImage: {
    width: width * 0.85,
    height: 180,
    marginTop: 60,
  },
  owlImage: {
    width: width * 0.8,
    flex: 1,
    marginBottom: 20,
  },
  footerContainer: {
    marginBottom: 60,
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#FFC107', // Amarelo
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#003366', // Azul escuro para o texto do botão
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 1.5,
  },
  dailyButton: {
    marginTop: 14,
    backgroundColor: '#4A6762', // Teal (Colors.primary) — contraste com o amarelo
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dailyButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 1,
  },
  dailySubtext: {
    fontSize: 13,
    color: '#EAF2F0',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
  },
});
