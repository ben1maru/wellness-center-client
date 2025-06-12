// src/pages/admin/AdminAppointmentsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, CircularProgress, IconButton, Tooltip, Paper, Typography, Grid, TextField, MenuItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

import PageTitle from '../../components/Common/PageTitle.jsx';
import AppointmentCalendar from '../../components/Appointments/AppointmentCalendar.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';

import { getAllAppointments, getServices, getAllSpecialists, getUsers } from '../../api/dataApi.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { uk } from 'date-fns/locale';
// formatISO, parseISO, isValid тут не потрібні, якщо всі дати обробляються DatePicker та календарем

const AdminAppointmentsPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [loadingPage, setLoadingPage] = useState(false);
  const [errorPage, setErrorPage] = useState('');

  const [availableSpecialists, setAvailableSpecialists] = useState([]);
  const [availableClients, setAvailableClients] = useState([]); // Буде заповнюватися, якщо API /users запрацює

  const [showFilters, setShowFilters] = useState(false);
  const [filterSpecialistId, setFilterSpecialistId] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  // preselectedDate для календаря можна ініціалізувати з filterDateFrom, якщо потрібно
  // const [filterDateFrom, setFilterDateFrom] = useState(null); 
  // const [filterDateTo, setFilterDateTo] = useState(null);

  const [refreshCalendarTrigger, setRefreshCalendarTrigger] = useState(0);

  useEffect(() => {
    const loadFilterData = async () => {
      setLoadingPage(true);
      setErrorPage('');
      try {
        // getUsers буде намагатися завантажити клієнтів. Якщо API /users не працює, тут буде помилка.
        const [specialistsData, clientsDataResponse] = await Promise.allSettled([ // Використовуємо Promise.allSettled
          getAllSpecialists(),
          getUsers({ role: 'client' })
        ]);

        if (specialistsData.status === 'fulfilled') {
          setAvailableSpecialists(specialistsData.value || []);
        } else {
          console.error("Error loading specialists:", specialistsData.reason);
          showNotification("Помилка завантаження списку спеціалістів.", "error");
        }

        if (clientsDataResponse.status === 'fulfilled') {
          setAvailableClients(clientsDataResponse.value?.users || clientsDataResponse.value || []);
        } else {
          console.error("Error loading clients for filter:", clientsDataResponse.reason);
          // Не блокуємо сторінку через це, але виводимо попередження, якщо список клієнтів важливий
           showNotification("Не вдалося завантажити список клієнтів для фільтра.", "warning");
           setAvailableClients([]); // Залишаємо порожнім, щоб форма не ламалася
        }
        
        // Завантаження послуг, якщо вони потрібні для фільтрів (поки закоментовано)
        // const servicesData = await getServices({ is_active: true });
        // setAvailableServices(servicesData || []);

      } catch (err) { // Цей catch може не спрацювати, якщо Promise.allSettled використовується
        console.error("Unexpected error in loadFilterData:", err);
        const msg = "Загальна помилка завантаження даних для фільтрів.";
        setErrorPage(msg); // Можна встановити загальну помилку сторінки
        showNotification(msg, "error");
      } finally {
        setLoadingPage(false);
      }
    };
    loadFilterData();
  }, [showNotification]); // Залежність від showNotification, щоб уникнути попереджень ESLint

  const handleSelectEventFromCalendar = (eventDataFromCalendar) => {
    console.log("Selected appointment from calendar (Admin view):", eventDataFromCalendar);
    showNotification(`Обрано запис #${eventDataFromCalendar.id} для "${eventDataFromCalendar.service_name}" клієнта ${eventDataFromCalendar.client_first_name || ''}`.trim(), 'info');
    // Тут можна реалізувати логіку відкриття модального вікна з деталями або перехід на сторінку редагування,
    // якщо ви вирішите повернути цю функціональність.
    // Наприклад: navigate(`/admin/appointments/edit/${eventDataFromCalendar.id}`);
  };

  const resetFilters = () => {
    setFilterSpecialistId('');
    setFilterClientId('');
    setFilterStatus('');
    // setFilterDateFrom(null); // Якщо керуємо початковою датою календаря
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
      <Box sx={{pb:3}}> {/* Додав відступ знизу */}
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
            <Grid container spacing={2} alignItems="flex-end"> {/* Змінив на alignItems="flex-end" для кращого вигляду кнопок */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField select label="Спеціаліст" value={filterSpecialistId} onChange={(e) => setFilterSpecialistId(e.target.value)} fullWidth size="small" disabled={loadingPage}>
                  <MenuItem value=""><em>Всі спеціалісти</em></MenuItem>
                  {availableSpecialists.map(spec => <MenuItem key={spec.id} value={spec.id}>{spec.first_name} {spec.last_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select label="Клієнт" value={filterClientId} onChange={(e) => setFilterClientId(e.target.value)} fullWidth size="small" disabled={loadingPage || availableClients.length === 0} helperText={availableClients.length === 0 && !loadingPage ? "Клієнти не завантажені" : ""}>
                  <MenuItem value=""><em>Всі клієнти</em></MenuItem>
                  {availableClients.map(client => <MenuItem key={client.id} value={client.id}>{client.first_name} {client.last_name} ({client.email})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}> {/* Змінив md={2} на md={3} для кращого розподілу */}
                <TextField select label="Статус" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} fullWidth size="small">
                  <MenuItem value=""><em>Всі статуси</em></MenuItem>
                  {appointmentStatuses.map(status => <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>)}
                </TextField>
              </Grid>
              {/* Фільтри по даті можуть бути не потрібні, якщо календар сам керує діапазоном */}
              {/*
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker label="Дата З" value={filterDateFrom} onChange={setFilterDateFrom} renderInput={(params) => <TextField {...params} fullWidth size="small" />} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker label="Дата По" value={filterDateTo} onChange={setFilterDateTo} renderInput={(params) => <TextField {...params} fullWidth size="small" />} minDate={filterDateFrom || undefined} />
              </Grid>
              */}
              <Grid item xs={12} md={3} display="flex" justifyContent={{xs: 'stretch', md:'flex-end'}} gap={1} > {/* Кнопки займають доступну ширину на xs */}
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
                // Передаємо фільтри в AppointmentCalendar.
                // AppointmentCalendar має використовувати ці фільтри у своєму запиті getAllAppointments.
                filterParams={{
                    specialist_id: filterSpecialistId,
                    client_id: filterClientId,
                    status: filterStatus,
                    // date_from і date_to для getAllAppointments в календарі будуть встановлюватися
                    // на основі dateRange самого календаря, тому filterDateFrom/To з цієї сторінки
                    // можуть використовуватися для встановлення початкового preselectedDate в календарі, якщо потрібно.
                }}
            />)
        }
      </Box>
    </LocalizationProvider>
  );
};

export default AdminAppointmentsPage;