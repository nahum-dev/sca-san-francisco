// services/api.js
// Configuración central de Axios para todas las llamadas a la API.
// Interceptores que agregan el token JWT automáticamente.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/constants';

console.log('API URL:', API_URL);

// Crear instancia de Axios con la URL base
const api = axios.create({
  baseURL: API_URL + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Interceptor de REQUEST:
// Antes de cada petición, agrega el token JWT al header Authorization
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE:
// Si el servidor responde 401 (token expirado), limpia la sesión
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
    }
    return Promise.reject(error);
  }
);

export default api;