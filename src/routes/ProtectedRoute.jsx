// src/routes/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx'; // Перевірте шлях!
import LoadingSpinner from '../components/Common/LoadingSpinner.jsx'; // Перевірте шлях!

const ProtectedRoute = ({ allowedRoles }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  // Якщо контекст ще завантажується, показуємо лоадер
  if (!auth || auth.isLoading) {
    return <LoadingSpinner sx={{ height: '100vh' }} />; // Глобальний лоадер на всю сторінку
  }

  const { isAuthenticated, user } = auth;

  if (!isAuthenticated) {
    // Користувач не залогінений, перенаправляємо на сторінку входу
    // Зберігаємо поточний шлях, щоб повернутися після логіну
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Перевіряємо, чи має користувач одну з дозволених ролей
  // allowedRoles - це масив рядків, наприклад ['admin', 'client']
  // Якщо allowedRoles не передано, то доступ дозволено будь-якому автентифікованому користувачу
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      // Користувач залогінений, але не має потрібної ролі
      // Перенаправляємо на головну або на сторінку "Доступ заборонено"
      console.warn(`User with role "${user?.role}" tried to access a route restricted to roles: ${allowedRoles.join(', ')}`);
      return <Navigate to="/unauthorized" replace />; // Або на '/'
    }
  }
  
  // Якщо всі перевірки пройдені, рендеримо дочірній компонент (сторінку)
  // <Outlet /> буде замінено на відповідний компонент з конфігурації маршрутів
  return <Outlet />; 
};

export default ProtectedRoute;