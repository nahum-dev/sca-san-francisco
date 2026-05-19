import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function CursosScreen({ navigation }) {
  const [cursos,     setCursos]     = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { cargarCursos(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarCursos);
    return unsubscribe;
  }, [navigation]);

  const cargarCursos = async () => {
    try {
      const response = await api.get('/cursos', { params: { search } });
      setCursos(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar los cursos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (texto) => {
    setSearch(texto);
    try {
      const response = await api.get('/cursos', { params: { search: texto } });
      setCursos(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = (id, nombre) => {
    Alert.alert(
      'Desactivar Curso',
      `¿Deseas desactivar el curso "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/cursos/${id}`);
              cargarCursos();
            } catch (err) {
              Alert.alert('Error', 'No se pudo desactivar el curso.');
            }
          },
        },
      ]
    );
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
        <Text style={styles.infoTexto}>👨‍🏫 {item.docente_apellidos}, {item.docente_nombres}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoTexto}>🎓 {item.grado} — Sección {item.seccion}</Text>
        <Text style={styles.periodo}>{item.periodo}</Text>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => navigation.navigate('FormCurso', { curso: item })}
        >
          <Text style={styles.btnTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnVerEstudiantes}
          onPress={() => navigation.navigate('MatriculasScreen', { cursoId: item.id, cursoNombre: item.asignatura_nombre })}
        >
          <Text style={styles.btnTexto}>Estudiantes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => handleEliminar(item.id, item.asignatura_nombre)}
        >
          <Text style={styles.btnTexto}>Desactivar</Text>
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por asignatura, docente o grado..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={cursos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCurso}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarCursos(); }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.vacio}>No se encontraron cursos.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FormCurso', { curso: null })}
      >
        <Text style={styles.fabTexto}>+ Agregar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  searchContainer: { backgroundColor: COLORS.white, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput:     { backgroundColor: COLORS.background, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.text },
  lista:           { padding: 16, paddingBottom: 80 },
  tarjeta:         { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  tarjetaHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  codigoBadge:     { backgroundColor: '#EBF5FB', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  codigoTexto:     { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  anio:            { color: COLORS.textLight, fontSize: 13, fontWeight: '600' },
  asignaturaNombre:{ fontSize: 17, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  infoTexto:       { fontSize: 13, color: COLORS.textLight },
  periodo:         { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  acciones:        { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnEditar:       { flex: 1, backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  btnVerEstudiantes:{ flex: 1, backgroundColor: '#27AE60', borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  btnEliminar:     { flex: 1, backgroundColor: COLORS.error, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  btnTexto:        { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  vacio:           { color: COLORS.textLight, fontSize: 15 },
  fab:             { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 14, paddingHorizontal: 24, elevation: 6 },
  fabTexto:        { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
});