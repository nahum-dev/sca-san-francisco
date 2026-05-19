import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function MiAsistenciaScreen({ route }) {
  const matriculaId      = route.params?.matriculaId;
  const asignaturaNombre = route.params?.asignaturaNombre || 'Mi Asistencia';

  const [resumen,    setResumen]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const ESTADO_CONFIG = {
    presente:    { color: '#27AE60', bg: '#E8F5E9', icono: '✅' },
    ausente:     { color: '#E74C3C', bg: '#FFEBEE', icono: '❌' },
    tardanza:    { color: '#F39C12', bg: '#FFF8E1', icono: '⏰' },
    justificado: { color: '#8E44AD', bg: '#F3E5F5', icono: '📋' },
  };

  useEffect(() => { cargarAsistencia(); }, []);

  const cargarAsistencia = async () => {
    try {
      const response = await api.get('/asistencia/resumen', {
        params: { matricula_id: matriculaId },
      });
      setResumen(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar la asistencia.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calcularPorcentaje = () => {
    if (!resumen || !resumen.total_dias || resumen.total_dias === 0) return 0;
    return Math.round((resumen.presentes / resumen.total_dias) * 100);
  };

  const getPorcentajeColor = (porcentaje) => {
    if (porcentaje >= 80) return '#27AE60';
    if (porcentaje >= 60) return '#F39C12';
    return '#E74C3C';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const porcentaje = calcularPorcentaje();

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>{asignaturaNombre}</Text>
        <Text style={styles.headerSub}>Resumen de Asistencia</Text>
      </View>

      {/* Porcentaje general */}
      <View style={styles.porcentajeCard}>
        <Text style={[styles.porcentajeNumero, { color: getPorcentajeColor(porcentaje) }]}>
          {porcentaje}%
        </Text>
        <Text style={styles.porcentajeLabel}>Porcentaje de Asistencia</Text>
        <Text style={styles.porcentajeSub}>
          {resumen?.presentes || 0} de {resumen?.total_dias || 0} días
        </Text>
      </View>

      {/* Detalle por estado */}
      <View style={styles.detalleContainer}>
        {Object.entries(ESTADO_CONFIG).map(([estado, config]) => (
          <View key={estado} style={[styles.detalleCard, { backgroundColor: config.bg }]}>
            <Text style={styles.detalleIcono}>{config.icono}</Text>
            <Text style={[styles.detalleNumero, { color: config.color }]}>
              {resumen?.[estado === 'presente' ? 'presentes' :
                estado === 'ausente'     ? 'ausentes'    :
                estado === 'tardanza'    ? 'tardanzas'   :
                'justificados'] || 0}
            </Text>
            <Text style={[styles.detalleLabel, { color: config.color }]}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Mensaje según porcentaje */}
      <View style={styles.mensajeCard}>
        <Text style={styles.mensajeTexto}>
          {porcentaje >= 80
            ? '🌟 ¡Excelente asistencia! Sigue así.'
            : porcentaje >= 60
            ? '⚠️ Tu asistencia necesita mejorar.'
            : '🚨 Tu asistencia está en nivel crítico.'}
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.background },
  centered:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { backgroundColor: COLORS.primary, padding: 20 },
  headerTitulo:     { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  headerSub:        { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  porcentajeCard:   { backgroundColor: COLORS.white, margin: 16, borderRadius: 16, padding: 24, alignItems: 'center', elevation: 3 },
  porcentajeNumero: { fontSize: 64, fontWeight: 'bold' },
  porcentajeLabel:  { fontSize: 16, color: COLORS.text, fontWeight: '600', marginTop: 8 },
  porcentajeSub:    { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  detalleContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  detalleCard:      { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center' },
  detalleIcono:     { fontSize: 28, marginBottom: 8 },
  detalleNumero:    { fontSize: 28, fontWeight: 'bold' },
  detalleLabel:     { fontSize: 13, fontWeight: '600', marginTop: 4 },
  mensajeCard:      { margin: 16, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, elevation: 2 },
  mensajeTexto:     { fontSize: 15, color: COLORS.text, textAlign: 'center', lineHeight: 22 },
});