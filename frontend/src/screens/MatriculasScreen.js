import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, Modal,
  TextInput, ScrollView,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function MatriculasScreen({ route, navigation }) {
  const cursoId     = route.params?.cursoId;
  const cursoNombre = route.params?.cursoNombre || 'Curso';

  const [matriculas,   setMatriculas]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [estudiantes,  setEstudiantes]  = useState([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [guardando,    setGuardando]    = useState(false);

  const ESTADO_COLORES = {
    activo:   { bg: '#E8F5E9', text: '#27AE60' },
    retirado: { bg: '#FFEBEE', text: '#E74C3C' },
    egresado: { bg: '#EDE7F6', text: '#8E44AD' },
  };

  useEffect(() => { cargarMatriculas(); }, []);

  const cargarMatriculas = async () => {
    try {
      const response = await api.get('/matriculas/curso', {
        params: { curso_id: cursoId },
      });
      setMatriculas(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar las matrículas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const buscarEstudiantes = async (texto) => {
    setBusqueda(texto);
    try {
      const response = await api.get('/estudiantes', { params: { search: texto } });
      setEstudiantes(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const matricularEstudiante = async (estudianteId) => {
    setGuardando(true);
    try {
      await api.post('/matriculas', {
        curso_id:      cursoId,
        estudiante_id: estudianteId,
      });
      Alert.alert('Éxito', 'Estudiante matriculado correctamente.');
      setModalVisible(false);
      setBusqueda('');
      setEstudiantes([]);
      cargarMatriculas();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo matricular al estudiante.');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = (id, estadoActual) => {
    const estados = ['activo', 'retirado', 'egresado'].filter(e => e !== estadoActual);
    Alert.alert(
      'Cambiar Estado',
      'Selecciona el nuevo estado:',
      [
        ...estados.map(estado => ({
          text: estado.charAt(0).toUpperCase() + estado.slice(1),
          onPress: async () => {
            try {
              await api.put(`/matriculas/${id}/estado`, { estado });
              cargarMatriculas();
            } catch (err) {
              Alert.alert('Error', 'No se pudo cambiar el estado.');
            }
          },
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const eliminarMatricula = (id, nombre) => {
    Alert.alert(
      'Eliminar Matrícula',
      `¿Deseas eliminar la matrícula de ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/matriculas/${id}`);
              cargarMatriculas();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la matrícula.');
            }
          },
        },
      ]
    );
  };

  const renderMatricula = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaInfo}>
        <Text style={styles.nombre}>{item.apellidos}, {item.nombres}</Text>
        <Text style={styles.detalle}>Código: {item.codigo}</Text>
        <Text style={styles.detalle}>
          {item.grado} — Sección {item.seccion}
        </Text>
        <Text style={styles.detalle}>
          Matriculado: {item.fecha_matricula}
        </Text>
      </View>
      <View style={styles.tarjetaDerecha}>
        <TouchableOpacity
          style={[styles.estadoBadge, { backgroundColor: ESTADO_COLORES[item.estado]?.bg }]}
          onPress={() => cambiarEstado(item.id, item.estado)}
        >
          <Text style={[styles.estadoTexto, { color: ESTADO_COLORES[item.estado]?.text }]}>
            {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => eliminarMatricula(item.id, `${item.nombres} ${item.apellidos}`)}
        >
          <Text style={styles.btnTexto}>Retirar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header del curso */}
      <View style={styles.cursoHeader}>
        <Text style={styles.cursoNombre}>{cursoNombre}</Text>
        <Text style={styles.cursoInfo}>{matriculas.length} estudiantes matriculados</Text>
      </View>

      <FlatList
        data={matriculas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatricula}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarMatriculas(); }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.vacio}>No hay estudiantes matriculados.</Text>
            <Text style={styles.vacioSub}>Toca el botón + para matricular.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />

      {/* Botón matricular */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabTexto}>+ Matricular</Text>
      </TouchableOpacity>

      {/* Modal para buscar y matricular estudiantes */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Matricular Estudiante</Text>
            <Text style={styles.modalSubtitulo}>Busca el estudiante a matricular</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o código..."
              placeholderTextColor={COLORS.textLight}
              value={busqueda}
              onChangeText={buscarEstudiantes}
              autoFocus
            />

            <ScrollView style={styles.listaEstudiantes}>
              {(estudiantes || []).length === 0 && busqueda.length > 0 ? (
                <Text style={styles.vacio}>No se encontraron estudiantes.</Text>
              ) : (
                (estudiantes || []).map(est => (
                  <TouchableOpacity
                    key={est.id}
                    style={styles.estudianteItem}
                    onPress={() => matricularEstudiante(est.id)}
                    disabled={guardando}
                  >
                    <View>
                      <Text style={styles.estudianteNombre}>
                        {est.apellidos}, {est.nombres}
                      </Text>
                      <Text style={styles.estudianteCodigo}>
                        {est.codigo} — {est.grado} {est.seccion}
                      </Text>
                    </View>
                    <Text style={styles.matricularTexto}>+ Matricular</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.botonCerrar}
              onPress={() => {
                setModalVisible(false);
                setBusqueda('');
                setEstudiantes([]);
              }}
            >
              <Text style={styles.botonCerrarTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.background },
  centered:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  cursoHeader:      { backgroundColor: COLORS.primary, padding: 16, paddingTop: 20 },
  cursoNombre:      { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  cursoInfo:        { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  lista:            { padding: 16, paddingBottom: 80 },
  tarjeta:          { backgroundColor: COLORS.white, borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
  tarjetaInfo:      { flex: 1 },
  tarjetaDerecha:   { alignItems: 'flex-end', gap: 8, marginLeft: 8 },
  nombre:           { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  detalle:          { fontSize: 12, color: COLORS.textLight },
  estadoBadge:      { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  estadoTexto:      { fontSize: 11, fontWeight: 'bold' },
  btnEliminar:      { backgroundColor: COLORS.error, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10 },
  btnTexto:         { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  vacio:            { color: COLORS.textLight, fontSize: 15, textAlign: 'center' },
  vacioSub:         { color: COLORS.textLight, fontSize: 13, marginTop: 8, textAlign: 'center' },
  fab:              { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 14, paddingHorizontal: 24, elevation: 6 },
  fabTexto:         { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContenido:   { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  modalTitulo:      { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  modalSubtitulo:   { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },
  searchInput:      { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.text, marginBottom: 12 },
  listaEstudiantes: { maxHeight: 300 },
  estudianteItem:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  estudianteNombre: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  estudianteCodigo: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  matricularTexto:  { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  botonCerrar:      { backgroundColor: COLORS.background, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  botonCerrarTexto: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
});