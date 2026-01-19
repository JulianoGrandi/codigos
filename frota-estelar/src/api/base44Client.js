import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const base44 = {
  auth: {
    me: async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
      } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
      }
    },
    login: async (credentials) => {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    },
    logout: async () => {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    },
  },
  cadets: {
    getAll: async () => {
      const response = await axiosInstance.get('/cadets');
      return response.data;
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/cadets/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await axiosInstance.post('/cadets', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axiosInstance.put(`/cadets/${id}`, data);
      return response.data;
    },
  },
  missions: {
    getAll: async () => {
      const response = await axiosInstance.get('/missions');
      return response.data;
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/missions/${id}`);
      return response.data;
    },
    start: async (id) => {
      const response = await axiosInstance.post(`/missions/${id}/start`);
      return response.data;
    },
  },
  npcs: {
    getAll: async () => {
      const response = await axiosInstance.get('/npcs');
      return response.data;
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/npcs/${id}`);
      return response.data;
    },
    interact: async (id, action) => {
      const response = await axiosInstance.post(`/npcs/${id}/interact`, { action });
      return response.data;
    },
  },
};

export default axiosInstance;
