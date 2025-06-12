// src/components/Common/AlertMessage.jsx
import React from 'react';
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AlertMessage = ({
  severity = 'info', // 'error', 'warning', 'info', 'success'
  title,
  message,
  open = true, 
  onClose, 
  sx,
  variant = "filled", // "filled", "outlined", "standard"
  ...props
}) => {
  if (!message && !title) return null; // Не рендерити, якщо немає чого показувати

  return (
    <Collapse in={open} timeout={300 /* Плавна анімація */}>
      <Alert
        severity={severity}
        variant={variant}
        action={
          onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : null
        }
        sx={{ mb: 2, width: '100%', ...sx }} // width: '100%' для розтягування по контейнеру
        {...props}
      >
        {title && <AlertTitle sx={{fontWeight: 'medium'}}>{title}</AlertTitle>}
        {/* Дозволяємо передавати JSX в message */}
        {typeof message === 'string' ? message : React.Children.toArray(message)}
      </Alert>
    </Collapse>
  );
};

export default AlertMessage;