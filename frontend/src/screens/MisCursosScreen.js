import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function MisCursosScreen({ navigation }) {
  const [cursos,     setCursos]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { cargarMisCursos(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarMisCursos);
    return unsubscribe;
  }, [navigation]);

  const cargarMisCursos = async () => {
    try {
      const response = await api.get('/cursos/docente');
      setCursos(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar tus cursos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderCurso = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaHeader}>
        <View style={styles.codigoBadge}>
          <Text style={styles.codigoTexto}>{item.asignatura_codigo}</Text>
        </View>
        <Text style={styles.anio}>{item.anio_escolar}</Text>
      </View>

      <Text style={styles.asignaturaNombre}>{item.asignatura_nombre}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoTexto}>🎓 {item.grado} — Sección {item.seccion}</Text>
        <Text style={styles.periodo}>{item.periodo}</Text>
      </View>

      <View style={styles.acciones}>
  <TouchableOpacity
    style={styles.btnAsistencia}
    onPress={() => navigation.navigate('Asistencia', {
      cursoId:     item.id,
      cursoNombre: item.asignatura_nombre,
    })}
  >
    <Text style={styles.btnTexto}>📋 Asistencia</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.btnNotas}
    onPress={() => navigation.navigate('EstudiantesCurso', {
      cursoId:     item.id,
      cursoNombre: item.asignatura_nombre,
    })}
  >
    <Text style={styles.btnTexto}>📝 Notas</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.btnReporte}
    onPress={() => navigation.navigate('ReporteAsistencia', {
      cursoId:     item.id,
      cursoNombre: item.asignatura_nombre,
    })}
  >
    <Text style={styles.btnTexto}>📊 Reporte</Text>
  </TouchableOpacity>
</View>

      {/* Acciones del docente */}
      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnAsistencia}
          onPress={() => navigation.navigate('Asistencia', {
            cursoId: item.id,
            cursoNombre: item.asignatura_nombre,
          })}
        >
          <Text style={styles.btnTexto}>📋 Asistencia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnNotas}
          onPress={() => navigation.navigate('EstudiantesCurso', {
            cursoId:     item.id,
            cursoNombre: item.asignatura_nombre,
          })}
        >
          <Text style={styles.btnTexto}>📝 Notas</Text>
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
      {cursos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.vacio}>No tienes cursos asignados.</Text>
          <Text style={styles.vacioSub}>Contacta al administrador.</Text>
        </View>
      ) : (
        <FlatList
          data={cursos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCurso}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); cargarMisCursos(); }}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  lista:           { padding: 16 },
  tarjeta:         { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  tarjetaHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  codigoBadge:     { backgroundColor: '#EBF5FB', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  codigoTexto:     { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  anio:            { color: COLORS.textLight, fontSize: 13, fontWeight: '600' },
  asignaturaNombre:{ fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoTexto:       { fontSize: 13, color: COLORS.textLight },
  periodo:         { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  acciones:        { flexDirection: 'row', gap: 10 },
  btnAsistencia:   { flex: 1, backgroundColor: '#27AE60', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnNotas:        { flex: 1, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnTexto:        { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  emptyIcon:       { fontSize: 50, marginBottom: 16 },
  vacio:           { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  vacioSub:        { color: COLORS.textLight, fontSize: 14, marginTop: 8 },
  btnReporte: {
  flex:            1,
  backgroundColor: '#8E44AD',
  borderRadius:    8,
  paddingVertical: 10,
  alignItems:      'center',
},
});