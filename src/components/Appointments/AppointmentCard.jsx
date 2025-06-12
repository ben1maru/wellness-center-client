// src/components/appointments/AppointmentCard.jsx
import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    IconButton,
    Tooltip
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotesIcon from '@mui/icons-material/Notes';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import NoMeetingRoomIcon from '@mui/icons-material/NoMeetingRoom';

// Імпорти з date-fns
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { uk } from 'date-fns/locale';

const getStatusChipColor = (status) => {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending': return 'warning';
    case 'cancelled_by_client':
    case 'cancelled_by_admin': return 'error';
    case 'completed': return 'primary';
    case 'no_show': return 'default';
    default: return 'default';
  }
};

const getStatusChipIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon fontSize="small" />;
      case 'pending': return <HelpOutlineIcon fontSize="small" />;
      case 'cancelled_by_client': return <CancelIcon fontSize="small" />;
      case 'cancelled_by_admin': return <EventBusyIcon fontSize="small" />;
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'no_show': return <NoMeetingRoomIcon fontSize="small" />;
      default: return null;
    }
};

const AppointmentCard = ({ appointment, onEdit, onCancel, userRole, currentUserData }) => { // Додано currentUserData
  if (!appointment) return null;

  const {
    id,
    appointment_datetime,
    duration_minutes,
    status,
    client_notes,
    admin_notes,
    service_name,
    // service_price, // якщо потрібно
    client_first_name,
    client_last_name,
    specialist_first_name,
    specialist_last_name,
    // specialist_id також потрібен з appointment, якщо він там є і потрібен для canEdit
  } = appointment;

  // Визначаємо, чи може користувач редагувати/скасовувати
  // Припускаємо, що currentUserData.specialistProfileId - це ID поточного спеціаліста з таблиці 'specialists'
  const canEdit = userRole === 'admin' ||
                  (userRole === 'specialist' && currentUserData && appointment.specialist_id === currentUserData.specialistProfileId);

  const canClientCancel = userRole === 'client' && (status === 'pending' || status === 'confirmed');

  const displayDateTime = () => {
    if (!appointment_datetime) return 'Дата не вказана';
    const date = parseISO(appointment_datetime);
    if (!isValidDate(date)) return 'Некоректна дата';
    try {
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: uk });
    } catch (error) {
      console.error("Error formatting date in AppointmentCard:", error);
      return 'Помилка форматування';
    }
  };

  return (
    <Card sx={{ mb: 2 }} variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, pr: 1 }}>
            {service_name || 'Послуга не вказана'}
          </Typography>
          <Chip
            label={status ? status.replace(/_/g, ' ') : 'Невідомий статус'}
            color={getStatusChipColor(status)}
            size="small"
            icon={getStatusChipIcon(status)}
            sx={{textTransform: 'capitalize', ml: 'auto', whiteSpace: 'normal', height: 'auto', '& .MuiChip-label': {whiteSpace: 'normal', py: 0.5}}}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {displayDateTime()} ({duration_minutes} хв)
          </Typography>
        </Box>

        {specialist_first_name && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Спеціаліст: {specialist_first_name} {specialist_last_name || ''}
            </Typography>
          </Box>
        )}

        {(userRole === 'admin' || userRole === 'specialist') && client_first_name && (
             <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <MedicalServicesIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                Клієнт: {client_first_name} {client_last_name || ''}
                </Typography>
            </Box>
        )}

        {client_notes && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'flex-start' }}>
            <NotesIcon fontSize="small" sx={{ mr: 1, mt:0.3, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{fontStyle: 'italic'}}>
              Побажання клієнта: "{client_notes}"
            </Typography>
          </Box>
        )}
         {admin_notes && (userRole === 'admin' || userRole === 'specialist') && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'flex-start' }}>
            <NotesIcon fontSize="small" sx={{ mr: 1, mt:0.3, color: 'info.main' }} />
            <Typography variant="body2" color="info.main" sx={{fontStyle: 'italic'}}>
              Нотатки адм./спец.: "{admin_notes}"
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          {canEdit && onEdit && (
            <Tooltip title="Редагувати запис">
              <IconButton size="small" onClick={() => onEdit(appointment)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {canClientCancel && onCancel && (
            <Tooltip title="Скасувати запис">
              <IconButton size="small" color="error" onClick={() => onCancel(id)}>
                <CancelIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;