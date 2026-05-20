// screens/AsistenciaScreen.js
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
  ScrollView,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function AsistenciaScreen() {
  const [cursoId,     setCursoId]     = useState('');
  const [fecha,       setFecha]       = useState(new Date().toISOString().split('T')[0]);
  const [asistencia,  setAsistencia]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [buscado,     setBuscado]     = useState(false);

  const ESTADOS = ['presente', 'ausente', 'tardanza', 'justificado'];

  const ESTADO_COLORES = {
    presente:    '#27AE60',
    ausente:     '#E74C3C',
    tardanza:    '#F39C12',
    justificado: '#8E44AD',
  };

  const ESTADO_ICONOS = {
  presente:    { nombre: 'checkmark-circle', color: '#27AE60' },
  ausente:     { nombre: 'close-circle',     color: '#E74C3C' },
  tardanza:    { nombre: 'time',             color: '#F39C12' },
  justificado: { nombre: 'clipboard',        color: '#8E44AD' },
};

  const cargarAsistencia = async () => {
    if (!cursoId.trim()) {
      Alert.alert('Atención', 'Ingresa el ID del curso.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/asistencia', {
        params: { curso_id: cursoId, fecha },
      });

      // Inicializar estado de cada estudiante
      const datos = response.data.data.map(item => ({
        ...item,
        estadoSeleccionado: item.estado || 'presente',
        observaciones:      item.observaciones || '',
      }));

      setAsistencia(datos);
      setBuscado(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo cargar la asistencia.');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = (matriculaId, nuevoEstado) => {
    setAsistencia(prev =>
      prev.map(item =>
        item.matricula_id === matriculaId
          ? { ...item, estadoSeleccionado: nuevoEstado }
          : item
      )
    );
  };

  const guardarAsistencia = async () => {
    setGuardando(true);
    try {
      const registros = asistencia.map(item => ({
        matricula_id:  item.matricula_id,
        fecha:         fecha,
        estado:        item.estadoSeleccionado,
        observaciones: item.observaciones,
      }));

      await api.post('/asistencia', { registros });
      Alert.alert('Éxito', 'Asistencia guardada correctamente.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo guardar la asistencia.');
    } finally {
      setGuardando(false);
    }
  };

  const renderEstudiante = ({ item }) => (
  <View style={styles.tarjeta}>
    <View style={styles.estudianteInfo}>
      <Text style={styles.nombreEstudiante}>
        {item.apellidos}, {item.nombres}
      </Text>
      <Text style={styles.codigoEstudiante}>
        Código: {item.codigo} | {item.grado} — Sección {item.seccion}
      </Text>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.estadosRow}
    >
      {ESTADOS.map(estado => (
        <TouchableOpacity
          key={estado}
          style={[
            styles.estadoBtn,
            { borderColor: ESTADO_COLORES[estado] },
            item.estadoSeleccionado === estado && {
              backgroundColor: ESTADO_COLORES[estado],
            },
          ]}
          onPress={() => cambiarEstado(item.matricula_id, estado)}
        >
          <Ionicons
            name={ESTADO_ICONOS[estado]?.nombre || 'ellipse'}
            size={14}
            color={item.estadoSeleccionado === estado ? COLORS.white : ESTADO_COLORES[estado]}
          />
          <Text style={[
            styles.estadoBtnTexto,
            { color: ESTADO_COLORES[estado] },
            item.estadoSeleccionado === estado && { color: COLORS.white },
          ]}>
            {' '}{estado.charAt(0).toUpperCase() + estado.slice(1)}
          </Text>
        </TouchableOpacity>
      ))} 
    </ScrollView>
  </View>
  );

  return (
    <View style={styles.container}>

      {/* Filtros */}
      <View style={styles.filtros}>
        <Text style={styles.filtroTitulo}>Registrar Asistencia</Text>

        <Text style={styles.label}>ID del Curso</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 1"
          placeholderTextColor={COLORS.textLight}
          value={cursoId}
          onChangeText={setCursoId}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textLight}
          value={fecha}
          onChangeText={setFecha}
        />

        <TouchableOpacity
          style={styles.botonBuscar}
          onPress={cargarAsistencia}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.botonTexto}>Cargar Estudiantes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Lista de estudiantes */}
      {buscado && asistencia.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.vacio}>No hay estudiantes en este curso.</Text>
        </View>
      ) : (
        <FlatList
          data={asistencia}
          keyExtractor={(item) => item.matricula_id.toString()}
          renderItem={renderEstudiante}
          contentContainerStyle={styles.lista}
        />
      )}

      {/* Botón guardar */}
      {asistencia.length > 0 && (
        <TouchableOpacity
          style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
          onPress={guardarAsistencia}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.botonTexto}>
              Guardar Asistencia ({asistencia.length} estudiantes)
            </Text>
          )}
        </TouchableOpacity>
      )}

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
    paddingVertical: 12,
    alignItems:      'center',
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
  estudianteInfo: {
    marginBottom: 10,
  },
  nombreEstudiante: {
    fontSize:   15,
    fontWeight: 'bold',
    color:      COLORS.text,
  },
  codigoEstudiante: {
    fontSize:  12,
    color:     COLORS.textLight,
    marginTop: 2,
  },
  estadosRow: {
    flexDirection: 'row',
  },
  estadoBtn: { borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, flexDirection: 'row', alignItems: 'center' },
  estadoBtnTexto: {
    fontSize:   12,
    fontWeight: '600',
  },
  botonGuardar: {
    position:        'absolute',
    bottom:          16,
    left:            16,
    right:           16,
    backgroundColor: COLORS.success,
    borderRadius:    10,
    paddingVertical: 14,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    6,
    elevation:       6,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color:      COLORS.white,
    fontWeight: 'bold',
    fontSize:   15,
  },
  vacio: {
    color:    COLORS.textLight,
    fontSize: 15,
  },
});