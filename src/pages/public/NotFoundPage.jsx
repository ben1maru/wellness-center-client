// src/pages/public/NotFoundPage.jsx
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Іконка

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: {xs:5, md:10} }}>
      <ReportProblemIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
      <Typography variant="h3" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
        404
      </Typography>
      <Typography variant="h5" component="h2" color="text.secondary" paragraph>
        Сторінку не знайдено
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        На жаль, сторінка, яку ви шукаєте, не існує. Можливо, вона була переміщена або видалена.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        color="primary"
        size="large"
        sx={{mt:2}}
      >
        Повернутися на Головну
      </Button>
    </Container>
  );
};

export default NotFoundPage;