import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function EstudiantesCursoScreen({ route, navigation }) {
  const cursoId     = route.params?.cursoId;
  const cursoNombre = route.params?.cursoNombre || 'Curso';

  const [matriculas, setMatriculas] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { cargarEstudiantes(); }, []);

  const cargarEstudiantes = async () => {
    try {
      const response = await api.get('/matriculas/curso', {
        params: { curso_id: cursoId },
      });
      setMatriculas(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar los estudiantes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderEstudiante = ({ item }) => (
  <TouchableOpacity
    style={styles.tarjeta}
    onPress={() => navigation.navigate('Notas', {
      matriculaId:      item.id,
      estudianteNombre: `${item.nombres} ${item.apellidos}`,
    })}
  >
      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>
          {item.nombres.charAt(0)}{item.apellidos.charAt(0)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.apellidos}, {item.nombres}</Text>
        <Text style={styles.detalle}>Código: {item.codigo}</Text>
        <Text style={styles.detalle}>{item.grado} — Sección {item.seccion}</Text>
      </View>
      <Text style={styles.flecha}>›</Text>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>{cursoNombre}</Text>
        <Text style={styles.headerSub}>
          Toca un estudiante para ver y registrar sus notas
        </Text>
      </View>

      <FlatList
        data={matriculas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEstudiante}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarEstudiantes(); }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.vacio}>No hay estudiantes en este curso.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header:       { backgroundColor: COLORS.primary, padding: 16 },
  headerTitulo: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  headerSub:    { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  lista:        { padding: 16 },
  tarjeta:      { backgroundColor: COLORS.white, borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  avatar:       { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTexto:  { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  info:         { flex: 1 },
  nombre:       { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  detalle:      { fontSize: 12, color: COLORS.textLight },
  flecha:       { fontSize: 24, color: COLORS.textLight },
  vacio:        { color: COLORS.textLight, fontSize: 15 },
});