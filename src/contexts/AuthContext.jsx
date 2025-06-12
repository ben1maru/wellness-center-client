// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMe, logoutUser as apiLogout } from '../api/authApi'; // Імпортуємо getMe для перевірки токена
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Для індикації завантаження

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Для перевірки токена при завантаженні
  const [token, setTokenState] = useState(localStorage.getItem('token'));

  // Функція для оновлення токена в стані та localStorage
  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(newToken);
  }, []);

  // Перевірка токена при завантаженні додатка
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setTokenState(storedToken); // Встановлюємо токен в стан, щоб axiosInstance його підхопив
        try {
          // axiosInstance вже має мати токен з localStorage завдяки interceptor
          const currentUser = await getMe();
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error.message);
          // Токен недійсний або помилка сервера
          setToken(null); // Видалити недійсний токен
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    checkLoggedIn();
  }, [setToken]); // setToken тут для стабільності функції

  const login = (userData) => {
    // userData має містити токен та інформацію про користувача
    if (userData && userData.token) {
      setToken(userData.token);
      // Зберігаємо тільки необхідні дані користувача, не весь об'єкт, якщо він великий
      // або якщо токен містить достатньо інформації (наприклад, роль)
      const { token, ...userDetails } = userData;
      setUser(userDetails);
      setIsAuthenticated(true);
    } else {
      console.error("Login data is missing token:", userData);
    }
  };

  const logout = () => {
    apiLogout(); // Видаляє токен з localStorage
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Тут можна також викликати API для інвалідації токена на сервері, якщо така логіка є
  };

  const updateUserContext = (updatedUserData) => {
    // Функція для оновлення даних користувача в контексті, наприклад, після редагування профілю
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };


  if (isLoading) {
    // Показати глобальний лоадер, поки перевіряється стан автентифікації
    // Це запобігає "миготінню" інтерфейсу
    return <LoadingSpinner sx={{ height: '100vh' }} />;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, token, login, logout, updateUserContext, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};