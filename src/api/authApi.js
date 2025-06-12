// src/api/authApi.js
import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    // Збереження токена та інформації про користувача може відбуватися тут або в AuthContext/Redux
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // localStorage.setItem('user', JSON.stringify(response.data)); // або лише потрібні поля
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMe = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Функція для виходу (просто видаляє токен)
export const logoutUser = () => {
  localStorage.removeItem('token');
  // localStorage.removeItem('user');
  // тут можна також сповістити інші частини додатку про вихід
};