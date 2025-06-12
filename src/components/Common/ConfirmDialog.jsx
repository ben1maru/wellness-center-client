// src/components/Common/ConfirmDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Box // Додано для можливого використання
} from '@mui/material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Підтвердження дії",
  message = "Ви впевнені, що хочете виконати цю дію?",
  confirmText = "Так, підтвердити",
  cancelText = "Скасувати",
  isSubmitting = false,
  confirmButtonColor = "primary", // Можливість змінювати колір кнопки підтвердження
  children // Якщо потрібно вставити додатковий контент в діалог
}) => {
  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="xs" // Обмеження ширини для стандартного вигляду
      fullWidth 
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {typeof message === 'string' ? (
            <DialogContentText id="confirm-dialog-description">
            {message}
            </DialogContentText>
        ) : (
            message // Якщо message - це JSX елемент
        )}
        {children} {/* Додатковий контент */}
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2, pt:1 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          {cancelText}
        </Button>
        <Button 
            onClick={onConfirm} 
            color={confirmButtonColor}
            variant="contained" 
            autoFocus 
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : null}
        >
          {isSubmitting ? 'Обробка...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;