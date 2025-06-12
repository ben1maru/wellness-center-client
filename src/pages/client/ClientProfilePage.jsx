// src/pages/client/ClientProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Grid, Paper } from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { getMe, /* функція для оновлення профілю, наприклад updateUserProfile */ } from '../../api/authApi.js'; // Або з dataApi, якщо там
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

// Припустимо, що на бекенді є ендпоінт для оновлення даних користувача (не пароля)
// Наприклад, PUT /api/auth/me/update або PUT /api/users/:id/profile
// Якщо його немає, цей функціонал буде обмежений.
// Зараз в authController є тільки getMe. updateUserProfile потрібно буде додати на бекенд.

const ClientProfilePage = () => {
  const { user, updateUserContext, token } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '', // Email зазвичай не редагується або вимагає підтвердження
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      });
    } else {
      // Якщо user ще не завантажений, можна спробувати завантажити його
      const fetchUser = async () => {
        if (token) { // Перевіряємо, чи є токен
          setLoading(true);
          try {
            const currentUser = await getMe();
            setFormData({
              first_name: currentUser.first_name || '',
              last_name: currentUser.last_name || '',
              email: currentUser.email || '',
              phone_number: currentUser.phone_number || '',
            });
            // updateUserContext(currentUser); // Можливо, не потрібно, якщо user вже в контексті оновлюється
          } catch (err) {
            setError("Не вдалося завантажити дані профілю.");
          } finally {
            setLoading(false);
          }
        }
      };
      fetchUser();
    }
  }, [user, token]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setSuccessMessage('');
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError("Ім'я та прізвище є обов'язковими.");
      return;
    }
    // Додати валідацію телефону, якщо потрібно

    setIsSubmitting(true);
    try {
      // Тут має бути API виклик для оновлення профілю користувача
      // const updatedUser = await updateUserProfile(formData); // Приклад
      // showNotification('Профіль успішно оновлено!', 'success');
      // updateUserContext(updatedUser); // Оновити дані користувача в контексті
      // setSuccessMessage('Профіль успішно оновлено!');
      
      // ЗАГЛУШКА, оскільки API для оновлення профілю клієнта не реалізовано на бекенді
      await new Promise(resolve => setTimeout(resolve, 1000)); // Імітація запиту
      const fakeUpdatedUser = { ...user, ...formData };
      updateUserContext(fakeUpdatedUser); // Оновлюємо локально в контексті
      showNotification('Профіль (локально) оновлено! Потрібна реалізація API.', 'info');
      setSuccessMessage('Профіль (локально) оновлено! API не викликано.');


    } catch (err) {
      setError(err.message || 'Не вдалося оновити профіль.');
      showNotification(err.message || 'Не вдалося оновити профіль.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <PageTitle title="Мій Профіль" subtitle="Редагування вашої особистої інформації" />
      {error && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}
      {successMessage && <AlertMessage severity="success" message={successMessage} onClose={() => setSuccessMessage('')} sx={{mb:2}}/>}

      <Paper sx={{ p: {xs: 2, md: 3}, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="first_name"
                label="Ім'я"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="last_name"
                label="Прізвище"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Електронна пошта"
                value={formData.email}
                // onChange={handleChange} // Email зазвичай не редагується
                fullWidth
                disabled // Робимо поле нередагованим
                helperText="Для зміни email зверніться до адміністрації."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone_number"
                label="Номер телефону"
                value={formData.phone_number}
                onChange={handleChange}
                fullWidth
                helperText="Формат: +380XXXXXXXXX або 0XXXXXXXXX"
              />
            </Grid>
            <Grid item xs={12} sx={{mt:1}}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || loading}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Можна додати секцію для зміни пароля, якщо потрібно */}
      {/* <Paper sx={{ p: {xs: 2, md: 3}, mt: 3 }}> ... Форма зміни пароля ... </Paper> */}

    </Box>
  );
};

export default ClientProfilePage;