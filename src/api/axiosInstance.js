// src/api/axiosInstance.js
import axios from 'axios';

// Отримуємо URL API з .env або використовуємо дефолтний
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Інтерсептор для додавання токена до кожного запиту
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Або з auth context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Інтерсептор для обробки відповідей (наприклад, для логауту при 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Тут можна реалізувати логіку логауту
      // наприклад, localStorage.removeItem('token');
      // window.location.href = '/login';
      console.error('Unauthorized, logging out or redirecting...');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;