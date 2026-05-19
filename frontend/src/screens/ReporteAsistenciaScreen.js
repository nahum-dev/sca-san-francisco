import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
  TouchableOpacity, ScrollView,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function ReporteAsistenciaScreen({ route }) {
  const cursoId     = route.params?.cursoId;
  const cursoNombre = route.params?.cursoNombre || 'Curso';

  const [reporte,    setReporte]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vista,      setVista]      = useState('resumen'); // 'resumen' o 'detalle'
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [detalleAsistencia,      setDetalleAsistencia]      = useState([]);
  const [loadingDetalle,         setLoadingDetalle]          = useState(false);

  useEffect(() => { cargarReporte(); }, []);

  const cargarReporte = async () => {
    try {
      const response = await api.get('/asistencia/reporte-curso', {
        params: { curso_id: cursoId },
      });
      setReporte(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar el reporte.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const verDetalle = async (matriculaId, nombre) => {
    setEstudianteSeleccionado(nombre);
    setLoadingDetalle(true);
    setVista('detalle');
    try {
      const response = await api.get('/asistencia/reporte', {
        params: { matricula_id: matriculaId },
      });
      setDetalleAsistencia(response.data.data.registros);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar el detalle.');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const getPorcentajeColor = (porcentaje) => {
    if (!porcentaje) return COLORS.textLight;
    if (porcentaje >= 80) return '#27AE60';
    if (porcentaje >= 60) return '#F39C12';
    return '#E74C3C';
  };

  const ESTADO_CONFIG = {
    presente:    { color: '#27AE60', icono: '✅' },
    ausente:     { color: '#E74C3C', icono: '❌' },
    tardanza:    { color: '#F39C12', icono: '⏰' },
    justificado: { color: '#8E44AD', icono: '📋' },
  };

  const renderEstudiante = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => verDetalle(item.matricula_id, `${item.nombres} ${item.apellidos}`)}
    >
      <View style={styles.tarjetaHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {item.nombres.charAt(0)}{item.apellidos.charAt(0)}
          </Text>
        </View>
        <View style={styles.estudianteInfo}>
          <Text style={styles.nombre}>{item.apellidos}, {item.nombres}</Text>
          <Text style={styles.codigo}>Código: {item.codigo}</Text>
        </View>
        <View style={styles.porcentajeContainer}>
          <Text style={[styles.porcentaje, { color: getPorcentajeColor(item.porcentaje) }]}>
            {item.porcentaje || 0}%
          </Text>
          <Text style={styles.porcentajeLabel}>asistencia</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumero, { color: '#27AE60' }]}>{item.presentes || 0}</Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumero, { color: '#E74C3C' }]}>{item.ausentes || 0}</Text>
          <Text style={styles.statLabel}>Ausentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumero, { color: '#F39C12' }]}>{item.tardanzas || 0}</Text>
          <Text style={styles.statLabel}>Tardanzas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumero, { color: '#8E44AD' }]}>{item.justificados || 0}</Text>
          <Text style={styles.statLabel}>Justificados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumero}>{item.total_dias || 0}</Text>
          <Text style={styles.statLabel}>Total días</Text>
        </View>
      </View>

      <Text style={styles.verDetalle}>Ver detalle →</Text>
    </TouchableOpacity>
  );

  const renderDetalle = ({ item }) => (
    <View style={styles.detalleItem}>
      <Text style={styles.detalleIcono}>
        {ESTADO_CONFIG[item.estado]?.icono || '❓'}
      </Text>
      <View style={styles.detalleInfo}>
        <Text style={styles.detalleFecha}>{item.fecha}</Text>
        {item.observaciones ? (
          <Text style={styles.detalleObs}>{item.observaciones}</Text>
        ) : null}
      </View>
      <Text style={[styles.detalleEstado, {
        color: ESTADO_CONFIG[item.estado]?.color || COLORS.textLight
      }]}>
        {item.estado?.charAt(0).toUpperCase() + item.estado?.slice(1)}
      </Text>
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
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>{cursoNombre}</Text>
        <Text style={styles.headerSub}>
          {vista === 'resumen'
            ? `${reporte.length} estudiantes`
            : estudianteSeleccionado}
        </Text>
      </View>

      {/* Tabs */}
      {vista === 'detalle' && (
        <TouchableOpacity
          style={styles.btnVolver}
          onPress={() => {
            setVista('resumen');
            setEstudianteSeleccionado(null);
            setDetalleAsistencia([]);
          }}
        >
          <Text style={styles.btnVolverTexto}>← Volver al resumen</Text>
        </TouchableOpacity>
      )}

      {/* Vista resumen */}
      {vista === 'resumen' && (
        <FlatList
          data={reporte}
          keyExtractor={(item) => item.matricula_id.toString()}
          renderItem={renderEstudiante}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); cargarReporte(); }}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.vacio}>No hay datos de asistencia.</Text>
            </View>
          }
          contentContainerStyle={styles.lista}
        />
      )}

      {/* Vista detalle */}
      {vista === 'detalle' && (
        loadingDetalle ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={detalleAsistencia}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderDetalle}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.vacio}>No hay registros de asistencia.</Text>
              </View>
            }
            contentContainerStyle={styles.lista}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.background },
  centered:           { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header:             { backgroundColor: COLORS.primary, padding: 16 },
  headerTitulo:       { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  headerSub:          { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  btnVolver:          { backgroundColor: COLORS.white, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  btnVolverTexto:     { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  lista:              { padding: 16, paddingBottom: 40 },
  tarjeta:            { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  tarjetaHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar:             { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTexto:        { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  estudianteInfo:     { flex: 1 },
  nombre:             { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  codigo:             { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  porcentajeContainer:{ alignItems: 'center' },
  porcentaje:         { fontSize: 22, fontWeight: 'bold' },
  porcentajeLabel:    { fontSize: 10, color: COLORS.textLight },
  statsRow:           { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginBottom: 8 },
  statItem:           { alignItems: 'center' },
  statNumero:         { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statLabel:          { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  verDetalle:         { color: COLORS.primary, fontSize: 13, textAlign: 'right', fontWeight: '600' },
  detalleItem:        { backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderRadius: 10, elevation: 1 },
  detalleIcono:       { fontSize: 24, marginRight: 12 },
  detalleInfo:        { flex: 1 },
  detalleFecha:       { fontSize: 15, fontWeight: '600', color: COLORS.text },
  detalleObs:         { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  detalleEstado:      { fontSize: 13, fontWeight: 'bold' },
  vacio:              { color: COLORS.textLight, fontSize: 15 },
});