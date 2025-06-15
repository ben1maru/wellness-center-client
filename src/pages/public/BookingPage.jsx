// src/pages/public/BookingPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Stepper, Step, StepLabel, Button, CircularProgress,
  Grid, Link as MuiLink, Divider, TextField
} from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AppointmentForm from '../../components/Appointments/AppointmentForm.jsx';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';
// getServiceById, getSpecialistById - для відображення назв на кроці підтвердження
import { createAppointment, getServiceById, getSpecialistById } from '../../api/dataApi.js';
import { format, parseISO, isValid as isValidDate, formatISO } from 'date-fns';
// import { uk } from 'date-fns/locale'; // uk locale no longer needed for the specific format change

import EventSeatIcon from '@mui/icons-material/EventSeat';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const steps = ['Вибір послуги та часу', 'Ваші дані', 'Підтвердження'];

const StepIconComponent = (props) => {
  const { active, completed, icon } = props;
  const icons = { 1: <EventSeatIcon />, 2: <PersonOutlineIcon />, 3: <CheckCircleOutlineIcon /> };
  return ( <Box sx={{ color: active ? 'primary.main' : completed ? 'success.main' : 'action.disabled', display: 'flex', height: 24, alignItems: 'center', ...(active && { fontWeight: 'bold' })}}> {icons[String(icon)]} </Box> );
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  const initialServiceIdFromUrl = searchParams.get('service');
  const initialSpecialistIdFromUrl = searchParams.get('specialist');

  const [activeStep, setActiveStep] = useState(0);
  const [bookingDetails, setBookingDetails] = useState({
    service_id: initialServiceIdFromUrl || '',
    specialist_id: initialSpecialistIdFromUrl || '',
    appointment_datetime: null,
    client_notes: '',
    // Дані клієнта, заповнюються з context або на кроці 2
    clientData: {
        first_name: isAuthenticated && user ? user.first_name || '' : '',
        last_name: isAuthenticated && user ? user.last_name || '' : '',
        email: isAuthenticated && user ? user.email || '' : '',
        phone_number: isAuthenticated && user ? user.phone_number || '' : '',
    }
  });

  const [serviceDetailsCache, setServiceDetailsCache] = useState(null);
  const [specialistDetailsCache, setSpecialistDetailsCache] = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [loadingStepDetails, setLoadingStepDetails] = useState(false);


  useEffect(() => {
    const fetchDetailsForStep2 = async () => {
      if (activeStep === 2) { // Тільки для кроку підтвердження
        setLoadingStepDetails(true);
        try {
          if (bookingDetails.service_id && (!serviceDetailsCache || String(serviceDetailsCache.id) !== String(bookingDetails.service_id))) {
            const service = await getServiceById(bookingDetails.service_id);
            setServiceDetailsCache(service);
          }
          if (bookingDetails.specialist_id && (!specialistDetailsCache || String(specialistDetailsCache.id) !== String(bookingDetails.specialist_id))) {
            const specialist = await getSpecialistById(bookingDetails.specialist_id);
            setSpecialistDetailsCache(specialist);
          }
        } catch (e) {
          console.error("Помилка завантаження деталей для кроку підтвердження:", e);
          showNotification("Помилка завантаження деталей для підтвердження.", "error");
        } finally {
          setLoadingStepDetails(false);
        }
      }
    };
    fetchDetailsForStep2();
  }, [activeStep, bookingDetails.service_id, bookingDetails.specialist_id, showNotification]);

  // Коли користувач логіниться/виходить, оновлюємо дані клієнта у формі
  useEffect(() => {
    if (isAuthenticated && user) {
      setBookingDetails(prev => ({
        ...prev,
        clientData: {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
        }
      }));
    } else {
        // Якщо потрібно скидати дані для незалогіненого користувача, можна зробити так:
        // setBookingDetails(prev => ({
        //   ...prev,
        //   clientData: { first_name: '', last_name: '', email: '', phone_number: '' }
        // }));
    }
  }, [isAuthenticated, user]);


  const handleStep0Success = (formDataFromStep0) => {
    console.log("BookingPage: Дані з Кроку 0 (AppointmentForm):", formDataFromStep0);
    setBookingDetails(prev => ({
      ...prev,
      service_id: String(formDataFromStep0.service_id),
      specialist_id: formDataFromStep0.specialist_id ? String(formDataFromStep0.specialist_id) : '',
      appointment_datetime: formDataFromStep0.appointment_datetime, // Це об'єкт Date
      client_notes: formDataFromStep0.client_notes,
    }));
    setActiveStep(1);
  };

  const handleClientDataChange = (e) => {
    setBookingDetails(prev => ({
        ...prev,
        clientData: {
            ...prev.clientData,
            [e.target.name]: e.target.value
        }
    }));
  };

  const handleStep1Submit = (event) => {
    event.preventDefault();
    if (!isAuthenticated && (!bookingDetails.clientData.first_name?.trim() || !bookingDetails.clientData.email?.trim())) {
        showNotification("Будь ласка, вкажіть ваше ім'я та email.", "error");
        return;
    }
     if (!isAuthenticated && bookingDetails.clientData.email?.trim() && !/\S+@\S+\.\S+/.test(bookingDetails.clientData.email)) {
        showNotification("Некоректний формат email.", "error");
        return;
    }
    setActiveStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!bookingDetails.service_id || !bookingDetails.appointment_datetime) {
        showNotification("Не всі необхідні дані для запису заповнені.", "error");
        return;
    }
    setIsSubmittingFinal(true);
    try {
        const dataToSend = {
            service_id: Number(bookingDetails.service_id),
            specialist_id: bookingDetails.specialist_id ? Number(bookingDetails.specialist_id) : null,
            // bookingDetails.appointment_datetime - це об'єкт Date
            // formatISO перетворює його на рядок типу '2023-10-26T10:30:00.000Z' (UTC)
            appointment_datetime: formatISO(bookingDetails.appointment_datetime),
            client_notes: bookingDetails.client_notes,
        };

        // Логуємо дані, що відправляються на сервер
        console.log("BookingPage: Дані, що відправляються на createAppointment:", dataToSend);
        // Особливо зверніть увагу на dataToSend.appointment_datetime

        const response = await createAppointment(dataToSend);
        showNotification(response.message || 'Запис успішно створено!', 'success');
        setActiveStep(steps.length);
    } catch (error) {
        console.error("BookingPage: Помилка при фінальному відправленні:", error, error.response?.data?.message || error.message);
        showNotification(error.response?.data?.message || error.message || 'Не вдалося створити запис. Спробуйте ще раз.', 'error');
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
            key={`booking-step0-${initialServiceIdFromUrl}-${initialSpecialistIdFromUrl}-${bookingDetails.appointment_datetime ? bookingDetails.appointment_datetime.toISOString() : 'no-date'}`} // Додав ключ для ре-рендеру при зміні дати
            initialServiceId={bookingDetails.service_id}
            initialSpecialistId={bookingDetails.specialist_id}
            fixedDateTime={bookingDetails.appointment_datetime}
            onSuccess={handleStep0Success}
            isStepMode={true}
          />
        );
      case 1:
        return (
          <Box component="form" id="client-data-form" onSubmit={handleStep1Submit}>
            <Typography variant="h6" gutterBottom sx={{mb:2}}>Крок 2: Ваші контактні дані</Typography>
            {!isAuthenticated ? (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}> <TextField name="first_name" label="Ім'я" fullWidth required value={bookingDetails.clientData.first_name} onChange={handleClientDataChange} /> </Grid>
                  <Grid item xs={12} sm={6}> <TextField name="last_name" label="Прізвище" fullWidth value={bookingDetails.clientData.last_name} onChange={handleClientDataChange} /> </Grid>
                  <Grid item xs={12} sm={6}> <TextField name="email" label="Email" type="email" fullWidth required value={bookingDetails.clientData.email} onChange={handleClientDataChange} /> </Grid>
                  <Grid item xs={12} sm={6}> <TextField name="phone_number" label="Телефон" fullWidth value={bookingDetails.clientData.phone_number} onChange={handleClientDataChange} /> </Grid>
                </Grid>
                <Typography variant="caption" display="block" sx={{ mt: 2, textAlign:'center' }}>
                  Вже маєте акаунт? <MuiLink component={RouterLink} to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}>Увійдіть</MuiLink> для швидшого запису.
                </Typography>
              </>
            ) : (
              <Paper variant="outlined" sx={{p:2, textAlign:'center'}}>
                <Typography>Ви увійшли як: <strong>{user.first_name} {user.last_name}</strong></Typography>
                <Typography variant="body2" color="text.secondary">Email: {user.email}</Typography>
                {user.phone_number && <Typography variant="body2" color="text.secondary">Телефон: {user.phone_number}</Typography>}
                <Typography variant="caption" display="block" sx={{mt:1.5}}>
                    Це не ви? <MuiLink component={RouterLink} to={`/logout?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}>Вийти та вказати інші дані</MuiLink>.
                </Typography>
              </Paper>
            )}
          </Box>
        );
      case 2:
        if (loadingStepDetails) return <Box sx={{display:'flex', justifyContent:'center', p:3}}><CircularProgress/></Box>;
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{mb:2}}>Крок 3: Підтвердження запису</Typography>
            <Paper variant="outlined" sx={{p:2.5, '& p': {mb: 0.75}}}>
                <Typography><strong>Послуга:</strong> {serviceDetailsCache?.name || `ID послуги: ${bookingDetails.service_id}` || 'Не обрано'}</Typography>
                {bookingDetails.specialist_id && <Typography><strong>Спеціаліст:</strong> {specialistDetailsCache?.first_name ? `${specialistDetailsCache.first_name} ${specialistDetailsCache.last_name || ''}` : `ID спеціаліста: ${bookingDetails.specialist_id}` || 'Будь-який'}</Typography>}
                <Typography><strong>Дата та час:</strong> {bookingDetails.appointment_datetime ? format(bookingDetails.appointment_datetime, 'yyyy-MM-dd HH:mm:ss') : 'Не обрано'}</Typography>
                {bookingDetails.client_notes && <Typography><strong>Ваші нотатки:</strong> {bookingDetails.client_notes}</Typography>}
                <Divider sx={{my:2}}/>
                <Typography variant="subtitle1" sx={{fontWeight:'medium'}}><strong>Ваші дані для запису:</strong></Typography>
                <Typography>{bookingDetails.clientData.first_name} {bookingDetails.clientData.last_name}</Typography>
                <Typography>{bookingDetails.clientData.email}</Typography>
                {bookingDetails.clientData.phone_number && <Typography>Телефон: {bookingDetails.clientData.phone_number}</Typography>}
            </Paper>
          </Box>
        );
      default: return 'Невідомий крок';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: {xs: 3, md: 5} }}>
      <PageTitle title="Запис на послугу" />
      <Paper elevation={3} sx={{ p: {xs:2, sm:3, md:4}, mt: 3, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: {xs:3, md:4} }} alternativeLabel>
          {steps.map((label) => ( <Step key={label}> <StepLabel StepIconComponent={StepIconComponent}>{label}</StepLabel> </Step> ))}
        </Stepper>

        {activeStep === steps.length ? (
          <Box textAlign="center" py={5}>
            <CheckCircleOutlineIcon color="success" sx={{fontSize: 70, mb:2}}/>
            <Typography variant="h4" gutterBottom>Запис успішно оформлено!</Typography>
            <Typography color="text.secondary">Ми надішлемо вам підтвердження найближчим часом, якщо це необхідно.</Typography>
            <Box mt={4}>
              <Button component={RouterLink} to="/client/my-bookings" variant="contained" sx={{ mr: 2 }}>Переглянути мої записи</Button>
              <Button component={RouterLink} to="/services" variant="outlined">Обрати ще послугу</Button>
            </Box>
          </Box>
        ) : (
          <React.Fragment>
            <Box sx={{minHeight: {xs:300, sm: 380}, mb:3}}>
                {getStepContent(activeStep)}
            </Box>
            <Divider sx={{my:2}}/>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
              <Button color="inherit" disabled={activeStep === 0 || isSubmittingFinal} onClick={handleBack}>
                Назад
              </Button>
              
              {activeStep === 0 && (
                <Button variant="contained" type="submit" form="appointment-form-step0" >
                    Далі
                </Button>
              )}
              {activeStep === 1 && (
                <Button variant="contained" type="submit" form="client-data-form" >
                    Далі
                </Button>
              )}
              {activeStep === 2 && (
                <Button variant="contained" color="primary" onClick={handleFinalSubmit} disabled={isSubmittingFinal || !bookingDetails.service_id || !bookingDetails.appointment_datetime || loadingStepDetails}>
                  {isSubmittingFinal ? <CircularProgress size={24} color="inherit"/> : 'Підтвердити та записатися'}
                </Button>
              )}
            </Box>
          </React.Fragment>
        )}
      </Paper>
    </Container>
  );
};

export default BookingPage;