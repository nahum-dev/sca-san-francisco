import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Campo = ({ label, value, onChangeText, placeholder, error, showToggle, show, onToggle }) => (
  <View style={styles.campo}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputContainer, error && styles.inputError]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
        autoCapitalize="none"
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={styles.toggleBtn}>
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={COLORS.textLight}
          />
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
  </View>
);

export default function CambiarPasswordScreen({ navigation }) {
  const [form, setForm] = useState({
    password_actual: '',
    password_nueva:  '',
    confirmar:       '',
  });

  const [show, setShow] = useState({
    actual:   false,
    nueva:    false,
    confirmar: false,
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const actualizar = useCallback((campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => ({ ...prev, [campo]: null }));
  }, []);

  const toggleShow = useCallback((campo) => {
    setShow(prev => ({ ...prev, [campo]: !prev[campo] }));
  }, []);

  const validar = () => {
    const nuevosErrores = {};

    if (!form.password_actual.trim()) {
      nuevosErrores.password_actual = 'La contraseña actual es obligatoria.';
    }
    if (!form.password_nueva.trim()) {
      nuevosErrores.password_nueva = 'La nueva contraseña es obligatoria.';
    } else if (form.password_nueva.length < 6) {
      nuevosErrores.password_nueva = 'Debe tener al menos 6 caracteres.';
    }
    if (!form.confirmar.trim()) {
      nuevosErrores.confirmar = 'Confirma tu nueva contraseña.';
    } else if (form.password_nueva !== form.confirmar) {
      nuevosErrores.confirmar = 'Las contraseñas no coinciden.';
    }
    if (form.password_actual === form.password_nueva) {
      nuevosErrores.password_nueva = 'La nueva contraseña debe ser diferente a la actual.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleCambiar = async () => {
  if (!validar()) return;
  setLoading(true);

  try {
    // Verificar token
    const token = await AsyncStorage.getItem('token');
    console.log('Token existe:', token ? 'SI' : 'NO');
    console.log('Datos del form:', {
      actual: form.password_actual,
      nueva:  form.password_nueva,
    });

    const response = await api.post('/auth/cambiar-password', {
      password_actual: form.password_actual,
      password_nueva:  form.password_nueva,
    });

    console.log('Respuesta:', response.data);

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');

    Alert.alert(
      'Éxito',
      'Contraseña actualizada. Inicia sesión con tu nueva contraseña.',
      [{ text: 'Aceptar', onPress: () => navigation.replace('Login') }]
    );
  } catch (err) {
    console.log('Error status:', err.response?.status);
    console.log('Error data:', err.response?.data);
    console.log('Error message:', err.message);
    Alert.alert('Error', err.response?.data?.message || err.message || 'Error desconocido.');
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>

      {/* Header */}
      <LinearGradient
        colors={['#2980B9', '#4A90E2']}
        style={styles.header}
      >
        <View style={styles.headerIconoContainer}>
          <Ionicons name="lock-closed" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.headerTitulo}>Cambiar Contraseña</Text>
        <Text style={styles.headerSub}>
          Por seguridad usa una contraseña fuerte
        </Text>
      </LinearGradient>

      {/* Formulario */}
      <View style={styles.formulario}>

        <Campo
          label="Contraseña Actual *"
          value={form.password_actual}
          onChangeText={(v) => actualizar('password_actual', v)}
          placeholder="Ingresa tu contraseña actual"
          error={errores.password_actual}
          showToggle
          show={show.actual}
          onToggle={() => toggleShow('actual')}
        />

        <Campo
          label="Nueva Contraseña *"
          value={form.password_nueva}
          onChangeText={(v) => actualizar('password_nueva', v)}
          placeholder="Mínimo 6 caracteres"
          error={errores.password_nueva}
          showToggle
          show={show.nueva}
          onToggle={() => toggleShow('nueva')}
        />

        <Campo
          label="Confirmar Nueva Contraseña *"
          value={form.confirmar}
          onChangeText={(v) => actualizar('confirmar', v)}
          placeholder="Repite tu nueva contraseña"
          error={errores.confirmar}
          showToggle
          show={show.confirmar}
          onToggle={() => toggleShow('confirmar')}
        />

        {/* Indicador de seguridad */}
        {form.password_nueva.length > 0 && (
          <View style={styles.seguridadContainer}>
            <Text style={styles.seguridadLabel}>Seguridad:</Text>
            <View style={styles.seguridadBarra}>
              <View style={[
                styles.seguridadProgreso,
                {
                  width: form.password_nueva.length < 6  ? '25%' :
                         form.password_nueva.length < 8  ? '50%' :
                         form.password_nueva.length < 12 ? '75%' : '100%',
                  backgroundColor:
                    form.password_nueva.length < 6  ? '#E74C3C' :
                    form.password_nueva.length < 8  ? '#F39C12' :
                    form.password_nueva.length < 12 ? '#3498DB' : '#27AE60',
                },
              ]} />
            </View>
            <Text style={[styles.seguridadTexto, {
              color: form.password_nueva.length < 6  ? '#E74C3C' :
                     form.password_nueva.length < 8  ? '#F39C12' :
                     form.password_nueva.length < 12 ? '#3498DB' : '#27AE60',
            }]}>
              {form.password_nueva.length < 6  ? 'Muy débil' :
               form.password_nueva.length < 8  ? 'Débil'     :
               form.password_nueva.length < 12 ? 'Fuerte'    : 'Muy fuerte'}
            </Text>
          </View>
        )}

        {/* Botón */}
        <TouchableOpacity
          onPress={handleCambiar}
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
              <Text style={styles.botonTexto}>Actualizar Contraseña</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonCancelar}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.background },
  contenido:          { paddingBottom: 40 },
  header:             { padding: 32, alignItems: 'center' },
  headerIconoContainer: { marginBottom: 12 },
  headerIcono:        { fontSize: 48, marginBottom: 12 },
  headerTitulo:       { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  headerSub:          { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 6, textAlign: 'center' },
  formulario:         { padding: 24 },
  campo:              { marginBottom: 16 },
  label:              { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  inputContainer:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14 },
  inputError:         { borderColor: COLORS.error },
  input:              { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
  toggleBtn:          { padding: 4 },
  toggleTexto:        { fontSize: 18 },
  errorTexto:         { color: COLORS.error, fontSize: 12, marginTop: 4 },
  seguridadContainer: { marginBottom: 20 },
  seguridadLabel:     { fontSize: 13, color: COLORS.textLight, marginBottom: 6 },
  seguridadBarra:     { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  seguridadProgreso:  { height: 6, borderRadius: 3 },
  seguridadTexto:     { fontSize: 12, fontWeight: '600' },
  botonWrapper:       { borderRadius: 10, overflow: 'hidden', elevation: 4, marginTop: 8 },
  boton:              { paddingVertical: 16, alignItems: 'center' },
  botonTexto:         { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  botonCancelar:      { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  botonCancelarTexto: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
});