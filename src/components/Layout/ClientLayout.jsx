// src/components/Layout/ClientLayout.jsx
import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header.jsx'; // Використовуємо той самий Header
import Footer from './Footer.jsx'; // Використовуємо той самий Footer
import { AuthContext } from '../../contexts/AuthContext.jsx'; // Перевірте розширення
import LoadingSpinner from '../Common/LoadingSpinner.jsx'; // Для isLoading

const ClientLayout = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  // Якщо auth ще не завантажився, показуємо лоадер
  if (!auth || auth.isLoading) {
    return <LoadingSpinner sx={{ height: '100vh' }} />;
  }

  const { isAuthenticated, user } = auth;

  // Захист маршруту:
  // 1. Користувач має бути автентифікований.
  // 2. Роль користувача має бути 'client', 'specialist', або 'admin' (адмін і спеціаліст можуть бачити кабінет клієнта).
  //    Якщо потрібен доступ тільки для 'client', змініть умову.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!user || !['client', 'specialist', 'admin'].includes(user.role)) {
    // Якщо роль не підходить, але користувач залогінений, можливо, на головну або на сторінку "доступ заборонено"
    // console.warn(`User role "${user?.role}" not explicitly allowed for ClientLayout, redirecting.`);
    return <Navigate to="/" replace />; // Або на спеціальну сторінку /unauthorized
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: {xs: 2, sm: 3} // Додамо трохи відступів для основного контенту
        }}
      >
        {/* Container для обмеження ширини контенту сторінок можна додати тут або на кожній окремій сторінці клієнта */}
        {/* <Container maxWidth="lg"> */}
            <Outlet /> {/* Тут буде рендеритися вміст поточної сторінки кабінету клієнта */}
        {/* </Container> */}
      </Box>
      <Footer />
    </Box>
  );
};

export default ClientLayout;