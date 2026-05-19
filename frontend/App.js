import React, { useEffect, useState } from 'react';
import { NavigationContainer }         from '@react-navigation/native';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { ActivityIndicator, View }     from 'react-native';
import ReporteAsistenciaScreen from './src/screens/ReporteAsistenciaScreen';

import authService            from './src/services/authService';
import { COLORS }             from './src/utils/constants';
import CambiarPasswordScreen from './src/screens/CambiarPasswordScreen';

// Splash
import SplashScreen           from './src/screens/SplashScreen';

// Auth
import LoginScreen            from './src/screens/LoginScreen';

// Dashboard
import DashboardScreen        from './src/screens/DashboardScreen';

// Admin
import EstudiantesScreen      from './src/screens/EstudiantesScreen';
import FormEstudianteScreen   from './src/screens/FormEstudianteScreen';
import DocentesScreen         from './src/screens/DocentesScreen';
import FormDocenteScreen      from './src/screens/FormDocenteScreen';
import AsignaturasScreen      from './src/screens/AsignaturasScreen';
import FormAsignaturaScreen   from './src/screens/FormAsignaturaScreen';
import CursosScreen           from './src/screens/CursosScreen';
import FormCursoScreen        from './src/screens/FormCursoScreen';
import MatriculasScreen       from './src/screens/MatriculasScreen';

// Docente
import AsistenciaScreen       from './src/screens/AsistenciaScreen';
import NotasScreen            from './src/screens/NotasScreen';
import MisCursosScreen        from './src/screens/MisCursosScreen';
import EstudiantesCursoScreen from './src/screens/EstudiantesCursoScreen';

// Estudiante
import MiPerfilScreen         from './src/screens/MiPerfilScreen';
import MisNotasScreen         from './src/screens/MisNotasScreen';
import MiAsistenciaScreen     from './src/screens/MiAsistenciaScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [mostrando,    setMostrando]    = useState('splash');
  const [sesionActiva, setSesionActiva] = useState(false);

  const onSplashFinish = async () => {
    const sesion = await authService.getSession();
    setSesionActiva(sesion !== null);
    setMostrando('app');
  };

  if (mostrando === 'splash') {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={sesionActiva ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerStyle:      { backgroundColor: COLORS.primary },
          headerTintColor:  COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* Auth */}
        <Stack.Screen name="Login"     component={LoginScreen}     options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />

        {/* Estudiantes */}
        <Stack.Screen name="Estudiantes"    component={EstudiantesScreen}    options={{ title: 'Estudiantes',    headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="FormEstudiante" component={FormEstudianteScreen} options={{ title: 'Estudiante',     headerBackTitle: 'Atrás' }} />

        {/* Docentes */}
        <Stack.Screen name="Docentes"    component={DocentesScreen}    options={{ title: 'Docentes', headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="FormDocente" component={FormDocenteScreen} options={{ title: 'Docente',  headerBackTitle: 'Atrás' }} />

        {/* Asignaturas */}
        <Stack.Screen name="Asignaturas"    component={AsignaturasScreen}    options={{ title: 'Asignaturas', headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="FormAsignatura" component={FormAsignaturaScreen} options={{ title: 'Asignatura',  headerBackTitle: 'Atrás' }} />

        {/* Cursos */}
        <Stack.Screen name="Cursos"    component={CursosScreen}    options={{ title: 'Cursos', headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="FormCurso" component={FormCursoScreen} options={{ title: 'Curso',  headerBackTitle: 'Atrás' }} />

        {/* Matrículas */}
        <Stack.Screen name="MatriculasScreen" component={MatriculasScreen} options={{ title: 'Matrículas', headerBackTitle: 'Atrás' }} />

        {/* Docente */}
        <Stack.Screen name="Asistencia"       component={AsistenciaScreen}       options={{ title: 'Asistencia',  headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="Notas"            component={NotasScreen}            options={{ title: 'Notas',       headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="MisCursos"        component={MisCursosScreen}        options={{ title: 'Mis Cursos', headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="EstudiantesCurso" component={EstudiantesCursoScreen} options={{ title: 'Estudiantes', headerBackTitle: 'Atrás' }} />

        {/* Estudiante */}
        <Stack.Screen name="MiPerfil"      component={MiPerfilScreen}    options={{ title: 'Mi Perfil',    headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="MisNotas"      component={MisNotasScreen}    options={{ title: 'Mis Notas',    headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="MiAsistencia"  component={MiAsistenciaScreen} options={{ title: 'Mi Asistencia', headerBackTitle: 'Atrás' }} />
        <Stack.Screen
          name="ReporteAsistencia"
          component={ReporteAsistenciaScreen}
          options={{ title: 'Reporte de Asistencia', headerBackTitle: 'Atrás' }}
        />
        <Stack.Screen
  name="CambiarPassword"
  component={CambiarPasswordScreen}
  options={{ title: 'Cambiar Contraseña', headerBackTitle: 'Atrás' }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}