import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function DocentesScreen({ navigation }) {
  const [docentes,   setDocentes]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { cargarDocentes(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarDocentes);
    return unsubscribe;
  }, [navigation]);

  const cargarDocentes = async () => {
    try {
      const response = await api.get('/docentes', { params: { search } });
      setDocentes(response.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar la lista de docentes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (texto) => {
  setSearch(texto);
  try {
    const response = await api.get('/docentes', { params: { search: texto } });
    setDocentes(response.data.data || []);
  } catch (err) {
    console.error(err);
  }
};

  const handleEliminar = (id, nombre) => {
    Alert.alert(
      'Eliminar Docente',
      `¿Deseas eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/docentes/${id}`);
              cargarDocentes();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el docente.');
            }
          },
        },
      ]
    );
  };

  const renderDocente = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaInfo}>
        <Text style={styles.nombre}>{item.apellidos}, {item.nombres}</Text>
        <Text style={styles.detalle}>Código: {item.codigo}</Text>
        <Text style={styles.detalle}>DUI: {item.dui}</Text>
        {item.especialidad && (
          <Text style={styles.especialidad}>{item.especialidad}</Text>
        )}
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => navigation.navigate('FormDocente', { docente: item })}
        >
          <Text style={styles.btnTexto}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => handleEliminar(item.id, `${item.nombres} ${item.apellidos}`)}
        >
          <Text style={styles.btnTexto}>Eliminar</Text>
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
          placeholder="Buscar por nombre o código..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={docentes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDocente}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarDocentes(); }}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.vacio}>No se encontraron docentes.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FormDocente', { docente: null })}
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
  tarjeta:         { backgroundColor: COLORS.white, borderRadius: 10, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  tarjetaInfo:     { flex: 1 },
  nombre:          { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  detalle:         { fontSize: 13, color: COLORS.textLight },
  especialidad:    { fontSize: 13, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
  acciones:        { gap: 8 },
  btnEditar:       { backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  btnEliminar:     { backgroundColor: COLORS.error, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  btnTexto:        { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  vacio:           { color: COLORS.textLight, fontSize: 15 },
  fab:             { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 14, paddingHorizontal: 24, elevation: 6 },
  fabTexto:        { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
});