import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

const Campo = ({ label, value, onChangeText, placeholder, keyboardType = 'default', error }) => (
  <View style={styles.campo}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
    {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
  </View>
);

const Selector = ({ label, items, valorSeleccionado, onSeleccionar, error }) => (
  <View style={styles.campo}>
    <Text style={styles.label}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[styles.selectorBtn, valorSeleccionado === item.id && styles.selectorBtnActivo]}
          onPress={() => onSeleccionar(item.id)}
        >
          <Text style={[styles.selectorTexto, valorSeleccionado === item.id && styles.selectorTextoActivo]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
  </View>
);

export default function FormCursoScreen({ route, navigation }) {
  const cursoExistente = route.params?.curso || null;
  const modoEdicion    = cursoExistente !== null;

  const [form, setForm] = useState({
    asignatura_id: cursoExistente?.asignatura_id || null,
    docente_id:    cursoExistente?.docente_id    || null,
    anio_escolar:  cursoExistente?.anio_escolar  || new Date().getFullYear().toString(),
    periodo:       cursoExistente?.periodo       || '',
    grado:         cursoExistente?.grado         || '',
    seccion:       cursoExistente?.seccion       || '',
  });

  const [asignaturas, setAsignaturas] = useState([]);
  const [docentes,    setDocentes]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [cargando,    setCargando]    = useState(true);
  const [errores,     setErrores]     = useState({});

  const PERIODOS = [
    { id: '1er Trimestre', label: '1er Trimestre' },
    { id: '2do Trimestre', label: '2do Trimestre' },
    { id: '3er Trimestre', label: '3er Trimestre' },
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resAsig, resDoc] = await Promise.all([
        api.get('/asignaturas'),
        api.get('/docentes'),
      ]);

      setAsignaturas(resAsig.data.data.map(a => ({
        id:    a.id,
        label: `${a.codigo} - ${a.nombre}`,
      })));

      setDocentes(resDoc.data.data.map(d => ({
        id:    d.id,
        label: `${d.apellidos}, ${d.nombres}`,
      })));
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  };

  const actualizar = useCallback((campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => ({ ...prev, [campo]: null }));
  }, []);

  const validar = () => {
    const nuevosErrores = {};
    if (!form.asignatura_id) nuevosErrores.asignatura_id = 'Selecciona una asignatura.';
    if (!form.docente_id)    nuevosErrores.docente_id    = 'Selecciona un docente.';
    if (!form.anio_escolar)  nuevosErrores.anio_escolar  = 'El año es obligatorio.';
    if (!form.periodo)       nuevosErrores.periodo       = 'Selecciona un periodo.';
    if (!form.grado.trim())  nuevosErrores.grado         = 'El grado es obligatorio.';
    if (!form.seccion.trim())nuevosErrores.seccion       = 'La sección es obligatoria.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      if (modoEdicion) {
        await api.put(`/cursos/${cursoExistente.id}`, form);
        Alert.alert('Éxito', 'Curso actualizado correctamente.');
      } else {
        await api.post('/cursos', form);
        Alert.alert('Éxito', 'Curso creado correctamente.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Ocurrió un error.');
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.cargandoTexto}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>{modoEdicion ? 'Editar Curso' : 'Nuevo Curso'}</Text>

      <Selector
        label="Asignatura *"
        items={asignaturas}
        valorSeleccionado={form.asignatura_id}
        onSeleccionar={(id) => actualizar('asignatura_id', id)}
        error={errores.asignatura_id}
      />

      <Selector
        label="Docente *"
        items={docentes}
        valorSeleccionado={form.docente_id}
        onSeleccionar={(id) => actualizar('docente_id', id)}
        error={errores.docente_id}
      />

      <Selector
        label="Periodo *"
        items={PERIODOS}
        valorSeleccionado={form.periodo}
        onSeleccionar={(id) => actualizar('periodo', id)}
        error={errores.periodo}
      />

      <Campo
        label="Año Escolar *"
        value={form.anio_escolar.toString()}
        onChangeText={(v) => actualizar('anio_escolar', v)}
        placeholder="Ej: 2026"
        keyboardType="numeric"
        error={errores.anio_escolar}
      />

      <Campo
        label="Grado *"
        value={form.grado}
        onChangeText={(v) => actualizar('grado', v)}
        placeholder="Ej: 9no Grado"
        error={errores.grado}
      />

      <Campo
        label="Sección *"
        value={form.seccion}
        onChangeText={(v) => actualizar('seccion', v.toUpperCase())}
        placeholder="Ej: A"
        error={errores.seccion}
      />

      <TouchableOpacity
        style={[styles.botonGuardar, loading && { opacity: 0.7 }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={COLORS.white} /> : (
          <Text style={styles.botonTexto}>
            {modoEdicion ? 'Guardar Cambios' : 'Crear Curso'}
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
  centered:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cargandoTexto:      { color: COLORS.textLight, marginTop: 12 },
  titulo:             { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  campo:              { marginBottom: 16 },
  label:              { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input:              { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text },
  inputError:         { borderColor: COLORS.error },
  errorTexto:         { color: COLORS.error, fontSize: 12, marginTop: 4 },
  selectorBtn:        { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, backgroundColor: COLORS.white },
  selectorBtnActivo:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectorTexto:      { color: COLORS.text, fontSize: 13 },
  selectorTextoActivo:{ color: COLORS.white, fontWeight: '600' },
  botonGuardar:       { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botonTexto:         { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  botonCancelar:      { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  botonCancelarTexto: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
});