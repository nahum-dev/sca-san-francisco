// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const authService = {

  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    const { token, usuario } = response.data.data;
    await AsyncStorage.setItem('token',   token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
    return { token, usuario };
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  },

  getSession: async () => {
    const token   = await AsyncStorage.getItem('token');
    const usuario = await AsyncStorage.getItem('usuario');
    if (!token || !usuario) return null;
    return {
      token,
      usuario: JSON.parse(usuario),
    };
  },
};

export default authService;