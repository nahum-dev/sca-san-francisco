import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function AsignaturasScreen({ navigation }) {
  const [asignaturas, setAsignaturas] = useState([]);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  useEffect(() => { cargarAsignaturas(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarAsignaturas);
    return unsubscribe;
  }, [navigation]);

  const cargarAsignaturas = async () => {
    try {
      const response = await api.get('/asignaturas', { params: { search } });
      setAsignaturas(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar las asignaturas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (texto) => {
  setSearch(texto);
  try {
    const response = await api.get('/asignaturas', { params: { search: texto } });
    setAsignaturas(response.data.data || []);
  } catch (err) {
    console.error(err);
  }
};

  const handleEliminar = (id, nombre) => {
    Alert.alert(
      'Desactivar Asignatura',
      `¿Deseas desactivar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/asignaturas/${id}`);
              cargarAsignaturas();
            } catch (err) {
              Alert.alert('Error', 'No se pudo desactivar la asignatura.');
            }
          },
        },
      ]
    );
  };

  const handleActivar = (id, nombre) => {
  Alert.alert(
    'Activar Asignatura',
    `¿Deseas activar "${nombre}"?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Activar',
        onPress: async () => {
          try {
            await api.put(`/asignaturas/${id}`, {
              ...asignaturas.find(a => a.id === id),
              activa: 1,
            });
            cargarAsignaturas();
          } catch (err) {
            Alert.alert('Error', 'No se pudo activar la asignatura.');
          }
        },
      },
    ]
  );
};

  const renderAsignatura = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaInfo}>
        <View style={styles.tarjetaHeader}>
          <Text style={styles.codigo}>{item.codigo}</Text>
          <View style={[styles.badge, { backgroundColor: item.activa ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.badgeTexto, { color: item.activa ? '#27AE60' : '#E74C3C' }]}>
              {item.activa ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
        </View>
        <Text style={styles.nombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
        )}
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => navigation.navigate('FormAsignatura', { asignatura: item })}
        >
          <Text style={styles.btnTexto}>Editar</Text>
        </TouchableOpacity>

        {item.activa ? (
          <TouchableOpacity
            style={styles.btnEliminar}
            onPress={() => handleEliminar(item.id, item.nombre)}
          >
            <Text style={styles.btnTexto}>Desactivar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.btnActivar}
            onPress={() => handleActivar(item.id, item.nombre)}
          >
            <Text style={styles.btnTexto}>Activar</Text>
          </TouchableOpacity>
        )}
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
          placeholder="Buscar por nombre o código..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={asignaturas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAsignatura}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarAsignaturas(); }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.vacio}>No se encontraron asignaturas.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FormAsignatura', { asignatura: null })}
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
  tarjeta:         { backgroundColor: COLORS.white, borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2 },
  tarjetaInfo:     { marginBottom: 12 },
  tarjetaHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  codigo:          { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  badge:           { borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  badgeTexto:      { fontSize: 12, fontWeight: '600' },
  nombre:          { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  descripcion:     { fontSize: 13, color: COLORS.textLight },
  acciones:        { flexDirection: 'row', gap: 8 },
  btnEditar:       { flex: 1, backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  btnEliminar:     { flex: 1, backgroundColor: COLORS.error, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  btnTexto:        { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  vacio:           { color: COLORS.textLight, fontSize: 15 },
  fab:             { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 14, paddingHorizontal: 24, elevation: 6 },
  fabTexto:        { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  btnActivar: { flex:            1, backgroundColor: '#27AE60',borderRadius:    6, paddingVertical: 8, alignItems:      'center'},
});