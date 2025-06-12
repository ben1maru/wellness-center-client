// src/pages/specialist/SpecialistDashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AppointmentCard from '../../components/Appointments/AppointmentCard.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { getAllAppointments } from '../../api/dataApi.js'; // getAllAppointments буде фільтрувати для спеціаліста на бекенді
import { AuthContext } from '../../contexts/AuthContext.jsx';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Для розкладу/календаря

const SpecialistDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointmentsForSpecialist = async () => {
      if (!user || user.role !== 'specialist') return; // Перевірка ролі
      setLoading(true);
      setError('');
      try {
        // getAllAppointments на бекенді має автоматично фільтрувати для спеціаліста за його user.id
        const allMyAppointments = await getAllAppointments(); 
        
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setHours(23, 59, 59, 999));

        const todays = (allMyAppointments || [])
          .filter(app => {
            const appDate = new Date(app.appointment_datetime);
            return appDate >= todayStart && appDate <= todayEnd && (app.status === 'confirmed' || app.status === 'pending');
          })
          .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime));
        
        const upcoming = (allMyAppointments || [])
          .filter(app => {
            const appDate = new Date(app.appointment_datetime);
            return appDate > todayEnd && (app.status === 'confirmed' || app.status === 'pending');
          })
          .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))
          .slice(0, 3); // Наприклад, 3 найближчі майбутні

        setTodaysAppointments(todays);
        setUpcomingAppointments(upcoming);

      } catch (err) {
        setError(err.message || 'Не вдалося завантажити ваші записи.');
        console.error("Fetch specialist appointments error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentsForSpecialist();
  }, [user]);

  return (
    <Box>
      <PageTitle 
        title={`Кабінет Спеціаліста: ${user?.first_name || ''} ${user?.last_name || ''}`}
        subtitle="Ваша панель для управління записами та профілем."
      />
      {error && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
            <Paper component={RouterLink} to="/specialist/appointments" sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': {boxShadow:3}, height: '100%' }}>
                <EventNoteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Мої Записи</Typography>
                <Typography variant="body2" color="text.secondary">Перегляд всіх ваших призначених записів.</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
             <Paper component={RouterLink} to="/specialist/profile" sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': {boxShadow:3}, height: '100%' }}>
                <AccountCircleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Мій Профіль</Typography>
                <Typography variant="body2" color="text.secondary">Редагування вашої інформації та налаштувань.</Typography>
            </Paper>
        </Grid>
        {/* Можна додати посилання на управління розкладом, якщо така функція буде */}
        {/*
        <Grid item xs={12} sm={6} md={4}>
             <Paper component={RouterLink} to="/specialist/schedule" sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', color: 'inherit', '&:hover': {boxShadow:3}, height: '100%' }}>
                <CalendarTodayIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Мій Розклад</Typography>
                <Typography variant="body2" color="text.secondary">Керування вашою доступністю та робочими годинами.</Typography>
            </Paper>
        </Grid>
        */}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Записи на Сьогодні</Typography>
      {loading ? <Box sx={{display:'flex', justifyContent:'center'}}><CircularProgress /></Box> : 
       todaysAppointments.length > 0 ? (
        <Grid container spacing={2}>
          {todaysAppointments.map(app => (
            <Grid item xs={12} md={6} key={app.id}>
              <AppointmentCard appointment={app} userRole="specialist" />
            </Grid>
          ))}
        </Grid>
      ) : (
        !error && <Typography color="text.secondary">У вас немає записів на сьогодні.</Typography>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Найближчі Майбутні Записи</Typography>
      {loading ? <Box sx={{display:'flex', justifyContent:'center'}}><CircularProgress /></Box> :
       upcomingAppointments.length > 0 ? (
        <Grid container spacing={2}>
          {upcomingAppointments.map(app => (
            <Grid item xs={12} md={6} key={app.id}>
              <AppointmentCard appointment={app} userRole="specialist" />
            </Grid>
          ))}
        </Grid>
      ) : (
         !error && <Typography color="text.secondary">У вас немає найближчих майбутніх записів.</Typography>
      )}
      {(todaysAppointments.length > 0 || upcomingAppointments.length > 0) && (
         <Box sx={{textAlign: 'center', mt:3}}>
            <Button component={RouterLink} to="/specialist/appointments" variant="outlined">
                Переглянути всі мої записи
            </Button>
        </Box>
      )}
    </Box>
  );
};

export default SpecialistDashboardPage;