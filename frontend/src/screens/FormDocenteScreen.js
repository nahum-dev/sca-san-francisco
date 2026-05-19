import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

const Campo = ({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false, error }) => (
  <View style={styles.campo}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
    />
    {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
  </View>
);

export default function FormDocenteScreen({ route, navigation }) {
  const docenteExistente = route.params?.docente || null;
  const modoEdicion      = docenteExistente !== null;

  const [form, setForm] = useState({
    nombres:      docenteExistente?.nombres      || '',
    apellidos:    docenteExistente?.apellidos    || '',
    dui:          docenteExistente?.dui          || '',
    especialidad: docenteExistente?.especialidad || '',
    telefono:     docenteExistente?.telefono     || '',
    email:        docenteExistente?.email        || '',
    password:     '',
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  const actualizar = useCallback((campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => ({ ...prev, [campo]: null }));
  }, []);

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombres.trim())   nuevosErrores.nombres   = 'Los nombres son obligatorios.';
    if (!form.apellidos.trim()) nuevosErrores.apellidos = 'Los apellidos son obligatorios.';
    if (!form.dui.trim())       nuevosErrores.dui       = 'El DUI es obligatorio.';
    if (!modoEdicion) {
      if (!form.email.trim())    nuevosErrores.email    = 'El email es obligatorio.';
      if (!form.password.trim()) nuevosErrores.password = 'La contraseña es obligatoria.';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      if (modoEdicion) {
        await api.put(`/docentes/${docenteExistente.id}`, form);
        Alert.alert('Éxito', 'Docente actualizado correctamente.');
      } else {
        await api.post('/docentes', form);
        Alert.alert('Éxito', 'Docente creado correctamente.');
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
      <Text style={styles.titulo}>{modoEdicion ? 'Editar Docente' : 'Nuevo Docente'}</Text>

      <Campo label="Nombres *"      value={form.nombres}      onChangeText={(v) => actualizar('nombres', v)}      placeholder="Nombres del docente"    error={errores.nombres} />
      <Campo label="Apellidos *"    value={form.apellidos}    onChangeText={(v) => actualizar('apellidos', v)}    placeholder="Apellidos del docente"  error={errores.apellidos} />
      <Campo label="DUI *"          value={form.dui}          onChangeText={(v) => actualizar('dui', v)}          placeholder="Ej: 01234567-8"         error={errores.dui} />
      <Campo label="Especialidad"   value={form.especialidad} onChangeText={(v) => actualizar('especialidad', v)} placeholder="Ej: Matemáticas"        error={errores.especialidad} />
      <Campo label="Teléfono"       value={form.telefono}     onChangeText={(v) => actualizar('telefono', v)}     placeholder="Ej: 7100-0001"          keyboardType="phone-pad" error={errores.telefono} />

      {!modoEdicion && (
        <>
          <Campo label="Correo *"     value={form.email}    onChangeText={(v) => actualizar('email', v)}    placeholder="correo@ejemplo.com" keyboardType="email-address" error={errores.email} />
          <Campo label="Contraseña *" value={form.password} onChangeText={(v) => actualizar('password', v)} placeholder="Contraseña de acceso" secureTextEntry error={errores.password} />
        </>
      )}

      <TouchableOpacity
        style={[styles.botonGuardar, loading && { opacity: 0.7 }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={COLORS.white} /> : (
          <Text style={styles.botonTexto}>{modoEdicion ? 'Guardar Cambios' : 'Crear Docente'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonCancelar} onPress={() => navigation.goBack()} disabled={loading}>
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
  inputError:         { borderColor: COLORS.error },
  errorTexto:         { color: COLORS.error, fontSize: 12, marginTop: 4 },
  botonGuardar:       { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botonTexto:         { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  botonCancelar:      { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  botonCancelarTexto: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
});