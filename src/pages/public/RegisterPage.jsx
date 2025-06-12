// src/pages/public/RegisterPage.jsx
import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import RegisterForm from '../../components/Auth/RegisterForm.jsx';
import { AuthContext } from '../../contexts/AuthContext.jsx';

const RegisterPage = () => {
  const auth = React.useContext(AuthContext);
  const location = useLocation();

  if (auth && auth.isAuthenticated) {
    // Якщо користувач вже залогінений, перенаправляємо його
    const from = location.state?.from?.pathname || (auth.user?.role === 'admin' ? '/admin/dashboard' : (auth.user?.role === 'specialist' ? '/specialist/dashboard' : '/client/dashboard'));
    return <Navigate to={from} replace />;
  }
  return (
    <Container component="main" maxWidth="sm" sx={{ mt: {xs:4, sm:8}, mb:4 }}> {/* maxWidth="sm" для більшої форми */}
      <Paper elevation={3} sx={{ padding: {xs:2, sm:4}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Заголовок вже є в RegisterForm */}
        <RegisterForm />
      </Paper>
    </Container>
  );
};

export default RegisterPage;