// src/pages/public/LoginPage.jsx
import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm.jsx';
import { AuthContext } from '../../contexts/AuthContext.jsx'; // Для перевірки чи вже залогінений

const LoginPage = () => {
  const auth = React.useContext(AuthContext);
  const location = useLocation();

  if (auth && auth.isAuthenticated) {
    // Якщо користувач вже залогінений, перенаправляємо його
    const from = location.state?.from?.pathname || (auth.user?.role === 'admin' ? '/admin/dashboard' : (auth.user?.role === 'specialist' ? '/specialist/dashboard' : '/client/dashboard'));
    return <Navigate to={from} replace />;
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: {xs:4, sm:8}, mb:4 }}>
      <Paper elevation={3} sx={{ padding: {xs:2, sm:4}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <LockOutlinedIcon /> </Avatar> */}
        {/* Заголовок вже є в LoginForm */}
        <LoginForm />
      </Paper>
    </Container>
  );
};

export default LoginPage;