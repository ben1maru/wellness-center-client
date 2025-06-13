// src/components/Appointments/AppointmentForm.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Grid, Alert, InputAdornment } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NotesIcon from '@mui/icons-material/Notes';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

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
    updateAppointment as apiUpdateAppointment,
    getUsers // Припускаємо, що ця функція є для завантаження клієнтів
} from '../../api/dataApi.js'; // Переконайтесь, що шлях правильний
import { NotificationContext } from '../../contexts/NotificationContext.jsx'; // Переконайтесь, що шлях правильний

const AppointmentForm = ({
  initialServiceId,
  initialSpecialistId,
  onSuccess,
  onCancel,
  fixedDateTime,
  userIdForAdmin,
  isAdminForm = false,
  existingAppointmentData, // <--- ПРАВИЛЬНИЙ ПРОП
  propServices,
  propSpecialists,
  propClients,
  isStepMode = false,
}) => {
  const { showNotification } = useContext(NotificationContext);

  const [services, setServices] = useState(propServices || []);
  const [specialists, setSpecialists] = useState(propSpecialists || []);
  const [clients, setClients] = useState(propClients || []);

  const [selectedService, setSelectedService] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState(null);
  const [clientNotes, setClientNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState('pending');

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingServices, setLoadingServices] = useState(!propServices);
  const [loadingSpecialists, setLoadingSpecialists] = useState(!propSpecialists);
  const [loadingClients, setLoadingClients] = useState(isAdminForm && !propClients);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminForm && existingAppointmentData) { // ВИКОРИСТОВУЄМО existingAppointmentData
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
      setAdminNotes('');
      setCurrentStatus('pending');
    }
  }, [isAdminForm, existingAppointmentData, initialServiceId, initialSpecialistId, fixedDateTime, userIdForAdmin]);

  useEffect(() => {
    if (!propServices && (services.length === 0 || (!isAdminForm && !isStepMode) )) {
      const fetchSrv = async () => {
        setLoadingServices(true);
        try { const data = await apiGetActiveServices(); setServices(data || []); }
        catch (e) { setError('Помилка завантаження послуг'); console.error("Service fetch error in Form:", e); }
        finally { setLoadingServices(false); }
      };
      fetchSrv();
    }
  }, [propServices, services.length, isAdminForm, isStepMode]);

  useEffect(() => {
    if (!propSpecialists && (specialists.length === 0 || selectedService || initialSpecialistId || existingAppointmentData?.specialist_id)) {
      const fetchSpec = async () => {
        if (!selectedService && !initialSpecialistId && !existingAppointmentData?.specialist_id && !isAdminForm && !isStepMode) {
             setSpecialists([]); return;
        }
        setLoadingSpecialists(true);
        try {
          const data = await apiGetSpecialists();
          setSpecialists(data || []);
        }
        catch (e) { setError('Помилка завантаження спеціалістів'); console.error("Specialist fetch error in Form:", e); setSpecialists([]); }
        finally { setLoadingSpecialists(false); }
      };
      fetchSpec();
    }
  }, [propSpecialists, specialists.length, selectedService, initialSpecialistId, existingAppointmentData, isAdminForm, isStepMode]);

  useEffect(() => {
    if (isAdminForm && !isStepMode && !propClients && clients.length === 0) { // Завантажуємо клієнтів тільки для адмін-форми (не степпера)
      const fetchCli = async () => {
        setLoadingClients(true);
        try {
          const data = await getUsers({ role: 'client' });
          setClients(data?.users || data || []);
        } catch (e) { setError('Помилка завантаження клієнтів'); console.error("Client fetch error in Form:", e); setClients([]);}
        finally { setLoadingClients(false); }
      };
      fetchCli();
    }
  }, [isAdminForm, isStepMode, propClients, clients.length]);

  const fetchSlots = useCallback(async (dateToFetch) => {
    if (!selectedService || !dateToFetch || !isValidDate(dateToFetch)) {
      setAvailableSlots([]); return;
    }
    setLoadingSlots(true); setError('');
    try {
      const params = { service_id: selectedService, date: formatISO(dateToFetch, { representation: 'date' }) };
      if (selectedSpecialist) params.specialist_id = selectedSpecialist;
      const slotsData = await getAvailableSlots(params);
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
      console.error("Error fetching slots in Form:", err);
    } finally { setLoadingSlots(false); }
  }, [selectedService, selectedSpecialist]);

  useEffect(() => {
    if (appointmentDateTime && isValidDate(appointmentDateTime) && !fixedDateTime && (!isAdminForm || isStepMode) && selectedService) {
      const dateOnly = new Date(appointmentDateTime.getFullYear(), appointmentDateTime.getMonth(), appointmentDateTime.getDate());
      fetchSlots(dateOnly);
    }
  }, [appointmentDateTime, selectedService, selectedSpecialist, fetchSlots, fixedDateTime, isAdminForm, isStepMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (isAdminForm && !isStepMode && !selectedClient && !userIdForAdmin && !existingAppointmentData?.user_id) { setError('Оберіть клієнта.'); return; }
    if (!selectedService) { setError('Оберіть послугу.'); return; }
    if (!appointmentDateTime || !isValidDate(appointmentDateTime)) { setError('Оберіть дату та час.'); return; }
    
    if (!isAdminForm && !isStepMode && !fixedDateTime && isBefore(appointmentDateTime, new Date())) {
      setError('Запис можливий тільки на майбутній час.'); return;
    }
    if (!isAdminForm && !isStepMode && !fixedDateTime && availableSlots.length > 0 && selectedService) {
      const isSelectedTimeAvailable = availableSlots.some(slot => slot.getTime() === appointmentDateTime.getTime());
      if (!isSelectedTimeAvailable) { setError('Обраний час недоступний.'); return; }
    }

    const currentFormData = {
      service_id: selectedService ? Number(selectedService) : null,
      specialist_id: selectedSpecialist ? Number(selectedSpecialist) : null,
      appointment_datetime: appointmentDateTime, // Передаємо об'єкт Date
      client_notes: clientNotes,
      ...(isAdminForm && !isStepMode && { // Ці поля додаємо тільки для адмінської форми НЕ в режимі степпера
          user_id: selectedClient ? Number(selectedClient) : (userIdForAdmin ? Number(userIdForAdmin) : (existingAppointmentData?.user_id ? Number(existingAppointmentData.user_id) : null)),
          status: currentStatus,
          admin_notes: adminNotes,
      }),
    };
    
    console.log('AppointmentForm handleSubmit, isStepMode:', isStepMode, 'Data:', currentFormData);

    if (isStepMode) {
      if (onSuccess) {
        onSuccess(currentFormData);
      }
      return;
    }

    setSubmitting(true);
    try {
      let response;
      const dataToSubmitAPI = {
          ...currentFormData,
          appointment_datetime: formatISO(currentFormData.appointment_datetime),
      };
       if (dataToSubmitAPI.specialist_id === null) delete dataToSubmitAPI.specialist_id;
       if (dataToSubmitAPI.user_id === null && isAdminForm) delete dataToSubmitAPI.user_id; // user_id може бути null для гостя, але тут адмін


      if (isAdminForm) {
        if (existingAppointmentData?.id) {
          // ВАЖЛИВО: У dataToSubmitAPI вже є user_id, status, admin_notes, якщо isAdminForm=true
          response = await apiUpdateAppointment(existingAppointmentData.id, dataToSubmitAPI);
        } else {
          if(!dataToSubmitAPI.user_id && !userIdForAdmin) { throw new Error("Клієнт не обраний для створення запису адміном.");}
           if(userIdForAdmin && !dataToSubmitAPI.user_id) dataToSubmitAPI.user_id = userIdForAdmin;
          response = await createAppointment(dataToSubmitAPI);
        }
      } else {
         if (userIdForAdmin) dataToSubmitAPI.user_id = userIdForAdmin;
        response = await createAppointment(dataToSubmitAPI);
      }
      
      if (onSuccess) onSuccess(response.message || 'Дія успішна!');
      
      if (!existingAppointmentData) {
        setSelectedService(initialServiceId || ''); setSelectedSpecialist(initialSpecialistId || '');
        setAppointmentDateTime(fixedDateTime && isValidDate(fixedDateTime) ? fixedDateTime : null);
        setClientNotes(''); setAvailableSlots([]);
      }

    } catch (err) {
      const msg = err.message || 'Не вдалося виконати дію.';
      setError(msg);
      showNotification(msg, 'error');
      console.error('Submit error in AppointmentForm:', err, currentFormData);
    } finally {
      setSubmitting(false);
    }
  };
  
  const appointmentStatusesForAdmin = [
    { value: 'pending', label: 'Очікує' },{ value: 'confirmed', label: 'Підтверджено' },
    { value: 'cancelled_by_client', label: 'Скасовано клієнтом' },{ value: 'cancelled_by_admin', label: 'Скасовано адміністратором' },
    { value: 'completed', label: 'Завершено' },{ value: 'no_show', label: 'Неявка' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        id={isStepMode ? "appointment-form-step0" : undefined}
        sx={ isStepMode ? {width: '100%'} : (isAdminForm ? {pt:1} : {p:2}) }
      >
        {!isAdminForm && !isStepMode && (
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{mb:3, fontWeight:'medium'}}>
                Форма Онлайн-Запису
            </Typography>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        
        <Grid container spacing={2.5}>
          {isAdminForm && !isStepMode && (
            <Grid item xs={12} md={existingAppointmentData ? 12 : 6}>
              <TextField select label="Клієнт" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
                fullWidth required 
                disabled={loadingClients || !!userIdForAdmin || (!!existingAppointmentData && !!existingAppointmentData.user_id)}
                InputProps={{startAdornment: (<InputAdornment position="start"><SupervisorAccountIcon color="action"/></InputAdornment>)}}
              >
                <MenuItem value=""><em>-- Оберіть клієнта --</em></MenuItem>
                {clients.map(client => <MenuItem key={client.id} value={client.id}>{client.first_name} {client.last_name} ({client.email})</MenuItem>)}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12} md={(isAdminForm && !isStepMode && !existingAppointmentData && selectedClient) ? 6 : 12}>
            <TextField select label="Послуга" value={selectedService}
              onChange={(e) => { setSelectedService(e.target.value); if (!isAdminForm || isStepMode) { setSelectedSpecialist(''); setAppointmentDateTime(null); setAvailableSlots([]); }}}
              fullWidth required disabled={loadingServices || (isAdminForm && !!existingAppointmentData && !!existingAppointmentData.service_id && !isStepMode) /* Блокуємо зміну послуги при редагуванні адміном? */}
              InputProps={{startAdornment: (<InputAdornment position="start"><MedicalServicesIcon color="action"/></InputAdornment>)}}
            >
              <MenuItem value=""><em>-- Оберіть послугу --</em></MenuItem>
              {services.map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.price} грн)</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} md={(isAdminForm && !isStepMode) ? 6 : 12}>
            <TextField select label="Спеціаліст" value={selectedSpecialist}
              onChange={(e) => { setSelectedSpecialist(e.target.value); if (!isAdminForm || isStepMode) { setAppointmentDateTime(null); setAvailableSlots([]);}}}
              fullWidth disabled={loadingSpecialists || !selectedService}
              InputProps={{startAdornment: (<InputAdornment position="start"><PersonPinIcon color="action"/></InputAdornment>)}}
            >
              <MenuItem value=""><em>-- Будь-який доступний --</em></MenuItem>
              {specialists.map(spec => <MenuItem key={spec.id} value={spec.id}>{spec.first_name} {spec.last_name} ({spec.specialization || 'Спеціаліст'})</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} md={(isAdminForm && !isStepMode) ? 6 : 12}>
            <DateTimePicker
              label="Дата та час" value={appointmentDateTime}
              onChange={(newValue) => { setAppointmentDateTime(newValue); }}
              minDateTime={ (isAdminForm && !isStepMode && existingAppointmentData) || fixedDateTime ? undefined : new Date()}
              ampm={false} minutesStep={15}
              disabled={!selectedService || loadingSlots || (!!fixedDateTime && !isAdminForm && !isStepMode && !existingAppointmentData)}
              readOnly={!!fixedDateTime && !isAdminForm && !isStepMode && !existingAppointmentData} // readOnly для клієнтської форми з fixedDateTime
              onAccept={(date) => { if(date && isValidDate(date) && !fixedDateTime && (!isAdminForm || isStepMode) && selectedService) fetchSlots(date);}}
              renderInput={(params) => <TextField {...params} fullWidth required 
                helperText={loadingSlots ? "Завантаження слотів..." : 
                            ((!isAdminForm || isStepMode) && !fixedDateTime && appointmentDateTime && availableSlots.length===0 && !loadingSlots && selectedService ? "Немає слотів на цю дату" : "")}
              />}
              InputProps={{startAdornment: (<InputAdornment position="start"><EventIcon color="action"/></InputAdornment>)}}
            />
            {loadingSlots && <CircularProgress size={20} sx={{position: 'absolute', right: {xs:45, md:55}, top: '50%', transform:'translateY(-50%)', zIndex:1}}/>}
          </Grid>

          {isAdminForm && !isStepMode && (
            <Grid item xs={12} md={6}>
                <TextField select label="Статус запису" value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)} fullWidth required
                 InputProps={{startAdornment: (<InputAdornment position="start"><AssignmentTurnedInIcon color="action"/></InputAdornment>)}}
                >
                    {appointmentStatusesForAdmin.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </TextField>
            </Grid>
          )}

          <Grid item xs={12} md={(isAdminForm && !isStepMode && currentStatus) ? 6 : 12}>
            <TextField label={(!isAdminForm || isStepMode) ? "Ваші побажання (необов'язково)" : "Нотатки клієнта"}
              value={clientNotes} onChange={(e) => setClientNotes(e.target.value)}
              fullWidth multiline rows={(!isAdminForm || isStepMode) ? 3 : 2}
              InputProps={{startAdornment: (<InputAdornment position="start"><NotesIcon color="action"/></InputAdornment>)}}
              disabled={isAdminForm && !isStepMode && !selectedClient && !existingAppointmentData} // Блокуємо, якщо клієнт не обраний
            />
          </Grid>

          {isAdminForm && !isStepMode && (
             <Grid item xs={12}>
                <TextField label="Нотатки адміна/спеціаліста" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                fullWidth multiline rows={2}
                InputProps={{startAdornment: (<InputAdornment position="start"><NotesIcon color="info"/></InputAdornment>)}}
                disabled={!selectedClient && !existingAppointmentData} // Блокуємо, якщо клієнт не обраний/запис не редагується
                />
            </Grid>
          )}

          <Grid item xs={12} sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: (isAdminForm && !isStepMode) ? 'flex-end' : (isStepMode ? 'flex-end': 'center'), gap: 1.5 }}>
                {(isAdminForm && !isStepMode && onCancel) && (
                    <Button onClick={onCancel} variant="outlined" color="inherit" disabled={submitting}>
                        Скасувати
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting || !selectedService || !appointmentDateTime || (isAdminForm && !isStepMode && !selectedClient && !userIdForAdmin && !existingAppointmentData?.user_id)}
                    startIcon={submitting && !isStepMode ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ px: (isAdminForm && !isStepMode) ? 2 : (isStepMode ? 3 : 5), py: (isAdminForm && !isStepMode) ? 1 : (isStepMode ? 1.25 : 1.5) }}
                >
                  {isStepMode ? 'Далі' :
                   (submitting ? 'Обробка...' :
                    (isAdminForm && existingAppointmentData ? 'Зберегти зміни' : 'Записатися'))
                  }
                </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentForm;