// services/estudianteService.js
// Todas las llamadas a la API relacionadas con estudiantes.

import api from './api';

const estudianteService = {

  getAll: async (search = '') => {
    const response = await api.get('/estudiantes', {
      params: { search },
    });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/estudiantes/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/estudiantes', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/estudiantes/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/estudiantes/${id}`);
    return response.data;
  },
};

export default estudianteService;