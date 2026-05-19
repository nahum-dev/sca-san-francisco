// screens/EstudiantesScreen.js
// Lista de estudiantes con búsqueda y botón para agregar.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import estudianteService from '../services/estudianteService';
import { COLORS } from '../utils/constants';

export default function EstudiantesScreen({ navigation }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  // Cargar estudiantes al abrir la pantalla
  useEffect(() => {
    cargarEstudiantes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarEstudiantes();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarEstudiantes = async (searchTerm = '') => {
  setLoading(true);
  try {
    const data = await estudianteService.getAll(searchTerm);
    setEstudiantes(data);
  } catch (err) {
    Alert.alert('Error', 'No se pudo cargar la lista de estudiantes.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
  const handleSearch = useCallback(async (texto) => {
  setSearch(texto);
  await cargarEstudiantes(texto);
}, []);

  const handleEliminar = (id, nombre) => {
    Alert.alert(
      'Eliminar Estudiante',
      `¿Deseas eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await estudianteService.delete(id);
              cargarEstudiantes();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el estudiante.');
            }
          },
        },
      ]
    );
  };

  const renderEstudiante = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaInfo}>
        <Text style={styles.nombre}>
          {item.apellidos}, {item.nombres}
        </Text>
        <Text style={styles.detalle}>Código: {item.codigo}</Text>
        <Text style={styles.detalle}>{item.grado} — Sección {item.seccion}</Text>
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => navigation.navigate('FormEstudiante', { estudiante: item })}
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

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o código..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={estudiantes}
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
            <Text style={styles.vacio}>No se encontraron estudiantes.</Text>
          </View>
        }
        contentContainerStyle={styles.lista}
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FormEstudiante', { estudiante: null })}
      >
        <Text style={styles.fabTexto}>+ Agregar</Text>
      </TouchableOpacity>

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
    padding:        40,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    padding:         12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor:   COLORS.background,
    borderRadius:      8,
    paddingHorizontal: 14,
    paddingVertical:   10,
    fontSize:          15,
    color:             COLORS.text,
  },
  lista: {
    padding:       16,
    paddingBottom: 80,
  },
  tarjeta: {
    backgroundColor: COLORS.white,
    borderRadius:    10,
    padding:         16,
    marginBottom:    12,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    4,
    elevation:       2,
  },
  tarjetaInfo: {
    flex: 1,
  },
  nombre: {
    fontSize:     15,
    fontWeight:   'bold',
    color:        COLORS.text,
    marginBottom: 4,
  },
  detalle: {
    fontSize: 13,
    color:    COLORS.textLight,
  },
  acciones: {
    gap: 8,
  },
  btnEditar: {
    backgroundColor: COLORS.primary,
    borderRadius:    6,
    paddingVertical:   6,
    paddingHorizontal: 12,
  },
  btnEliminar: {
    backgroundColor: COLORS.error,
    borderRadius:    6,
    paddingVertical:   6,
    paddingHorizontal: 12,
  },
  btnTexto: {
    color:      COLORS.white,
    fontSize:   12,
    fontWeight: '600',
  },
  vacio: {
    color:    COLORS.textLight,
    fontSize: 15,
  },
  fab: {
    position:        'absolute',
    bottom:          24,
    right:           24,
    backgroundColor: COLORS.primary,
    borderRadius:    30,
    paddingVertical:   14,
    paddingHorizontal: 24,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    6,
    elevation:       6,
  },
  fabTexto: {
    color:      COLORS.white,
    fontWeight: 'bold',
    fontSize:   15,
  },
});