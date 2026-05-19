import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function MisNotasScreen({ route }) {
  const matriculaId      = route.params?.matriculaId;
  const asignaturaNombre = route.params?.asignaturaNombre || 'Mis Notas';

  const [notas,      setNotas]      = useState([]);
  const [resumen,    setResumen]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const TIPO_COLORES = {
    examen:        '#E74C3C',
    tarea:         '#3498DB',
    proyecto:      '#9B59B6',
    participacion: '#27AE60',
  };

  useEffect(() => { cargarNotas(); }, []);

  const cargarNotas = async () => {
    try {
      const response = await api.get('/notas', {
        params: { matricula_id: matriculaId },
      });
      setNotas(response.data.data.notas);
      setResumen(response.data.data.resumen);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar las notas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getPromedioColor = (promedio) => {
    if (promedio >= 7) return '#27AE60';
    if (promedio >= 5) return '#F39C12';
    return '#E74C3C';
  };

  const renderNota = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={[styles.tipoBadge, { backgroundColor: TIPO_COLORES[item.tipo_eval] + '20' }]}>
        <Text style={[styles.tipoTexto, { color: TIPO_COLORES[item.tipo_eval] }]}>
          {item.tipo_eval.charAt(0).toUpperCase() + item.tipo_eval.slice(1)}
        </Text>
      </View>
      <Text style={styles.descripcion}>{item.descripcion}</Text>
      <View style={styles.tarjetaFooter}>
        <Text style={[styles.calificacion, {
          color: item.calificacion >= 6 ? '#27AE60' : '#E74C3C'
        }]}>
          {item.calificacion} / {item.nota_maxima}
        </Text>
        <Text style={styles.fecha}>{item.fecha_eval}</Text>
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>{asignaturaNombre}</Text>
      </View>

      {/* Resumen de notas */}
      {resumen && (
        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumero}>{resumen.total_evaluaciones}</Text>
            <Text style={styles.resumenLabel}>Evaluaciones</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, {
              color: getPromedioColor(parseFloat(resumen.promedio))
            }]}>
              {resumen.promedio || '0.00'}
            </Text>
            <Text style={styles.resumenLabel}>Promedio</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: '#27AE60' }]}>
              {resumen.nota_maxima || '0'}
            </Text>
            <Text style={styles.resumenLabel}>Mayor</Text>
          </View>
          <View style={styles.resumenDivider} />
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: '#E74C3C' }]}>
              {resumen.nota_minima || '0'}
            </Text>
            <Text style={styles.resumenLabel}>Menor</Text>
          </View>
        </View>
      )}

      <FlatList
        data={notas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNota}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarNotas(); }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.vacio}>No hay notas registradas aún.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header:         { backgroundColor: COLORS.primary, padding: 16 },
  headerTitulo:   { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  resumen:        { flexDirection: 'row', backgroundColor: COLORS.white, padding: 16, margin: 16, borderRadius: 12, elevation: 2, justifyContent: 'space-around' },
  resumenItem:    { alignItems: 'center', flex: 1 },
  resumenNumero:  { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  resumenLabel:   { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  resumenDivider: { width: 1, backgroundColor: COLORS.border },
  lista:          { padding: 16, paddingTop: 0, paddingBottom: 40 },
  tarjeta:        { backgroundColor: COLORS.white, borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2 },
  tipoBadge:      { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 8 },
  tipoTexto:      { fontSize: 12, fontWeight: 'bold' },
  descripcion:    { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  tarjetaFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calificacion:   { fontSize: 20, fontWeight: 'bold' },
  fecha:          { fontSize: 12, color: COLORS.textLight },
  emptyIcon:      { fontSize: 50, marginBottom: 16 },
  vacio:          { color: COLORS.textLight, fontSize: 15 },
});