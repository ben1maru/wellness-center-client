// src/pages/client/MyBookingsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, CircularProgress, Grid, Button, Tabs, Tab } from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AppointmentCard from '../../components/Appointments/AppointmentCard.jsx';
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { getMyAppointments, updateAppointment } from '../../api/dataApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';
import { AuthContext } from '../../contexts/AuthContext.jsx';

const MyBookingsPage = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active'); // 'active', 'past', 'cancelled'

  const [openConfirmCancel, setOpenConfirmCancel] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyAppointments();
      setAppointments(data || []);
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити ваші записи.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    try {
      // Клієнт може скасовувати тільки свої 'pending' або 'confirmed' записи
      await updateAppointment(appointmentToCancel.id, { status: 'cancelled_by_client' });
      showNotification('Запис успішно скасовано.', 'success');
      fetchAppointments(); // Оновити список
    } catch (err) {
      showNotification(err.message || 'Не вдалося скасувати запис.', 'error');
    } finally {
      setIsCancelling(false);
      setOpenConfirmCancel(false);
      setAppointmentToCancel(null);
    }
  };

  const openCancelDialog = (appointment) => {
    if (appointment.status === 'pending' || appointment.status === 'confirmed') {
        setAppointmentToCancel(appointment);
        setOpenConfirmCancel(true);
    } else {
        showNotification('Цей запис неможливо скасувати.', 'warning');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const appDate = new Date(app.appointment_datetime);
    const now = new Date();
    if (filter === 'active') {
      return (app.status === 'pending' || app.status === 'confirmed') && appDate >= now;
    }
    if (filter === 'past') {
      return app.status === 'completed' || (app.status === 'no_show') || 
             ((app.status === 'pending' || app.status === 'confirmed') && appDate < now);
    }
    if (filter === 'cancelled') {
      return app.status === 'cancelled_by_client' || app.status === 'cancelled_by_admin';
    }
    return true;
  }).sort((a,b) => filter === 'active' ? new Date(a.appointment_datetime) - new Date(b.appointment_datetime) : new Date(b.appointment_datetime) - new Date(a.appointment_datetime) );


  return (
    <Box>
      <PageTitle title="Мої Записи на Прийом" />
      {error && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}} />}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filter} onChange={(e, newValue) => setFilter(newValue)} aria-label="Фільтр записів">
          <Tab label="Активні" value="active" />
          <Tab label="Минулі" value="past" />
          <Tab label="Скасовані" value="cancelled" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
      ) : filteredAppointments.length > 0 ? (
        <Grid container spacing={2}>
          {filteredAppointments.map(app => (
            <Grid item xs={12} md={6} key={app.id}>
              <AppointmentCard 
                appointment={app} 
                userRole={user?.role}
                onCancel={() => openCancelDialog(app)} // Передаємо функцію для скасування
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary" sx={{textAlign: 'center', my: 3}}>
          {filter === 'active' && 'У вас немає активних записів.'}
          {filter === 'past' && 'У вас немає минулих записів.'}
          {filter === 'cancelled' && 'У вас немає скасованих записів.'}
        </Typography>
      )}

      <ConfirmDialog
        open={openConfirmCancel}
        onClose={() => setOpenConfirmCancel(false)}
        onConfirm={handleCancelAppointment}
        title="Скасувати запис?"
        message={`Ви впевнені, що хочете скасувати запис на послугу "${appointmentToCancel?.service_name}"?`}
        confirmText="Так, скасувати"
        isSubmitting={isCancelling}
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default MyBookingsPage;