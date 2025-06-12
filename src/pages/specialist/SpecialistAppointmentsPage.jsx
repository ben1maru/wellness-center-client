// src/pages/specialist/SpecialistAppointmentsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Grid, // Не використовується в поточному коді, але може знадобитись для фільтрів
    TextField, 
    MenuItem, 
    Paper, // Не використовується в поточному коді, але може знадобитись для фільтрів
    Chip // <-- ДОДАНО ІМПОРТ CHIP
} from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AppointmentCalendar from '../../components/Appointments/AppointmentCalendar.jsx';
// AppointmentForm тут не потрібен, бо редагування відбувається через простіші поля
// import AppointmentForm from '../../components/Appointments/AppointmentForm.jsx'; 
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx'; // Не використовується в поточному коді, але може знадобитись
import AlertMessage from '../../components/Common/AlertMessage.jsx';

import { getAllAppointments, updateAppointment } from '../../api/dataApi.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

// Фільтри, якщо потрібні для спеціаліста
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'; // DatePicker не використовується, але LocalizationProvider потрібен
import { uk } from 'date-fns/locale';
import { 
    formatISO, // Не використовується безпосередньо тут, але може знадобитись для фільтрів
    isValid,  // Не використовується безпосередньо тут
    format,   // <-- ДОДАНО ІМПОРТ format
    parseISO  // <-- ДОДАНО ІМПОРТ parseISO
} from 'date-fns';

const SpecialistAppointmentsPage = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  // const [appointments, setAppointments] = useState([]); // Дані будуть в календарі
  const [loading, setLoading] = useState(false); // Керується календарем
  const [error, setError] = useState('');

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState(''); // Для форми зміни статусу
  const [adminNotes, setAdminNotes] = useState(''); // Нотатки спеціаліста (використовуємо поле admin_notes)

  const [refreshCalendarTrigger, setRefreshCalendarTrigger] = useState(0);

  // Фільтри (якщо спеціаліст може фільтрувати свої записи)
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);


  const handleSelectEventFromCalendar = (appointmentData) => {
    setEditingAppointment(appointmentData);
    setNewStatus(appointmentData.status || ''); // Поточний статус
    setAdminNotes(appointmentData.admin_notes || ''); // Поточні нотатки
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingAppointment(null);
    setNewStatus('');
    setAdminNotes('');
  };

  const handleSaveChanges = async () => {
    if (!editingAppointment || !newStatus) {
      showNotification('Не обрано новий статус.', 'warning');
      return;
    }
    setLoading(true); // Можна isSubmitting для діалогу
    try {
      const updateData = { status: newStatus };
      if (adminNotes.trim() || editingAppointment.admin_notes !== adminNotes) { // Оновлюємо нотатки, якщо вони змінилися
          updateData.admin_notes = adminNotes.trim() || null;
      }
      
      await updateAppointment(editingAppointment.id, updateData);
      showNotification('Статус запису та нотатки оновлено!', 'success');
      handleCloseEditDialog();
      setRefreshCalendarTrigger(prev => prev + 1); // Оновити календар
    } catch (err) {
      showNotification(err.message || 'Помилка оновлення запису.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const appointmentStatusesForSpecialist = [
    // Спеціаліст може змінювати на:
    { value: 'confirmed', label: 'Підтвердити (якщо був pending)' },
    { value: 'completed', label: 'Завершено' },
    { value: 'no_show', label: 'Неявка клієнта' },
    // Скасування адміном/клієнтом спеціаліст не змінює, але може бачити
    { value: 'pending', label: 'Очікує (поточний)' , disabled: true},
    { value: 'cancelled_by_client', label: 'Скасовано клієнтом (поточний)', disabled: true},
    { value: 'cancelled_by_admin', label: 'Скасовано адміністратором (поточний)', disabled: true},
  ].filter(s => !s.disabled || s.value === editingAppointment?.status); // Показуємо поточний статус, навіть якщо він disabled для вибору

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
    <Box>
      <PageTitle title="Мої Записи" subtitle="Перегляд та управління вашими записами на прийом." />
      {error && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}} />}

      {/* Можна додати фільтри, аналогічно до AdminAppointmentsPage, якщо потрібно */}
      {/* <Paper elevation={1} sx={{p:2, mb:3}}> ... Фільтри ... </Paper> */}

      <AppointmentCalendar
        userRole="specialist" // Календар завантажить записи для поточного спеціаліста
        onSelectEvent={handleSelectEventFromCalendar}
        // Передаємо фільтри, якщо вони є
        // filterStatus={filterStatus}
        // filterDateFrom={filterDateFrom}
        // filterDateTo={filterDateTo}
        // Ключ для примусового перезавантаження даних в календарі, якщо потрібно
        key={refreshCalendarTrigger} 
      />

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Редагувати Запис #{editingAppointment?.id}</DialogTitle>
        <DialogContent>
            {editingAppointment && (
                <Box>
                    <Typography variant="subtitle1">Послуга: <strong>{editingAppointment.service_name}</strong></Typography>
                    <Typography variant="body2">Клієнт: {editingAppointment.client_first_name} {editingAppointment.client_last_name}</Typography>
                    <Typography variant="body2">Дата: {editingAppointment.appointment_datetime ? format(parseISO(editingAppointment.appointment_datetime), 'dd.MM.yyyy HH:mm', {locale:uk}) : 'N/A'}</Typography>
                    <Typography variant="body2" sx={{mb:2}}>Поточний статус: <Chip label={editingAppointment.status} size="small" sx={{textTransform:'capitalize'}}/></Typography>
                    
                    <TextField
                        select
                        label="Змінити статус на"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    >
                        {appointmentStatusesForSpecialist
                            .filter(s => s.value === editingAppointment.status || 
                                         (editingAppointment.status === 'pending' && s.value === 'confirmed') ||
                                         (editingAppointment.status === 'confirmed' && (s.value === 'completed' || s.value === 'no_show'))
                                     )
                            .map(status => (
                                <MenuItem key={status.value} value={status.value} disabled={status.value === editingAppointment.status && !['completed', 'no_show', 'confirmed'].includes(status.value)}>
                                    {status.label}
                                </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Ваші нотатки (бачить адміністратор)"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                    />
                </Box>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Скасувати</Button>
          <Button onClick={handleSaveChanges} variant="contained" disabled={loading || !newStatus || newStatus === editingAppointment?.status}>
            {loading ? <CircularProgress size={24}/> : 'Зберегти зміни'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </LocalizationProvider>
  );
};

export default SpecialistAppointmentsPage;