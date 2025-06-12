// src/pages/public/BookingPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Stepper, Step, StepLabel, Button, CircularProgress,
  TextField, Grid, Link as MuiLink, Divider
} from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AppointmentForm from '../../components/Appointments/AppointmentForm.jsx';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';
import { getServiceById, getSpecialistById, createAppointment } from '../../api/dataApi.js';
import { format, formatISO } from 'date-fns';
import { uk } from 'date-fns/locale';

// Іконки для кроків
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const steps = ['Вибір послуги та часу', 'Ваші дані', 'Підтвердження'];

const StepIconComponent = (props) => {
  const { active, completed, icon } = props;
  const icons = {
    1: <EventSeatIcon />,
    2: <PersonOutlineIcon />,
    3: <CheckCircleOutlineIcon />,
  };

  return (
    <Box
      sx={{
        color: active ? 'primary.main' : completed ? 'success.main' : 'action.disabled',
        display: 'flex',
        height: 24,
        alignItems: 'center',
        ...(active && { fontWeight: 'bold' }),
      }}
    >
      {icons[String(icon)]}
    </Box>
  );
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  const initialServiceId = searchParams.get('service');
  const initialSpecialistId = searchParams.get('specialist');

  const [activeStep, setActiveStep] = useState(0);
  const [bookingDetails, setBookingDetails] = useState({
    serviceId: initialServiceId || '',
    specialistId: initialSpecialistId || '',
    appointmentDateTime: null,
    clientNotes: '',
    clientFirstName: isAuthenticated ? user?.first_name : '',
    clientLastName: isAuthenticated ? user?.last_name : '',
    clientEmail: isAuthenticated ? user?.email : '',
    clientPhone: isAuthenticated ? user?.phone_number : '',
  });

  const [serviceDetailsCache, setServiceDetailsCache] = useState(null);
  const [specialistDetailsCache, setSpecialistDetailsCache] = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // Завантаження деталей послуги та спеціаліста для підтвердження
  useEffect(() => {
    const fetchDetailsForConfirmation = async () => {
      if (bookingDetails.serviceId && !serviceDetailsCache) {
        try {
          const service = await getServiceById(bookingDetails.serviceId);
          setServiceDetailsCache(service);
        } catch (e) {
          console.error("Error fetching service for confirmation", e);
        }
      }
      if (bookingDetails.specialistId && !specialistDetailsCache) {
        try {
          const specialist = await getSpecialistById(bookingDetails.specialistId);
          setSpecialistDetailsCache(specialist);
        } catch (e) {
          console.error("Error fetching specialist for confirmation", e);
        }
      }
    };

    if (activeStep === 2) {
      fetchDetailsForConfirmation();
    }
  }, [activeStep, bookingDetails.serviceId, bookingDetails.specialistId, serviceDetailsCache, specialistDetailsCache]);

  const handleStep1Success = (formDataFromStep1) => {
    setBookingDetails(prev => ({
      ...prev,
      serviceId: formDataFromStep1.service_id,
      specialistId: formDataFromStep1.specialist_id,
      appointmentDateTime: formDataFromStep1.appointment_datetime,
      clientNotes: formDataFromStep1.client_notes,
    }));
    setActiveStep(1);
  };

  const handleStep2Submit = (event) => {
    event.preventDefault();
    if (!isAuthenticated && (!bookingDetails.clientFirstName?.trim() || !bookingDetails.clientEmail?.trim())) {
      showNotification("Будь ласка, вкажіть ваше ім'я та email.", "error");
      return;
    }
    setActiveStep(2);
  };

  const handleFinalSubmit = async () => {
    setIsSubmittingFinal(true);
    try {
      const dataToSend = {
        service_id: Number(bookingDetails.serviceId),
        specialist_id: bookingDetails.specialistId ? Number(bookingDetails.specialistId) : null,
        appointment_datetime: formatISO(bookingDetails.appointmentDateTime),
        client_notes: bookingDetails.clientNotes,
        client_first_name: bookingDetails.clientFirstName,
        client_last_name: bookingDetails.clientLastName,
        client_email: bookingDetails.clientEmail,
        client_phone: bookingDetails.clientPhone,
      };
      const response = await createAppointment(dataToSend);
      showNotification(response.message || 'Запис успішно створено!', 'success');
      navigate('/client/my-bookings', {
        state: { notification: { message: response.message || 'Запис успішно створено!', severity: 'success' } }
      });
      setActiveStep((prev) => prev + 1); // Перехід на фінальний екран
    } catch (error) {
      showNotification(error.message || 'Не вдалося створити запис.', 'error');
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <AppointmentForm
            key="booking-step-1"
            initialServiceId={bookingDetails.serviceId}
            initialSpecialistId={bookingDetails.specialistId}
            onSuccess={handleStep1Success}
            isStepMode={true}
          />
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleStep2Submit}>
            <Typography variant="h6" gutterBottom>Ваші контактні дані</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Ім'я" fullWidth required value={bookingDetails.clientFirstName}
                  onChange={(e) => setBookingDetails(p => ({ ...p, clientFirstName: e.target.value }))}
                  disabled={isAuthenticated} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Прізвище" fullWidth value={bookingDetails.clientLastName}
                  onChange={(e) => setBookingDetails(p => ({ ...p, clientLastName: e.target.value }))}
                  disabled={isAuthenticated} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" type="email" fullWidth required value={bookingDetails.clientEmail}
                  onChange={(e) => setBookingDetails(p => ({ ...p, clientEmail: e.target.value }))}
                  disabled={isAuthenticated} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Телефон" fullWidth value={bookingDetails.clientPhone}
                  onChange={(e) => setBookingDetails(p => ({ ...p, clientPhone: e.target.value }))}
                  disabled={isAuthenticated} />
              </Grid>
            </Grid>
            {!isAuthenticated && (
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Вже маєте акаунт? <MuiLink component={RouterLink} to="/login" state={{ from: location.pathname + location.search }}>Увійдіть</MuiLink> для швидшого запису.
              </Typography>
            )}
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" type="submit">Далі</Button>
              <Button sx={{ ml: 2 }} onClick={handleBack}>Назад</Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Підтвердження запису</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography><strong>Послуга:</strong> {serviceDetailsCache?.name || bookingDetails.serviceId || 'Не обрано'}</Typography>
              <Typography><strong>Спеціаліст:</strong> {specialistDetailsCache?.first_name || bookingDetails.specialistId || 'Будь-який'}</Typography>
              <Typography><strong>Дата та час:</strong> {bookingDetails.appointmentDateTime ? format(bookingDetails.appointmentDateTime, 'dd MMMM yyyy, HH:mm', { locale: uk }) : 'Не обрано'}</Typography>
              {bookingDetails.clientNotes && (
                <Typography><strong>Примітки:</strong> {bookingDetails.clientNotes}</Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography><strong>Ім'я клієнта:</strong> {bookingDetails.clientFirstName}</Typography>
              <Typography><strong>Прізвище клієнта:</strong> {bookingDetails.clientLastName}</Typography>
              <Typography><strong>Email:</strong> {bookingDetails.clientEmail}</Typography>
              <Typography><strong>Телефон:</strong> {bookingDetails.clientPhone}</Typography>
            </Paper>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleBack} sx={{ mr: 2 }}>Назад</Button>
              <Button variant="contained" color="primary" onClick={handleFinalSubmit} disabled={isSubmittingFinal}>
                {isSubmittingFinal ? <CircularProgress size={24} /> : 'Підтвердити запис'}
              </Button>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box textAlign="center" sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>Дякуємо за запис!</Typography>
            <Typography>Ми зв'яжемося з вами найближчим часом для підтвердження.</Typography>
            <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate('/')}>
              На головну
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageTitle title="Запис на послугу" />
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, idx) => (
            <Step key={label}>
              <StepLabel StepIconComponent={StepIconComponent}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {getStepContent(activeStep)}
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingPage;
