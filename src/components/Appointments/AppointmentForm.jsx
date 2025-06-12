// src/components/Appointments/AppointmentForm.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Grid, Alert, InputAdornment } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotesIcon from '@mui/icons-material/Notes';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // Для вибору клієнта
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'; // Для статусу

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';
import { isValid as isValidDate, parseISO, formatISO, isBefore } from 'date-fns';

import { 
    getActiveServices as apiGetActiveServices, 
    getSpecialists as apiGetSpecialists, 
    createAppointment, 
    getAvailableSlots,
    updateAppointment as apiUpdateAppointment, // Потрібна ця функція
    getUsers // Припускаємо, що ця функція є для завантаження клієнтів
} from '../../api/dataApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

const AppointmentForm = ({
  initialServiceId,
  initialSpecialistId,
  onSuccess,
  onCancel, // Додано для кнопки "Скасувати"
  fixedDateTime,
  userIdForAdmin, // Для створення запису для конкретного клієнта (ззовні форми)
  isAdminForm = false,
  existingAppointmentData,
  propServices,
  propSpecialists,
  propClients,
}) => {
  const { showNotification } = useContext(NotificationContext);

  const [services, setServices] = useState(propServices || []);
  const [specialists, setSpecialists] = useState(propSpecialists || []);
  const [clients, setClients] = useState(propClients || []);

  const [selectedService, setSelectedService] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [selectedClient, setSelectedClient] = useState(''); // Тільки для isAdminForm
  const [appointmentDateTime, setAppointmentDateTime] = useState(null);
  const [clientNotes, setClientNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState(''); // Тільки для isAdminForm
  const [currentStatus, setCurrentStatus] = useState('pending'); // Тільки для isAdminForm

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingServices, setLoadingServices] = useState(!propServices);
  const [loadingSpecialists, setLoadingSpecialists] = useState(!propSpecialists);
  const [loadingClients, setLoadingClients] = useState(isAdminForm && !propClients);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // successMessage тут не потрібен, бо onSuccess передає повідомлення батьку

  // Ініціалізація форми
  useEffect(() => {
    if (isAdminForm && existingAppointmentData) {
      setSelectedService(String(existingAppointmentData.service_id || ''));
      setSelectedSpecialist(String(existingAppointmentData.specialist_id || ''));
      setSelectedClient(String(existingAppointmentData.user_id || ''));
      setAppointmentDateTime(existingAppointmentData.appointment_datetime ? parseISO(existingAppointmentData.appointment_datetime) : null);
      setClientNotes(existingAppointmentData.client_notes || '');
      setAdminNotes(existingAppointmentData.admin_notes || '');
      setCurrentStatus(existingAppointmentData.status || 'pending');
    } else {
      setSelectedService(initialServiceId || '');
      setSelectedSpecialist(initialSpecialistId || '');
      setAppointmentDateTime(fixedDateTime && isValidDate(fixedDateTime) ? fixedDateTime : null);
      setSelectedClient(userIdForAdmin || '');
      setClientNotes('');
      setAdminNotes(''); // Для клієнтської форми це не використовується
      setCurrentStatus('pending'); // Стандарт для нового запису
    }
  }, [isAdminForm, existingAppointmentData, initialServiceId, initialSpecialistId, fixedDateTime, userIdForAdmin]);

  // Завантаження даних, якщо вони не передані через пропси
  useEffect(() => {
    if (!propServices && services.length === 0) {
      const fetchSrv = async () => {
        setLoadingServices(true);
        try { const data = await apiGetActiveServices(); setServices(data || []); }
        catch (e) { setError('Помилка завантаження послуг'); console.error(e); }
        finally { setLoadingServices(false); }
      };
      fetchSrv();
    }
  }, [propServices, services.length]);

  useEffect(() => {
    if (!propSpecialists && specialists.length === 0 && (selectedService || initialSpecialistId || existingAppointmentData?.specialist_id)) {
      const fetchSpec = async () => {
        setLoadingSpecialists(true);
        try { const data = await apiGetSpecialists(); setSpecialists(data || []); } // TODO: filter by service if API supports
        catch (e) { setError('Помилка завантаження спеціалістів'); console.error(e); }
        finally { setLoadingSpecialists(false); }
      };
      fetchSpec();
    }
  }, [propSpecialists, specialists.length, selectedService, initialSpecialistId, existingAppointmentData]);

  useEffect(() => {
    if (isAdminForm && !propClients && clients.length === 0) {
      const fetchCli = async () => {
        setLoadingClients(true);
        try {
          const data = await getUsers({ role: 'client' }); // Припускаємо, що getUsers є
          setClients(data?.users || data || []);
        } catch (e) { setError('Помилка завантаження клієнтів'); console.error(e); }
        finally { setLoadingClients(false); }
      };
      fetchCli();
    }
  }, [isAdminForm, propClients, clients.length]);

  const fetchSlots = useCallback(async (dateToFetch) => {
    if (!selectedService || !dateToFetch || !isValidDate(dateToFetch)) {
      setAvailableSlots([]); return;
    }
    setLoadingSlots(true); setError('');
    try {
      const params = { service_id: selectedService, date: formatISO(dateToFetch, { representation: 'date' }) };
      if (selectedSpecialist) params.specialist_id = selectedSpecialist;
      const slotsData = await getAvailableSlots(params);
      // ... (обробка slotsData як раніше)
       if (Array.isArray(slotsData)) {
        setAvailableSlots(slotsData.map(slot => parseISO(slot)).filter(isValidDate));
      } else if (typeof slotsData === 'object' && slotsData !== null && selectedSpecialist && Array.isArray(slotsData[selectedSpecialist])) {
        setAvailableSlots(slotsData[selectedSpecialist].map(slot => parseISO(slot)).filter(isValidDate));
      } else if (typeof slotsData === 'object' && slotsData !== null && !selectedSpecialist) {
        let allPossibleSlots = Object.values(slotsData).flat().map(slot => parseISO(slot)).filter(isValidDate);
        setAvailableSlots([...new Set(allPossibleSlots.map(d => d.getTime()))].map(t => new Date(t)).sort((a, b) => a - b));
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      setError("Слоти: " + (err.message || 'Помилка')); setAvailableSlots([]);
    } finally { setLoadingSlots(false); }
  }, [selectedService, selectedSpecialist]);

  useEffect(() => {
    if (appointmentDateTime && isValidDate(appointmentDateTime) && !fixedDateTime && !isAdminForm && selectedService) {
      const dateOnly = new Date(appointmentDateTime.getFullYear(), appointmentDateTime.getMonth(), appointmentDateTime.getDate());
      fetchSlots(dateOnly);
    }
  }, [appointmentDateTime, selectedService, selectedSpecialist, fetchSlots, fixedDateTime, isAdminForm]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (isAdminForm && !selectedClient) { setError('Оберіть клієнта.'); return; }
    if (!selectedService) { setError('Оберіть послугу.'); return; }
    if (!appointmentDateTime || !isValidDate(appointmentDateTime)) { setError('Оберіть дату та час.'); return; }
    if (!isAdminForm && !fixedDateTime && isBefore(appointmentDateTime, new Date())) {
        setError('Запис можливий тільки на майбутній час.'); return;
    }
    if (!isAdminForm && !fixedDateTime && availableSlots.length > 0 && selectedService) {
      const isSelectedTimeAvailable = availableSlots.some(slot => slot.getTime() === appointmentDateTime.getTime());
      if (!isSelectedTimeAvailable) { setError('Обраний час недоступний. Оновіть слоти або оберіть інший.'); return; }
    }

    setSubmitting(true);
    try {
      const baseData = {
        service_id: Number(selectedService),
        specialist_id: selectedSpecialist ? Number(selectedSpecialist) : null,
        appointment_datetime: formatISO(appointmentDateTime),
        client_notes: clientNotes,
      };

      let response;
      if (isAdminForm) {
        const adminData = {
          ...baseData,
          user_id: Number(selectedClient), // Адмін встановлює user_id
          status: currentStatus,
          admin_notes: adminNotes,
        };
        if (existingAppointmentData?.id) { // Редагування
          response = await apiUpdateAppointment(existingAppointmentData.id, adminData);
        } else { // Створення адміном
          response = await createAppointment(adminData);
        }
      } else { // Створення клієнтом
        const clientData = {...baseData};
        if (userIdForAdmin) clientData.user_id = userIdForAdmin; // Якщо це "створити для клієнта"
        response = await createAppointment(clientData);
      }
      
      if (onSuccess) onSuccess(response.message || 'Дія успішна!');
      
      if (!existingAppointmentData) { // Скидаємо форму тільки при створенні
        setSelectedService(initialServiceId || ''); setSelectedSpecialist(initialSpecialistId || '');
        setAppointmentDateTime(fixedDateTime && isValidDate(fixedDateTime) ? fixedDateTime : null);
        setClientNotes(''); setAvailableSlots([]);
      }

    } catch (err) {
      const msg = err.message || 'Не вдалося виконати дію.';
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  const appointmentStatusesForAdmin = [ /* ... (як у AdminAppointmentsPage) ... */
    { value: 'pending', label: 'Очікує' },{ value: 'confirmed', label: 'Підтверджено' },
    { value: 'cancelled_by_client', label: 'Скасовано клієнтом' },{ value: 'cancelled_by_admin', label: 'Скасовано адміністратором' },
    { value: 'completed', label: 'Завершено' },{ value: 'no_show', label: 'Неявка' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
      <Box component="form" onSubmit={handleSubmit} sx={isAdminForm ? {pt:1} : {p:2}}>
        {!isAdminForm && (
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{mb:3, fontWeight:'medium'}}>
                Форма Онлайн-Запису
            </Typography>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        
        <Grid container spacing={2.5}>
          {isAdminForm && (
            <Grid item xs={12} md={6}>
              <TextField select label="Клієнт" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
                fullWidth required disabled={loadingClients || !!userIdForAdmin || (!!existingAppointmentData && !!existingAppointmentData.user_id)} // Блокуємо зміну клієнта при редагуванні
                InputProps={{startAdornment: (<InputAdornment position="start"><SupervisorAccountIcon color="action"/></InputAdornment>)}}
              >
                <MenuItem value=""><em>-- Оберіть клієнта --</em></MenuItem>
                {clients.map(client => <MenuItem key={client.id} value={client.id}>{client.first_name} {client.last_name} ({client.email})</MenuItem>)}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12} md={isAdminForm && selectedClient ? 6 : 12}>
            <TextField select label="Послуга" value={selectedService}
              onChange={(e) => { setSelectedService(e.target.value); if (!isAdminForm) { setSelectedSpecialist(''); setAppointmentDateTime(null); setAvailableSlots([]); }}}
              fullWidth required disabled={loadingServices}
              InputProps={{startAdornment: (<InputAdornment position="start"><MedicalServicesIcon color="action"/></InputAdornment>)}}
            >
              <MenuItem value=""><em>-- Оберіть послугу --</em></MenuItem>
              {services.map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.price} грн)</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} md={isAdminForm ? 6 : 12}>
            <TextField select label="Спеціаліст" value={selectedSpecialist}
              onChange={(e) => { setSelectedSpecialist(e.target.value); if (!isAdminForm) { setAppointmentDateTime(null); setAvailableSlots([]);}}}
              fullWidth disabled={loadingSpecialists || !selectedService}
              InputProps={{startAdornment: (<InputAdornment position="start"><PersonPinIcon color="action"/></InputAdornment>)}}
            >
              <MenuItem value=""><em>-- Будь-який доступний --</em></MenuItem>
              {specialists.map(spec => <MenuItem key={spec.id} value={spec.id}>{spec.first_name} {spec.last_name} ({spec.specialization || 'Спеціаліст'})</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} md={isAdminForm ? 6 : 12}>
            <DateTimePicker
              label="Дата та час" value={appointmentDateTime}
              onChange={(newValue) => { setAppointmentDateTime(newValue); }}
              minDateTime={isAdminForm && existingAppointmentData ? undefined : new Date()}
              ampm={false} minutesStep={15}
              disabled={!selectedService || loadingSlots || (!!fixedDateTime && !isAdminForm)}
              readOnly={!!fixedDateTime && !isAdminForm && !existingAppointmentData}
              onAccept={(date) => { if(date && isValidDate(date) && !fixedDateTime && !isAdminForm && selectedService) fetchSlots(date);}}
              renderInput={(params) => <TextField {...params} fullWidth required 
                helperText={loadingSlots ? "Завантаження..." : (!isAdminForm && !fixedDateTime && appointmentDateTime && availableSlots.length===0 && !loadingSlots && selectedService ? "Немає слотів" : "")}
              />}
              InputProps={{startAdornment: (<InputAdornment position="start"><EventIcon color="action"/></InputAdornment>)}}
            />
            {/* ... індикатор завантаження слотів ... */}
          </Grid>

          {isAdminForm && (
            <Grid item xs={12} md={6}>
                <TextField select label="Статус запису" value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)} fullWidth required
                 InputProps={{startAdornment: (<InputAdornment position="start"><AssignmentTurnedInIcon color="action"/></InputAdornment>)}}
                >
                    {appointmentStatusesForAdmin.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </TextField>
            </Grid>
          )}

          <Grid item xs={12} md={isAdminForm && currentStatus ? 6 : 12}> {/* Щоб поле нотаток клієнта було поряд зі статусом */}
            <TextField label={isAdminForm ? "Нотатки клієнта" : "Ваші побажання"}
              value={clientNotes} onChange={(e) => setClientNotes(e.target.value)}
              fullWidth multiline rows={isAdminForm ? 2 : 3}
              InputProps={{startAdornment: (<InputAdornment position="start"><NotesIcon color="action"/></InputAdornment>)}}
            />
          </Grid>

          {isAdminForm && (
             <Grid item xs={12}>
                <TextField label="Нотатки адміна/спеціаліста" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                fullWidth multiline rows={2}
                InputProps={{startAdornment: (<InputAdornment position="start"><NotesIcon color="info"/></InputAdornment>)}}
                />
            </Grid>
          )}

          <Grid item xs={12} sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: isAdminForm ? 'flex-end' : 'center', gap: 1.5 }}>
                {isAdminForm && onCancel && (
                    <Button onClick={onCancel} variant="outlined" color="inherit" disabled={submitting}>
                        Скасувати
                    </Button>
                )}
                <Button type="submit" variant="contained" color="primary"
                    disabled={submitting || !selectedService || !appointmentDateTime || (isAdminForm && !selectedClient)}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ px: isAdminForm ? 2 : 5, py: isAdminForm ? 1 : 1.5 }}
                >
                {submitting ? 'Обробка...' : (isAdminForm && existingAppointmentData ? 'Зберегти зміни' : 'Записатися')}
                </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentForm;