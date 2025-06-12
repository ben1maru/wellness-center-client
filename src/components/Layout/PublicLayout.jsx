// src/components/Layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material'; // Container тут не потрібен, він буде на кожній сторінці
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const PublicLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, /* py: 0 - відступи керуються на рівні сторінок або контейнерів */ }}>
        <Outlet /> 
      </Box>
      <Footer />
    </Box>
  );
};

export default PublicLayout;