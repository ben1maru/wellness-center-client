// src/pages/admin/AdminAppointmentsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, CircularProgress, IconButton, Tooltip, Paper, Typography, Grid, TextField, MenuItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

import PageTitle from '../../components/Common/PageTitle.jsx';
import AppointmentCalendar from '../../components/Appointments/AppointmentCalendar.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';

// Припускаємо, що getUsers тепер існує в dataApi.js і працює (або коректно обробляється помилка)
import { getAllAppointments, getServices, getAllSpecialists, getUsers } from '../../api/dataApi.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { uk } from 'date-fns/locale';
// import { formatISO, isValid } from 'date-fns'; // Не використовуються прямо тут

const AdminAppointmentsPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [loadingPage, setLoadingPage] = useState(false);
  const [errorPage, setErrorPage] = useState(''); // Для загальних помилок завантаження даних фільтрів

  const [availableSpecialists, setAvailableSpecialists] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [filterSpecialistId, setFilterSpecialistId] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  // const [filterDateFrom, setFilterDateFrom] = useState(null); // Якщо не керуємо початковою датою календаря звідси
  // const [filterDateTo, setFilterDateTo] = useState(null);

  const [refreshCalendarTrigger, setRefreshCalendarTrigger] = useState(0);

  useEffect(() => {
    const loadFilterData = async () => {
      setLoadingPage(true);
      setErrorPage('');
      let specialistsLoaded = false;
      let clientsLoaded = false;
      try {
        const results = await Promise.allSettled([
          getAllSpecialists(),
          getUsers({ role: 'client' }) // Цей запит все ще буде давати 404, поки бекенд не готовий
        ]);

        if (results[0].status === 'fulfilled') {
          setAvailableSpecialists(results[0].value || []);
          specialistsLoaded = true;
        } else {
          console.error("Error loading specialists:", results[0].reason);
          showNotification("Помилка завантаження списку спеціалістів.", "error");
        }

        if (results[1].status === 'fulfilled') {
          setAvailableClients(results[1].value?.users || results[1].value || []);
          clientsLoaded = true;
        } else {
          console.error("Error loading clients for filter:", results[1].reason);
          // Не показуємо критичну помилку, якщо основні дані (записи) можуть бути завантажені календарем
          showNotification("Не вдалося завантажити список клієнтів для фільтра (API /users не знайдено або помилка).", "warning");
          setAvailableClients([]);
        }
        
      } catch (err) { // Цей catch рідко спрацює з Promise.allSettled, але залишаємо для непередбачених випадків
        console.error("Unexpected error in loadFilterData wrapper:", err);
        const msg = "Загальна помилка завантаження даних для фільтрів.";
        setErrorPage(msg);
        showNotification(msg, "error");
      } finally {
        setLoadingPage(false);
      }
    };
    loadFilterData();
  }, [showNotification]); // Залежність оновлена

  const handleSelectEventFromCalendar = (eventDataFromCalendar) => {
    console.log("Selected appointment from calendar (Admin view):", eventDataFromCalendar);
    showNotification(`Обрано запис #${eventDataFromCalendar.id} для "${eventDataFromCalendar.service_name}" клієнта ${eventDataFromCalendar.client_first_name || ''}`.trim(), 'info');
    // Якщо потрібно редагувати, тут має бути логіка відкриття форми/переходу на сторінку
    // navigate(`/admin/appointments/edit/${eventDataFromCalendar.id}`);
  };

  const resetFilters = () => {
    setFilterSpecialistId('');
    setFilterClientId('');
    setFilterStatus('');
    // setFilterDateFrom(null);
    // setFilterDateTo(null);
    setRefreshCalendarTrigger(prev => prev + 1);
  };

  const applyFilters = () => {
     setRefreshCalendarTrigger(prev => prev + 1);
  };

  const appointmentStatuses = [
    { value: 'pending', label: 'Очікує' }, { value: 'confirmed', label: 'Підтверджено' },
    { value: 'cancelled_by_client', label: 'Скасовано клієнтом' }, { value: 'cancelled_by_admin', label: 'Скасовано адміном.' },
    { value: 'completed', label: 'Завершено' }, { value: 'no_show', label: 'Неявка' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
      <Box sx={{pb:3}}>
        <PageTitle
          title="Календар Записів Адміністратора"
          subtitle="Перегляд та фільтрація всіх записів на прийом."
          actions={
            <Tooltip title={showFilters ? "Сховати фільтри" : "Показати фільтри"}>
              <IconButton onClick={() => setShowFilters(!showFilters)} color={showFilters ? "primary" : "default"}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          }
        />

        {errorPage && <AlertMessage severity="error" message={errorPage} onClose={() => setErrorPage('')} sx={{ mb: 2 }} />}

        {showFilters && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{mb:2}}>Фільтри</Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={3}>
                <TextField select label="Спеціаліст" value={filterSpecialistId} onChange={(e) => setFilterSpecialistId(e.target.value)} fullWidth size="small" disabled={loadingPage}>
                  <MenuItem value=""><em>Всі спеціалісти</em></MenuItem>
                  {availableSpecialists.map(spec => <MenuItem key={spec.id} value={spec.id}>{spec.first_name} {spec.last_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField 
                    select 
                    label="Клієнт" 
                    value={filterClientId} 
                    onChange={(e) => setFilterClientId(e.target.value)} 
                    fullWidth 
                    size="small" 
                    disabled={loadingPage || availableClients.length === 0} 
                    helperText={availableClients.length === 0 && !loadingPage ? "Клієнти не завантажені (перевірте API /users)" : ""}
                >
                  <MenuItem value=""><em>Всі клієнти</em></MenuItem>
                  {availableClients.map(client => <MenuItem key={client.id} value={client.id}>{client.first_name} {client.last_name} ({client.email})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select label="Статус" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} fullWidth size="small">
                  <MenuItem value=""><em>Всі статуси</em></MenuItem>
                  {appointmentStatuses.map(status => <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>)}
                </TextField>
              </Grid>
              {/* Можна прибрати фільтри по даті, якщо календар сам керує цим */}
              <Grid item xs={12} md={3} display="flex" justifyContent={{xs: 'stretch', md:'flex-end'}} gap={1} >
                <Button onClick={resetFilters} variant="outlined" size="medium" sx={{flexGrow:{xs:1, md:0}}}>Скинути</Button>
                <Button onClick={applyFilters} variant="contained" size="medium" sx={{flexGrow:{xs:1, md:0}}}>Застосувати</Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {loadingPage ? 
            (<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}><CircularProgress size={50} /></Box>)
            :
            (<AppointmentCalendar
                key={refreshCalendarTrigger}
                userRole="admin"
                onSelectEvent={handleSelectEventFromCalendar}
                filterParams={{
                    specialist_id: filterSpecialistId,
                    client_id: filterClientId,
                    status: filterStatus,
                }}
            />)
        }
      </Box>
    </LocalizationProvider>
  );
};

export default AdminAppointmentsPage;