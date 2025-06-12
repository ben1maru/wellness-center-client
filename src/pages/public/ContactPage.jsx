import React, { useState, useContext } from 'react';
import {
    Box, Container, Typography, TextField, Button, Grid, Paper,
    CircularProgress, Link as MuiLink
} from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { createContactMessage } from '../../api/dataApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ContactForm = () => {
    const { showNotification } = useContext(NotificationContext);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validateForm = () => {
        const tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Ім'я є обов'язковим";
        if (!formData.email.trim()) tempErrors.email = "Email є обов'язковим";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Некоректний формат email";
        if (!formData.message.trim()) tempErrors.message = "Повідомлення є обов'язковим";
        if (formData.phone.trim() && !/^(?:\+380|0)\d{9}$/.test(formData.phone)) {
            tempErrors.phone = "Некоректний формат телефону (напр., 0991234567)";
        }
        setFieldErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await createContactMessage(formData);
            setFormSuccess(response.message_response || 'Ваше повідомлення успішно надіслано!');
            showNotification(response.message_response || 'Повідомлення надіслано!', 'success');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            const errMsg = err.message || 'Не вдалося надіслати повідомлення.';
            setFormError(errMsg);
            showNotification(errMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mt: 5, maxWidth: 800, mx: 'auto', width: '100%' }}>
            <Typography variant="h5" gutterBottom align="center">Напишіть нам</Typography>
            {formError && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <AlertMessage severity="error" message={formError} onClose={() => setFormError('')} />
                </Box>
            )}
            {formSuccess && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <AlertMessage severity="success" message={formSuccess} onClose={() => setFormSuccess('')} />
                </Box>
            )}
           <Box component="form" onSubmit={handleSubmit} noValidate>
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6}>
      <TextField
        name="name"
        label="Ваше ім'я"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
        error={!!fieldErrors.name}
        helperText={fieldErrors.name}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        name="email"
        label="Ваш Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        required
        error={!!fieldErrors.email}
        helperText={fieldErrors.email}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        name="phone"
        label="Телефон (необов'язково)"
        value={formData.phone}
        onChange={handleChange}
        fullWidth
        error={!!fieldErrors.phone}
        helperText={fieldErrors.phone}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        name="subject"
        label="Тема (необов'язково)"
        value={formData.subject}
        onChange={handleChange}
        fullWidth
      />
    </Grid>

    {/* Повідомлення на всю ширину */}
    <Grid item xs={12} sm={6}>
      <TextField
        name="message"
        label="Ваше повідомлення"
        value={formData.message}
        onChange={handleChange}
        fullWidth
        required
        
        rows={5}
        error={!!fieldErrors.message}
        helperText={fieldErrors.message}
      />
    </Grid>

    {/* Кнопка */}
    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{
          px: 5,
          py: 1.5,
          borderRadius: 3,
          fontWeight: 'bold',
          fontSize: '1rem',
          textTransform: 'none'
        }}
      >
        {isSubmitting ? 'Відправка...' : 'Надіслати повідомлення'}
      </Button>
    </Grid>
  </Grid>
</Box>


        </Paper>
    );
};

const ContactPage = () => {
    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center', mb: 4, width: '100%' }}>
                <PageTitle
                    title="Контакти"
                    subtitle="Зв'яжіться з нами будь-яким зручним для вас способом"
                />
            </Box>

            <Grid container spacing={4} sx={{ maxWidth: 1200 }}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center' }}>
                            Наші координати
                        </Typography>
                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <LocationOnIcon color="primary" sx={{ mr: 1.5 }} />
                                <Typography>м. Київ, вул. Здоров'я, 1 (2 поверх)</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <PhoneIcon color="primary" sx={{ mr: 1.5 }} />
                                <MuiLink
                                    href="tel:+380991234567"
                                    color="inherit"
                                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                                >
                                    +38 (099) 123-45-67
                                </MuiLink>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <EmailIcon color="primary" sx={{ mr: 1.5 }} />
                                <MuiLink
                                    href="mailto:info@wellness.com.ua"
                                    color="inherit"
                                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                                >
                                    info@wellness.com.ua
                                </MuiLink>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                                <AccessTimeIcon color="primary" sx={{ mr: 1.5 }} />
                                <Typography>Пн-Сб: 9:00 - 20:00, Нд: вихідний</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'medium' }}>
                        Карта проїзду
                    </Typography>
                    <Box sx={{
                        height: { xs: 350, sm: 450, md: 500 },
                        width: '100%',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mt: 1
                    }}>
                        <iframe
                            title="map"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.519579155957!2d30.52099131590216!3d50.45003397947527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce504dab8661%3A0x71aee9c7639f131!2z0JzQsNC90LAg0J3Qt9C10L3QvdCw0LzQuNGA!5e0!3m2!1suk!2sua!4v1615472598984!5m2!1suk!2sua"
                        />
                    </Box>
                </Grid>
            </Grid>

            <ContactForm />
        </Container>
    );
};

export default ContactPage;
