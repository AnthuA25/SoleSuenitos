import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5247/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para manejar cookies si es necesario
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    // Manejar errores de CORS
    if (error.code === 'NETWORK_ERROR' || error.message.includes('CORS')) {
      console.error('Error de CORS. Verifica la configuración del servidor backend.');
    }
    
    return Promise.reject(error);
  }
);

export default api;