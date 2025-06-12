// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- РОУТЕР ТУТ
import App from './App'; // Або напряму AppRoutes, якщо App.js не використовується для обгортки
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- РОУТЕР ТУТ */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <App /> {/* Або <AppRoutes /> */}
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter> {/* <--- РОУТЕР ТУТ */}
  </React.StrictMode>
);