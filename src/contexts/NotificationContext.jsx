// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useCallback, useContext } from 'react';
import { Snackbar, Alert as MuiAlert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Для кнопки закриття

// Використовуємо forwardRef для Alert, якщо він використовується як дочірній для Snackbar (рекомендовано MUI)
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'
  const [autoHideDuration, setAutoHideDuration] = useState(6000); // Час в мс
  const [action, setAction] = useState(null); // Для кастомних дій у Snackbar

  const showNotification = useCallback(
    (msg, sev = 'info', duration = 6000, customAction = null) => {
      setMessage(msg);
      setSeverity(sev);
      setAutoHideDuration(duration);
      setAction(customAction); // Зберігаємо кастомну дію
      setOpen(true);
    },
    []
  );

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return; // Не закривати при кліку поза сповіщенням
    }
    setOpen(false);
    // Скидаємо message та action після закриття, щоб уникнути "миготіння" старого контенту
    // setMessage(''); // Можна, але не обов'язково, якщо autoHideDuration короткий
    // setAction(null);
  };

  // Стандартна дія "Закрити", якщо кастомна не передана
  const closeButtonAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Позиція сповіщення
        // message={severity === 'info' || severity === 'default' ? message : undefined} // message тільки для стандартних Snackbar
        // action={action || closeButtonAction} // Додаємо дію
      >
        {/* Використовуємо Alert всередині Snackbar для кращого вигляду та іконок */}
        <Alert 
          onClose={handleClose} // Дозволяє закривати Alert вбудованою кнопкою, якщо вона є
          severity={severity} 
          sx={{ width: '100%' }}
          action={action} // Додаємо кастомну дію до Alert, якщо є
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

