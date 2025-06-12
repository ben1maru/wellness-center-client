// src/pages/client/ClientDashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageTitle from '../../components/Common/PageTitle.jsx'; // Перевірте шлях!
import AppointmentCard from '../../components/Appointments/AppointmentCard.jsx'; // Перевірте шлях!
import AlertMessage from '../../components/Common/AlertMessage.jsx'; // Перевірте шлях!
import { getMyAppointments } from '../../api/dataApi.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const ClientDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      setError('');
      try {
        const allAppointments = await getMyAppointments();
        // Фільтруємо майбутні та сортуємо
        const futureAndConfirmed = (allAppointments || [])
          .filter(app => 
            new Date(app.appointment_datetime) >= new Date() && 
            (app.status === 'pending' || app.status === 'confirmed')
          )
          .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))
          .slice(0, 3); // Показуємо, наприклад, 3 найближчі
        setUpcomingAppointments(futureAndConfirmed);
      } catch (err) {
        setError(err.message || 'Не вдалося завантажити ваші записи.');
        console.error("Fetch upcoming appointments error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <Box>
      <PageTitle 
        title={`Вітаємо у вашому кабінеті, ${user?.first_name || 'Клієнт'}!`} 
        subtitle="Тут ви можете керувати своїми записами та профілем."
      />

      {error && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Швидкі посилання */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper component={RouterLink} to="/client/my-bookings" sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': {boxShadow:3}, height: '100%' }}>
            <EventNoteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Мої Записи</Typography>
            <Typography variant="body2" color="text.secondary">Перегляд всіх ваших активних та минулих записів.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper component={RouterLink} to="/client/profile" sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': {boxShadow:3}, height: '100%' }}>
            <AccountCircleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Мій Профіль</Typography>
            <Typography variant="body2" color="text.secondary">Оновлення вашої особистої інформації та налаштувань.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={4}> {/* Змінив sm на 12 для кращого вигляду на планшетах */}
          <Paper component={RouterLink} to="/booking" sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': {boxShadow:3}, height: '100%' }}>
            <AddCircleOutlineIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Записатися на Послугу</Typography>
            <Typography variant="body2" color="text.secondary">Оберіть послугу та зручний час для візиту.</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Найближчі Записи
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
      ) : upcomingAppointments.length > 0 ? (
        <Grid container spacing={2}>
          {upcomingAppointments.map(app => (
            <Grid item xs={12} md={6} lg={4} key={app.id}>
              <AppointmentCard appointment={app} userRole="client" /* onCancel можна додати тут */ />
            </Grid>
          ))}
        </Grid>
      ) : (
        !error && <Typography color="text.secondary">У вас немає найближчих активних записів.</Typography>
      )}
      {upcomingAppointments.length > 0 && (
        <Box sx={{textAlign: 'center', mt:3}}>
            <Button component={RouterLink} to="/client/my-bookings" variant="outlined">
                Переглянути всі записи
            </Button>
        </Box>
      )}
    </Box>
  );
};

export default ClientDashboardPage;