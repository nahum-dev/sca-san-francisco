import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

const Campo = ({ label, value, onChangeText, placeholder, multiline = false, error }) => (
  <View style={styles.campo}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      autoCapitalize="none"
    />
    {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
  </View>
);

export default function FormAsignaturaScreen({ route, navigation }) {
  const asignaturaExistente = route.params?.asignatura || null;
  const modoEdicion         = asignaturaExistente !== null;

  const [form, setForm] = useState({
    codigo:      asignaturaExistente?.codigo      || '',
    nombre:      asignaturaExistente?.nombre      || '',
    descripcion: asignaturaExistente?.descripcion || '',
    activa:      asignaturaExistente?.activa      ?? 1,
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  const actualizar = useCallback((campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => ({ ...prev, [campo]: null }));
  }, []);

  const validar = () => {
    const nuevosErrores = {};
    if (!form.codigo.trim()) nuevosErrores.codigo = 'El código es obligatorio.';
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      if (modoEdicion) {
        await api.put(`/asignaturas/${asignaturaExistente.id}`, form);
        Alert.alert('Éxito', 'Asignatura actualizada correctamente.');
      } else {
        await api.post('/asignaturas', form);
        Alert.alert('Éxito', 'Asignatura creada correctamente.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Ocurrió un error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>{modoEdicion ? 'Editar Asignatura' : 'Nueva Asignatura'}</Text>

      <Campo
        label="Código *"
        value={form.codigo}
        onChangeText={(v) => actualizar('codigo', v.toUpperCase())}
        placeholder="Ej: MAT-901"
        error={errores.codigo}
      />
      <Campo
        label="Nombre *"
        value={form.nombre}
        onChangeText={(v) => actualizar('nombre', v)}
        placeholder="Ej: Matemáticas"
        error={errores.nombre}
      />
      <Campo
        label="Descripción"
        value={form.descripcion}
        onChangeText={(v) => actualizar('descripcion', v)}
        placeholder="Descripción de la asignatura..."
        multiline
        error={errores.descripcion}
      />

      <TouchableOpacity
        style={[styles.botonGuardar, loading && { opacity: 0.7 }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={COLORS.white} /> : (
          <Text style={styles.botonTexto}>
            {modoEdicion ? 'Guardar Cambios' : 'Crear Asignatura'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonCancelar}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.botonCancelarTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.background },
  contenido:          { padding: 20, paddingBottom: 40 },
  titulo:             { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  campo:              { marginBottom: 16 },
  label:              { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input:              { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  inputMultiline:     { height: 90, textAlignVertical: 'top' },
  inputError:         { borderColor: COLORS.error },
  errorTexto:         { color: COLORS.error, fontSize: 12, marginTop: 4 },
  botonGuardar:       { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botonTexto:         { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  botonCancelar:      { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  botonCancelarTexto: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
});