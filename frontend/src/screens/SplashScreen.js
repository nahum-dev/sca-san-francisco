import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim  = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue:         1,
          tension:         50,
          friction:        7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue:         1,
          duration:        800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue:         0,
        duration:        500,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
    ]).start(() => {
      onFinish && onFinish();
    });
  }, []);

  return (
    <LinearGradient
      colors={['#2980B9', '#4A90E2', '#74B9FF']}
      style={styles.container}
    >
      {/* Círculos decorativos */}
      <View style={styles.circulo1} />
      <View style={styles.circulo2} />
      <View style={styles.circulo3} />

      {/* Logo animado */}
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity:   fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
        <View style={styles.logoCirculo}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImagen}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Textos animados */}
      <Animated.View style={[
        styles.textosContainer,
        {
          opacity:   fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
        <Text style={styles.titulo}>Centro Escolar</Text>
        <Text style={styles.subtitulo}>San Francisco de Asís</Text>
        <View style={styles.divider} />
        <Text style={styles.sistema}>Sistema de Control Académico</Text>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
        <Text style={styles.footerTexto}>© 2026 SFA — Todos los derechos reservados</Text>
      </Animated.View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },
  circulo1: {
    position:        'absolute',
    top:             -80,
    right:           -80,
    width:           250,
    height:          250,
    borderRadius:    125,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circulo2: {
    position:        'absolute',
    bottom:          -60,
    left:            -60,
    width:           200,
    height:          200,
    borderRadius:    100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circulo3: {
    position:        'absolute',
    top:             height * 0.3,
    left:            -40,
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCirculo: {
    width:           140,
    height:          140,
    borderRadius:    70,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth:     3,
    borderColor:     'rgba(255,255,255,0.8)',
    justifyContent:  'center',
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.3,
    shadowRadius:    12,
    elevation:       10,
    overflow:        'hidden',
  },
  logoImagen: {
    width:  120,
    height: 120,
  },
  textosContainer: {
    alignItems:        'center',
    paddingHorizontal: 40,
  },
  titulo: {
    color:         COLORS.white,
    fontSize:      28,
    fontWeight:    'bold',
    textAlign:     'center',
    letterSpacing: 1,
  },
  subtitulo: {
    color:         COLORS.white,
    fontSize:      22,
    fontWeight:    '600',
    textAlign:     'center',
    marginTop:     4,
    letterSpacing: 0.5,
  },
  divider: {
    width:           60,
    height:          2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical:  16,
    borderRadius:    1,
  },
  sistema: {
    color:         'rgba(255,255,255,0.85)',
    fontSize:      14,
    textAlign:     'center',
    letterSpacing: 0.5,
  },
  footer: {
    position:          'absolute',
    bottom:            40,
    alignItems:        'center',
    width:             '100%',
    paddingHorizontal: 40,
  },
  loadingBar: {
    width:           200,
    height:          3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    2,
    marginBottom:    16,
    overflow:        'hidden',
  },
  loadingProgress: {
    width:           '100%',
    height:          3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius:    2,
  },
  footerTexto: {
    color:    'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
});