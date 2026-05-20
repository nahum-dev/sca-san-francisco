// screens/FormEstudianteScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import estudianteService from '../services/estudianteService';
import { COLORS } from '../utils/constants';

// ✅ Campo definido FUERA del componente principal
// Esto evita que React lo destruya en cada re-render
const Campo = ({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false, error }) => (
  <View style={styles.campo}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
    />
    {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
  </View>
);

export default function FormEstudianteScreen({ route, navigation }) {
  const estudianteExistente = route.params?.estudiante || null;
  const modoEdicion         = estudianteExistente !== null;

  const [form, setForm] = useState({
    nombres:   estudianteExistente?.nombres   || '',
    apellidos: estudianteExistente?.apellidos || '',
    email:     estudianteExistente?.email     || '',
    password:  '',
    fecha_nac: estudianteExistente?.fecha_nac || '',
    genero:    estudianteExistente?.genero    || 'M',
    grado:     estudianteExistente?.grado     || '',
    seccion:   estudianteExistente?.seccion   || '',
    telefono:  estudianteExistente?.telefono  || '',
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  // useCallback evita que la función se recree en cada render
  const actualizar = useCallback((campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => ({ ...prev, [campo]: null }));
  }, []);

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombres.trim())   nuevosErrores.nombres   = 'Los nombres son obligatorios.';
    if (!form.apellidos.trim()) nuevosErrores.apellidos = 'Los apellidos son obligatorios.';
    if (!form.fecha_nac.trim()) nuevosErrores.fecha_nac = 'La fecha de nacimiento es obligatoria.';
    if (!form.grado.trim())     nuevosErrores.grado     = 'El grado es obligatorio.';
    if (!form.seccion.trim())   nuevosErrores.seccion   = 'La sección es obligatoria.';

    if (!modoEdicion) {
      if (!form.email.trim())    nuevosErrores.email    = 'El email es obligatorio.';
      if (!form.password.trim()) nuevosErrores.password = 'La contraseña es obligatoria.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
  if (!validar()) return;
  setLoading(true);
  try {
    if (modoEdicion) {
      await estudianteService.update(estudianteExistente.id, form);
      Alert.alert('Éxito', 'Estudiante actualizado correctamente.');
    } else {
      const resultado = await estudianteService.create(form);
      const username = resultado?.username || `est.${form.email.split('@')[0]}`;
      Alert.alert(
        'Estudiante Creado',
        `✅ Creado correctamente.\n\nUsuario de acceso: ${username}\nContraseña: ${form.password}`,
        [{ text: 'Entendido', onPress: () => navigation.goBack() }]
      );
      return;
    }
    navigation.goBack();
  } catch (err) {
    const mensaje = err.response?.data?.message || 'Ocurrió un error.';
    Alert.alert('Error', mensaje);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>

      <Text style={styles.titulo}>
        {modoEdicion ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      </Text>

      <Campo
        label="Nombres *"
        value={form.nombres}
        onChangeText={(val) => actualizar('nombres', val)}
        placeholder="Nombres del estudiante"
        error={errores.nombres}
      />

      <Campo
        label="Apellidos *"
        value={form.apellidos}
        onChangeText={(val) => actualizar('apellidos', val)}
        placeholder="Apellidos del estudiante"
        error={errores.apellidos}
      />

      {/* Selector de Género */}
      <View style={styles.campo}>
        <Text style={styles.label}>Género *</Text>
        <View style={styles.generoRow}>
          {['M', 'F'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.generoBtn, form.genero === g && styles.generoBtnActivo]}
              onPress={() => actualizar('genero', g)}
            >
              <Text style={[styles.generoBtnTexto, form.genero === g && styles.generoBtnTextoActivo]}>
                {g === 'M' ? 'Masculino' : 'Femenino'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Campo
        label="Fecha de Nacimiento *"
        value={form.fecha_nac}
        onChangeText={(val) => actualizar('fecha_nac', val)}
        placeholder="YYYY-MM-DD"
        error={errores.fecha_nac}
      />

      <Campo
        label="Grado *"
        value={form.grado}
        onChangeText={(val) => actualizar('grado', val)}
        placeholder="Ej: 9no Grado"
        error={errores.grado}
      />

      <Campo
        label="Sección *"
        value={form.seccion}
        onChangeText={(val) => actualizar('seccion', val)}
        placeholder="Ej: A"
        error={errores.seccion}
      />

      <Campo
        label="Teléfono"
        value={form.telefono}
        onChangeText={(val) => actualizar('telefono', val)}
        placeholder="Ej: 7100-0001"
        keyboardType="phone-pad"
        error={errores.telefono}
      />

      {!modoEdicion && (
        <>
          <Campo
            label="Correo Electrónico *"
            value={form.email}
            onChangeText={(val) => actualizar('email', val)}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            error={errores.email}
          />
          <Campo
            label="Contraseña *"
            value={form.password}
            onChangeText={(val) => actualizar('password', val)}
            placeholder="Contraseña de acceso"
            secureTextEntry
            error={errores.password}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.botonGuardar, loading && styles.botonDeshabilitado]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.botonTexto}>
            {modoEdicion ? 'Guardar Cambios' : 'Crear Estudiante'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonCancelar}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.botonCancelarTexto}>Cancelar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  contenido: {
    padding:       20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize:     22,
    fontWeight:   'bold',
    color:        COLORS.text,
    marginBottom: 24,
  },
  campo: {
    marginBottom: 16,
  },
  label: {
    fontSize:     14,
    fontWeight:   '600',
    color:        COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor:   COLORS.white,
    borderWidth:       1,
    borderColor:       COLORS.border,
    borderRadius:      8,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:          15,
    color:             COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorTexto: {
    color:     COLORS.error,
    fontSize:  12,
    marginTop: 4,
  },
  generoRow: {
    flexDirection: 'row',
    gap:           10,
  },
  generoBtn: {
    flex:              1,
    borderWidth:       1,
    borderColor:       COLORS.border,
    borderRadius:      8,
    paddingVertical:   12,
    alignItems:        'center',
    backgroundColor:   COLORS.white,
  },
  generoBtnActivo: {
    backgroundColor: COLORS.primary,
    borderColor:     COLORS.primary,
  },
  generoBtnTexto: {
    color:      COLORS.text,
    fontWeight: '600',
  },
  generoBtnTextoActivo: {
    color: COLORS.white,
  },
  botonGuardar: {
    backgroundColor: COLORS.primary,
    borderRadius:    8,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:       8,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color:      COLORS.white,
    fontSize:   16,
    fontWeight: 'bold',
  },
  botonCancelar: {
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    8,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:       12,
  },
  botonCancelarTexto: {
    color:      COLORS.text,
    fontSize:   16,
    fontWeight: '600',
  },
});