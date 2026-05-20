// screens/NotasScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function NotasScreen({ route }) {
  const matriculaIdParam    = route.params?.matriculaId || null;
  const estudianteNombre    = route.params?.estudianteNombre || null;

  const [matriculaId,  setMatriculaId]  = useState(matriculaIdParam?.toString() || '');
  const [notas,        setNotas]        = useState([]);
  const [resumen,      setResumen]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [buscado,      setBuscado]      = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [form, setForm] = useState({
    tipo_eval:    'examen',
    descripcion:  '',
    calificacion: '',
    nota_maxima:  '10',
    fecha_eval:   new Date().toISOString().split('T')[0],
  });

  const TIPOS = ['examen', 'tarea', 'proyecto', 'participacion'];

const TIPO_COLORES = {
  examen:        '#E74C3C',
  tarea:         '#3498DB',
  proyecto:      '#9B59B6',
  participacion: '#27AE60',
};

const TIPO_ICONOS = {
  examen:        'document-text-outline',
  tarea:         'pencil-outline',
  proyecto:      'construct-outline',
  participacion: 'hand-left-outline',
};

  // Si viene matriculaId por parámetro cargar automáticamente
  useEffect(() => {
    if (matriculaIdParam) {
      cargarNotasDirecto(matriculaIdParam);
    }
  }, [matriculaIdParam]);

  const cargarNotasDirecto = async (id) => {
    setLoading(true);
    try {
      const response = await api.get('/notas', {
        params: { matricula_id: id },
      });
      setNotas(response.data.data.notas);
      setResumen(response.data.data.resumen);
      setBuscado(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo cargar las notas.');
    } finally {
      setLoading(false);
    }
  };

  const cargarNotas = async () => {
    if (!matriculaId.trim()) {
      Alert.alert('Atención', 'Ingresa el ID de matrícula.');
      return;
    }
    cargarNotasDirecto(parseInt(matriculaId));
  };

  const guardarNota = async () => {
    if (!form.descripcion.trim() || !form.calificacion.trim()) {
      Alert.alert('Atención', 'Descripción y calificación son obligatorios.');
      return;
    }

    try {
      await api.post('/notas', {
        matricula_id: parseInt(matriculaId),
        tipo_eval:    form.tipo_eval,
        descripcion:  form.descripcion,
        calificacion: parseFloat(form.calificacion),
        nota_maxima:  parseFloat(form.nota_maxima),
        fecha_eval:   form.fecha_eval,
      });

      Alert.alert('Éxito', 'Nota registrada correctamente.');
      setModalVisible(false);
      setForm({
        tipo_eval:    'examen',
        descripcion:  '',
        calificacion: '',
        nota_maxima:  '10',
        fecha_eval:   new Date().toISOString().split('T')[0],
      });
      cargarNotas();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo guardar la nota.');
    }
  };

  const eliminarNota = (id) => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro que deseas eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/notas/${id}`);
              cargarNotas();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la nota.');
            }
          },
        },
      ]
    );
  };

  const renderNota = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaHeader}>
        <View style={[styles.tipoBadge, { backgroundColor: TIPO_COLORES[item.tipo_eval] }]}>
          <Ionicons name={TIPO_ICONOS[item.tipo_eval]} size={12} color={COLORS.white} />
          <Text style={styles.tipoTexto}>
            {' '}{item.tipo_eval.charAt(0).toUpperCase() + item.tipo_eval.slice(1)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => eliminarNota(item.id)}>
          <Text style={styles.eliminarTexto}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.descripcion}>{item.descripcion}</Text>

      <View style={styles.tarjetaFooter}>
        <Text style={styles.calificacion}>
          {item.calificacion} / {item.nota_maxima}
        </Text>
        <Text style={styles.fecha}>{item.fecha_eval}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Buscador */}
      <View style={styles.filtros}>
  <Text style={styles.filtroTitulo}>
    {estudianteNombre ? `Notas de ${estudianteNombre}` : 'Registro de Notas'}
  </Text>

  {/* Solo mostrar el buscador si no viene de seleccionar estudiante */}
  {!matriculaIdParam && (
    <View style={styles.buscarRow}>
      <TextInput
        style={[styles.input, { flex: 1, marginBottom: 0 }]}
        placeholder="ID de Matrícula"
        placeholderTextColor={COLORS.textLight}
        value={matriculaId}
        onChangeText={setMatriculaId}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.botonBuscar}
        onPress={cargarNotas}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={styles.botonTexto}>Buscar</Text>
        )}
      </TouchableOpacity>
    </View>
  )}
</View>

      {/* Resumen */}
      {resumen && (
  <View style={styles.estudianteCard}>
    <View style={styles.estudianteInfo}>
      <Text style={styles.estudianteNombre}>
        {resumen.apellidos}, {resumen.nombres}
      </Text>
      <Text style={styles.estudianteCodigo}>
        Código: {resumen.codigo}
      </Text>
      <Text style={styles.asignaturaNombre}>
        📚 {resumen.asignatura_nombre}
      </Text>
    </View>
    <View style={styles.resumen}>
      <View style={styles.resumenItem}>
        <Text style={styles.resumenNumero}>{resumen.total_evaluaciones}</Text>
        <Text style={styles.resumenLabel}>Evaluaciones</Text>
      </View>
      <View style={styles.resumenItem}>
        <Text style={[styles.resumenNumero, { color: COLORS.primary }]}>
          {resumen.promedio || '0.00'}
        </Text>
        <Text style={styles.resumenLabel}>Promedio</Text>
      </View>
      <View style={styles.resumenItem}>
        <Text style={[styles.resumenNumero, { color: '#27AE60' }]}>
          {resumen.nota_maxima || '0'}
        </Text>
        <Text style={styles.resumenLabel}>Mayor</Text>
      </View>
      <View style={styles.resumenItem}>
        <Text style={[styles.resumenNumero, { color: '#E74C3C' }]}>
          {resumen.nota_minima || '0'}
        </Text>
        <Text style={styles.resumenLabel}>Menor</Text>
      </View>
    </View>
  </View>
)}
      {/* Lista de notas */}
      {buscado && notas.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.vacio}>No hay notas registradas.</Text>
        </View>
      ) : (
        <FlatList
          data={notas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNota}
          contentContainerStyle={styles.lista}
        />
      )}

      {/* Botón agregar nota */}
      {buscado && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabTexto}>+ Nueva Nota</Text>
        </TouchableOpacity>
      )}

      {/* Modal para agregar nota */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Nueva Nota</Text>

            {/* Selector de tipo */}
            <Text style={styles.label}>Tipo de Evaluación</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {TIPOS.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.tipoBtn,
                    { borderColor: TIPO_COLORES[tipo] },
                    form.tipo_eval === tipo && { backgroundColor: TIPO_COLORES[tipo] },
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, tipo_eval: tipo }))}
                >
                  <Ionicons
                    name={TIPO_ICONOS[tipo]}
                    size={16}
                    color={form.tipo_eval === tipo ? COLORS.white : TIPO_COLORES[tipo]}
                  />
                  <Text style={[
                    styles.tipoBtnTexto,
                    { color: TIPO_COLORES[tipo] },
                    form.tipo_eval === tipo && { color: COLORS.white },
                  ]}>
                    {' '}{tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Examen Parcial 1"
              placeholderTextColor={COLORS.textLight}
              value={form.descripcion}
              onChangeText={(val) => setForm(prev => ({ ...prev, descripcion: val }))}
            />

            <View style={styles.dosCampos}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Calificación *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 8.5"
                  placeholderTextColor={COLORS.textLight}
                  value={form.calificacion}
                  onChangeText={(val) => setForm(prev => ({ ...prev, calificacion: val }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Nota Máxima</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 10"
                  placeholderTextColor={COLORS.textLight}
                  value={form.nota_maxima}
                  onChangeText={(val) => setForm(prev => ({ ...prev, nota_maxima: val }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Fecha</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textLight}
              value={form.fecha_eval}
              onChangeText={(val) => setForm(prev => ({ ...prev, fecha_eval: val }))}
            />

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={guardarNota}
              >
                <Text style={styles.botonTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },
  filtros: {
    backgroundColor: COLORS.white,
    padding:         16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtroTitulo: {
    fontSize:     18,
    fontWeight:   'bold',
    color:        COLORS.text,
    marginBottom: 12,
  },
  label: {
    fontSize:     13,
    fontWeight:   '600',
    color:        COLORS.text,
    marginBottom: 4,
  },
  buscarRow: {
    flexDirection: 'row',
    gap:           10,
    alignItems:    'center',
  },
  input: {
    backgroundColor:   COLORS.background,
    borderWidth:       1,
    borderColor:       COLORS.border,
    borderRadius:      8,
    paddingHorizontal: 12,
    paddingVertical:   10,
    fontSize:          14,
    color:             COLORS.text,
    marginBottom:      10,
  },
  botonBuscar: {
    backgroundColor: COLORS.primary,
    borderRadius:    8,
    paddingVertical:   10,
    paddingHorizontal: 16,
  },
  resumen: {
    flexDirection:   'row',
    backgroundColor: COLORS.white,
    padding:         16,
    marginBottom:    8,
    justifyContent:  'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize:   22,
    fontWeight: 'bold',
    color:      COLORS.text,
  },
  resumenLabel: {
    fontSize:  11,
    color:     COLORS.textLight,
    marginTop: 2,
  },
  lista: {
    padding:       12,
    paddingBottom: 100,
  },
  tarjeta: {
    backgroundColor: COLORS.white,
    borderRadius:    10,
    padding:         14,
    marginBottom:    10,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    4,
    elevation:       2,
  },
  tarjetaHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   8,
  },

  tipoTexto: {
    color:      COLORS.white,
    fontSize:   12,
    fontWeight: 'bold',
  },
  eliminarTexto: {
    color:    COLORS.error,
    fontSize: 13,
  },
  descripcion: {
    fontSize:     15,
    color:        COLORS.text,
    fontWeight:   '500',
    marginBottom: 8,
  },
  tarjetaFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  calificacion: {
    fontSize:   16,
    fontWeight: 'bold',
    color:      COLORS.primary,
  },
  fecha: {
    fontSize: 13,
    color:    COLORS.textLight,
  },
  fab: {
    position:        'absolute',
    bottom:          16,
    right:           16,
    backgroundColor: COLORS.primary,
    borderRadius:    30,
    paddingVertical:   12,
    paddingHorizontal: 20,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    6,
    elevation:       6,
  },
  fabTexto: {
    color:      COLORS.white,
    fontWeight: 'bold',
    fontSize:   14,
  },
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  modalContenido: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    padding:         24,
    paddingBottom:   40,
  },
  modalTitulo: {
    fontSize:     20,
    fontWeight:   'bold',
    color:        COLORS.text,
    marginBottom: 16,
  },
  dosCampos: {
    flexDirection: 'row',
  },

  modalBotones: {
    flexDirection: 'row',
    gap:           12,
    marginTop:     8,
  },
  botonCancelar: {
    flex:            1,
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    8,
    paddingVertical: 12,
    alignItems:      'center',
  },
  botonCancelarTexto: {
    color:      COLORS.text,
    fontWeight: '600',
  },
  botonGuardar: {
    flex:            1,
    backgroundColor: COLORS.primary,
    borderRadius:    8,
    paddingVertical: 12,
    alignItems:      'center',
  },
  botonTexto: {
    color:      COLORS.white,
    fontWeight: 'bold',
    fontSize:   14,
  },
  vacio: {
    color:    COLORS.textLight,
    fontSize: 15,
  },
  estudianteCard:   { backgroundColor: COLORS.white, margin: 12, borderRadius: 12, padding: 16, elevation: 2 },
estudianteInfo:   { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12 },
estudianteNombre: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
estudianteCodigo: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
asignaturaNombre: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
tipoBadge:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
tipoBtn:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, marginRight: 8 },
tipoBtnTexto: { fontSize: 13, fontWeight: '600' },
});