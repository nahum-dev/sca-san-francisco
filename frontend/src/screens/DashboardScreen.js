import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { COLORS, ROLES } from '../utils/constants';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function DashboardScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => { cargarUsuario(); }, []);

  const cargarUsuario = async () => {
    const data = await AsyncStorage.getItem('usuario');
    if (data) setUsuario(JSON.parse(data));
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
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

  const getRolColor = (rol) => {
    switch (rol) {
      case ROLES.ADMIN:      return '#E74C3C';
      case ROLES.DOCENTE:    return '#27AE60';
      case ROLES.ESTUDIANTE: return '#F39C12';
      default:               return COLORS.primary;
    }
  };

  const menuItems = [
    { titulo: 'Estudiantes', descripcion: 'Gestionar estudiantes', icono: '👨‍🎓', pantalla: 'Estudiantes',  roles: [ROLES.ADMIN] },
    { titulo: 'Docentes',    descripcion: 'Gestionar docentes',    icono: '👨‍🏫', pantalla: 'Docentes',     roles: [ROLES.ADMIN] },
    { titulo: 'Asignaturas', descripcion: 'Gestionar materias',    icono: '📚',  pantalla: 'Asignaturas',  roles: [ROLES.ADMIN] },
    { titulo: 'Cursos',      descripcion: 'Gestionar cursos',      icono: '🏫',  pantalla: 'Cursos',       roles: [ROLES.ADMIN] },
    { titulo: 'Asistencia',  descripcion: 'Registrar asistencia',  icono: '📋',  pantalla: 'Asistencia',   roles: [ROLES.ADMIN, ROLES.DOCENTE] },
    { titulo: 'Notas',       descripcion: 'Registrar notas',       icono: '✏️',  pantalla: 'Notas',        roles: [ROLES.ADMIN, ROLES.DOCENTE] },
    { titulo: 'Mis Cursos',  descripcion: 'Ver mis cursos',        icono: '🗂️',  pantalla: 'MisCursos',    roles: [ROLES.DOCENTE] },
    { titulo: 'Mi Perfil',   descripcion: 'Ver mis datos',         icono: '👤',  pantalla: 'MiPerfil',     roles: [ROLES.ESTUDIANTE] },
  ];

  const menuFiltrado = menuItems.filter(
    item => !usuario || item.roles.includes(usuario.rol)
  );

  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header con gradiente */}
      <LinearGradient
        colors={['#2980B9', '#4A90E2']}
        style={styles.header}
      >
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />

        <View style={styles.headerContent}>
          <View style={styles.headerLogo}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogoImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextos}>
            <Text style={styles.saludo}>{getSaludo()},</Text>
            <Text style={styles.username}>{usuario?.username || '...'}</Text>
            <View style={[styles.rolBadge, { backgroundColor: getRolColor(usuario?.rol) }]}>
              <Text style={styles.rolTexto}>{getRolNombre(usuario?.rol)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {usuario?.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.salirTexto}>Salir</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tarjetas del menú */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitulo}>Módulos del Sistema</Text>

        <View style={styles.grid}>
          {menuFiltrado.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tarjeta}
              onPress={() => navigation.navigate(item.pantalla)}
              activeOpacity={0.8}
            >
              <Text style={styles.tarjetaIcono}>{item.icono}</Text>
              <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
              <Text style={styles.tarjetaDesc}>{item.descripcion}</Text>
              <View style={styles.tarjetaFlecha}>
                <Text style={styles.flechaTexto}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerTexto}>
          Centro Escolar San Francisco de Asís
        </Text>
        <Text style={styles.footerSub}>Sistema de Control Académico © 2026</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop:    60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    overflow:      'hidden',
  },
  circulo1: {
    position:        'absolute',
    top:             -40,
    right:           -40,
    width:           160,
    height:          160,
    borderRadius:    80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circulo2: {
    position:        'absolute',
    bottom:          -30,
    left:            60,
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerContent: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  headerTextos: {
    flex: 1,
  },
  saludo: {
    color:    'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  username: {
    color:      COLORS.white,
    fontSize:   26,
    fontWeight: 'bold',
    marginTop:  2,
  },
  rolBadge: {
    alignSelf:         'flex-start',
    borderRadius:      20,
    paddingVertical:   4,
    paddingHorizontal: 12,
    marginTop:         8,
  },
  rolTexto: {
    color:      COLORS.white,
    fontSize:   12,
    fontWeight: 'bold',
  },
  avatarBtn: {
    alignItems: 'center',
    gap:        6,
  },
  avatar: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.5)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  avatarTexto: {
    color:      COLORS.white,
    fontSize:   22,
    fontWeight: 'bold',
  },
  salirTexto: {
    color:    'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  menuContainer: {
    padding: 20,
  },
  menuTitulo: {
    fontSize:     18,
    fontWeight:   'bold',
    color:        COLORS.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  tarjeta: {
    width:           CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius:    16,
    padding:         18,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.06,
    shadowRadius:    8,
    elevation:       3,
  },
  tarjetaIcono: {
    fontSize:     32,
    marginBottom: 10,
  },
  tarjetaTitulo: {
    fontSize:     15,
    fontWeight:   'bold',
    color:        COLORS.text,
    marginBottom: 4,
  },
  tarjetaDesc: {
    fontSize:     12,
    color:        COLORS.textLight,
    lineHeight:   16,
  },
  tarjetaFlecha: {
    position: 'absolute',
    top:      12,
    right:    14,
  },
  flechaTexto: {
    fontSize: 20,
    color:    COLORS.border,
  },
  footerContainer: {
    alignItems:     'center',
    padding:        24,
    paddingTop:     8,
  },
  footerTexto: {
    color:    COLORS.textLight,
    fontSize: 13,
  },
  footerSub: {
    color:     COLORS.textLight,
    fontSize:  11,
    marginTop: 4,
  },
  headerLogo: {
  position:        'absolute',
  top:             16,
  right:           16,
  width:           50,
  height:          50,
  borderRadius:    25,
  backgroundColor: 'rgba(255,255,255,0.95)',
  justifyContent:  'center',
  alignItems:      'center',
  overflow:        'hidden',
},
headerLogoImg: {
  width:  40,
  height: 40,
},
});