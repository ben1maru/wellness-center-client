// src/components/Auth/LoginForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    CircularProgress, 
    Alert, 
    Grid, // Додано для Grid
    Link as MuiLink // Додано для MuiLink
} from '@mui/material';
// Іконки, якщо потрібні (наприклад, для Avatar або полів)
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { loginUser } from '../../api/authApi.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';

const LoginForm = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email.trim()) {
      tempErrors.email = "Електронна пошта є обов'язковою";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Некоректний формат електронної пошти';
    }
    if (!password) {
      tempErrors.password = "Пароль є обов'язковим";
    } else if (password.length < 6) {
      tempErrors.password = 'Пароль повинен містити щонайменше 6 символів';
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
    try {
      const userData = await loginUser({ email, password });
      login(userData); 
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      } else {
        const from = location.state?.from?.pathname || "/";
        if (userData.role === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (userData.role === 'specialist') navigate('/specialist/dashboard', { replace: true });
        else navigate(from === '/login' || from === '/register' ? '/client/dashboard' : from, { replace: true });
      }
    } catch (error) {
      setServerError(error.message || 'Помилка входу. Перевірте ваші дані.');
      console.error("Login error:", error);
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
      noValidate // Вимикаємо браузерну валідацію, бо маємо свою
    >
      {/* Можна додати Avatar з іконкою зверху
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar> 
      */}
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        Вхід
      </Typography>
      {serverError && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setServerError('')}>{serverError}</Alert>}
      <TextField
        fullWidth
        id="email"
        name="email"
        label="Електронна пошта"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={validate}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        required
        autoFocus // Додано для зручності
        autoComplete="email"
      />
      <TextField
        fullWidth
        id="password"
        name="password"
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={validate}
        error={!!errors.password}
        helperText={errors.password}
        margin="normal"
        required
        autoComplete="current-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 1, py: 1.5 }}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isSubmitting ? 'Вхід...' : 'Увійти'}
      </Button>
      <Grid container spacing={1} justifyContent="space-between" sx={{width: '100%'}}> {/* Додав spacing та justifyContent */}
            <Grid item>
                {/* Можна додати посилання "Забули пароль?" 
                <MuiLink component={RouterLink} to="/forgot-password" variant="body2">
                    Забули пароль?
                </MuiLink>
                */}
            </Grid>
            <Grid item>
              <MuiLink component={RouterLink} to="/register" variant="body2">
                {"Немає акаунта? Зареєструватися"}
              </MuiLink>
            </Grid>
      </Grid>
    </Box>
  );
};

export default LoginForm;