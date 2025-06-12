// src/components/Auth/RegisterForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink }  from 'react-router-dom';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    CircularProgress, 
    Alert, 
    Grid, 
    Link as MuiLink,
    MenuItem // Якщо буде вибір ролі
} from '@mui/material';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Приклад іконки для Аватара

import { registerUser } from '../../api/authApi.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';

const RegisterForm = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [role, setRole] = useState('client'); // Розкоментуйте, якщо потрібен вибір ролі

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!firstName.trim()) tempErrors.firstName = "Ім'я є обов'язковим";
    if (!lastName.trim()) tempErrors.lastName = "Прізвище є обов'язковим";
    if (!email.trim()) {
      tempErrors.email = "Електронна пошта є обов'язковою";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Некоректний формат електронної пошти';
    }
    if (phoneNumber && !/^(?:\+380|0)\d{9}$/.test(phoneNumber)) {
        tempErrors.phoneNumber = 'Некоректний формат (напр., 0991234567 або +380991234567)';
    }
    if (!password) {
      tempErrors.password = "Пароль є обов'язковим";
    } else if (password.length < 6) {
      tempErrors.password = 'Пароль повинен містити щонайменше 6 символів';
    }
    if (!confirmPassword) {
      tempErrors.confirmPassword = "Підтвердження пароля є обов'язковим";
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Паролі повинні співпадати';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    const userDataToSubmit = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber || null,
      password,
      role: 'client', // Або role зі стану, якщо є вибір
    };

    try {
      const registeredUserData = await registerUser(userDataToSubmit);
      login(registeredUserData); 
      
      if (onRegisterSuccess) {
        onRegisterSuccess(registeredUserData);
      } else {
        if (registeredUserData.role === 'specialist') navigate('/specialist/profile', { replace: true });
        else navigate('/client/dashboard', { replace: true });
      }
    } catch (error) {
      setServerError(error.message || 'Помилка реєстрації. Будь ласка, спробуйте ще раз.');
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
      noValidate
    >
      {/* 
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <AccountCircleIcon />
      </Avatar> 
      */}
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        Реєстрація
      </Typography>
      {serverError && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setServerError('')}>{serverError}</Alert>}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="firstName"
            label="Ім'я"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={validate}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
            autoFocus // Додано для зручності
            autoComplete="given-name"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="lastName"
            label="Прізвище"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={validate}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
            autoComplete="family-name"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="email"
            label="Електронна пошта"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            error={!!errors.email}
            helperText={errors.email}
            required
            autoComplete="email"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="phoneNumber"
            label="Номер телефону (необов'язково)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onBlur={validate}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            autoComplete="tel"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validate}
            error={!!errors.password}
            helperText={errors.password}
            required
            autoComplete="new-password"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="confirmPassword"
            label="Підтвердіть пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={validate}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
            autoComplete="new-password"
          />
        </Grid>
        {/* 
        <Grid item xs={12}>
            <TextField
                select
                fullWidth
                label="Я реєструюся як"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                name="role"
                margin="normal" // Додано для відступу
            >
                <MenuItem value="client">Клієнт</MenuItem>
                <MenuItem value="specialist">Спеціаліст</MenuItem>
            </TextField>
        </Grid>
        */}
      </Grid>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 1, py: 1.5 }}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isSubmitting ? 'Реєстрація...' : 'Зареєструватися'}
      </Button>
      <Grid container justifyContent="flex-end" sx={{width: '100%'}}>
            <Grid item>
              <MuiLink component={RouterLink} to="/login" variant="body2">
                Вже маєте акаунт? Увійти
              </MuiLink>
            </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterForm;