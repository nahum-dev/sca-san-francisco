import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import { COLORS } from '../utils/constants';


const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]     = useState(false);
  const [showPass,   setShowPass]    = useState(false);
  const [error,      setError]       = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.login(identifier.trim(), password);
      navigation.replace('Dashboard');
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al conectar con el servidor.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Parte superior con gradiente */}
      <LinearGradient
        colors={['#2980B9', '#4A90E2']}
        style={styles.headerGradient}
      >
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />

        <View style={styles.logoContainer}>
          <View style={styles.logoCirculo}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImagen}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.headerTitulo}>Centro Escolar</Text>
        <Text style={styles.headerSubtitulo}>San Francisco de Asís</Text>
      </LinearGradient>

      {/* Formulario */}
      <View style={styles.formulario}>
        <Text style={styles.bienvenida}>Bienvenido de vuelta</Text>
        <Text style={styles.instruccion}>Ingresa tus credenciales para continuar</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcono}>⚠️</Text>
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        ) : null}

        {/* Campo usuario */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcono}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario o correo electrónico"
            placeholderTextColor={COLORS.textLight}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Campo contraseña */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcono}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={styles.showPassTexto}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Botón login */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={styles.botonWrapper}
        >
          <LinearGradient
            colors={loading ? ['#BDC3C7', '#BDC3C7'] : ['#2980B9', '#4A90E2']}
            style={styles.boton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.botonTexto}>Iniciar Sesión</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </View>

      <Text style={styles.footer}>© 2026 Centro Escolar San Francisco de Asís</Text>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    height:         height * 0.38,
    justifyContent: 'flex-end',
    alignItems:     'center',
    paddingBottom:  30,
    overflow:       'hidden',
  },
  circulo1: {
    position:        'absolute',
    top:             -60,
    right:           -60,
    width:           180,
    height:          180,
    borderRadius:    90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circulo2: {
    position:        'absolute',
    top:             20,
    left:            -40,
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCirculo: {
  width:           80,
  height:          80,
  borderRadius:    40,
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderWidth:     2,
  borderColor:     'rgba(255,255,255,0.8)',
  justifyContent:  'center',
  alignItems:      'center',
  overflow:        'hidden',
},
  logoTexto: {
    color:      COLORS.white,
    fontSize:   24,
    fontWeight: 'bold',
  },
  headerTitulo: {
    color:      COLORS.white,
    fontSize:   22,
    fontWeight: 'bold',
  },
  headerSubtitulo: {
    color:     'rgba(255,255,255,0.85)',
    fontSize:  16,
    marginTop: 4,
  },
  formulario: {
    flex:              1,
    backgroundColor:   COLORS.white,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    marginTop:         -20,
    padding:           28,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: -4 },
    shadowOpacity:     0.08,
    shadowRadius:      12,
    elevation:         8,
  },
  bienvenida: {
    fontSize:     22,
    fontWeight:   'bold',
    color:        COLORS.text,
    marginBottom: 4,
  },
  instruccion: {
    fontSize:     14,
    color:        COLORS.textLight,
    marginBottom: 24,
  },
  errorBox: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#FDECEA',
    borderRadius:    10,
    padding:         12,
    marginBottom:    16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    gap:             8,
  },
  errorIcono: { fontSize: 16 },
  errorTexto: {
    color:    COLORS.error,
    fontSize: 13,
    flex:     1,
  },
  inputContainer: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   COLORS.background,
    borderRadius:      12,
    paddingHorizontal: 14,
    marginBottom:      14,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  inputIcono: {
    fontSize:    18,
    marginRight: 10,
  },
  input: {
    flex:          1,
    paddingVertical: 14,
    fontSize:      15,
    color:         COLORS.text,
  },
  showPassTexto: {
    fontSize: 18,
    padding:  4,
  },
  botonWrapper: {
    marginTop:    8,
    borderRadius: 12,
    overflow:     'hidden',
    elevation:    4,
  },
  boton: {
    paddingVertical: 16,
    alignItems:      'center',
    borderRadius:    12,
  },
  botonTexto: {
    color:         COLORS.white,
    fontSize:      16,
    fontWeight:    'bold',
    letterSpacing: 0.5,
  },
  footer: {
    textAlign:        'center',
    color:            COLORS.textLight,
    fontSize:         11,
    paddingVertical:  16,
    backgroundColor:  COLORS.white,
  },
  logoImagen: {
  width:  60,
  height: 60,
},
});