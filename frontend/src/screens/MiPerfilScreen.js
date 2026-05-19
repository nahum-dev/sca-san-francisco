import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import authService from '../services/authService';
import { COLORS, ROLES } from '../utils/constants';

export default function MiPerfilScreen({ navigation }) {
  const [usuario,    setUsuario]    = useState(null);
  const [matriculas, setMatriculas] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try {
      const data = await AsyncStorage.getItem('usuario');
      if (!data) return;

      const user = JSON.parse(data);
      setUsuario(user);

      // Si es estudiante cargar sus matrículas usando su estudiante_id
      if (user.rol === ROLES.ESTUDIANTE && user.estudiante_id) {
        const resMat = await api.get('/matriculas/estudiante', {
          params: { estudiante_id: user.estudiante_id },
        });
        setMatriculas(resMat.data.data);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const getRolNombre = (rol) => {
    switch (rol) {
      case ROLES.ADMIN:      return 'Administrador';
      case ROLES.DOCENTE:    return 'Docente';
      case ROLES.ESTUDIANTE: return 'Estudiante';
      default:               return 'Usuario';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Cabecera del perfil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {usuario?.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{usuario?.username}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolTexto}>{getRolNombre(usuario?.rol)}</Text>
        </View>
      </View>

      {/* Mis cursos si es estudiante */}
      {usuario?.rol === ROLES.ESTUDIANTE && (
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Mis Cursos</Text>
          {matriculas.length === 0 ? (
            <View style={styles.vacioContainer}>
              <Text style={styles.vacioIcono}>📚</Text>
              <Text style={styles.vacio}>No tienes cursos matriculados.</Text>
            </View>
          ) : (
            matriculas.map(mat => (
              <TouchableOpacity
                key={mat.id}
                style={styles.cursoCard}
                onPress={() => navigation.navigate('MisNotas', {
                  matriculaId:      mat.id,
                  asignaturaNombre: mat.asignatura_nombre,
                })}
              >
                <View style={styles.cursoIcono}>
                  <Text style={styles.cursoIconoTexto}>📖</Text>
                </View>
                <View style={styles.cursoInfo}>
                  <Text style={styles.cursoNombre}>{mat.asignatura_nombre}</Text>
                  <Text style={styles.cursoDetalle}>
                    {mat.grado} — {mat.periodo} {mat.anio_escolar}
                  </Text>
                  <Text style={styles.cursoDetalle}>
                    👨‍🏫 {mat.docente_apellidos}, {mat.docente_nombres}
                  </Text>
                </View>
                <Text style={styles.flecha}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <TouchableOpacity
  style={styles.btnCambiarPass}
  onPress={() => navigation.navigate('CambiarPassword')}
>
  <Text style={styles.btnCambiarPassTexto}>🔐 Cambiar Contraseña</Text>
</TouchableOpacity>

      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnLogoutTexto}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btnCambiarPass:      { margin: 20, marginBottom: 0, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
btnCambiarPassTexto: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  container:      { flex: 1, backgroundColor: COLORS.background },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { backgroundColor: COLORS.primary, padding: 32, alignItems: 'center' },
  avatar:         { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTexto:    { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  username:       { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  email:          { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  rolBadge:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginTop: 10 },
  rolTexto:       { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  seccion:        { padding: 20 },
  seccionTitulo:  { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  vacioContainer: { alignItems: 'center', padding: 30 },
  vacioIcono:     { fontSize: 40, marginBottom: 10 },
  vacio:          { color: COLORS.textLight, fontSize: 14, textAlign: 'center' },
  cursoCard:      { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cursoIcono:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF5FB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cursoIconoTexto:{ fontSize: 22 },
  cursoInfo:      { flex: 1 },
  cursoNombre:    { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  cursoDetalle:   { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  flecha:         { fontSize: 24, color: COLORS.textLight },
  btnLogout:      { margin: 20, backgroundColor: COLORS.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnLogoutTexto: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});