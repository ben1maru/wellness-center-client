// src/components/appointments/AppointmentCalendar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

// Імпорти для react-big-calendar
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { uk } from 'date-fns/locale'; // Українська локаль для date-fns
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Важливо імпортувати CSS!

// Імпорти з date-fns для роботи з датами
import { parseISO, formatISO, isValid as isValidDate, addMinutes } from 'date-fns';

import { getAvailableSlots, getAllAppointments } from '../../api/dataApi.js';
// import { getMyAppointments } from '../../api/dataApi.js'; // Якщо для спеціаліста потрібен інший ендпоінт

// Налаштування локалізатора для react-big-calendar
const locales = {
  'uk-UA': uk, // Використовуємо українську локаль
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: uk }), // Вказуємо початок тижня з Понеділка для української локалі
  getDay,
  locales,
});

// Словник для перекладу стандартних текстів календаря
const messages = {
  allDay: 'Весь день',
  previous: 'Попередній',
  next: 'Наступний',
  today: 'Сьогодні',
  month: 'Місяць',
  week: 'Тиждень',
  day: 'День',
  agenda: 'Розклад',
  date: 'Дата',
  time: 'Час',
  event: 'Подія', // Назва для події в розкладі
  noEventsInRange: 'Немає записів у цьому проміжку.',
  showMore: total => `+ ще ${total}`,
};


const AppointmentCalendar = ({ 
    serviceId,          // ID обраної послуги (для завантаження слотів)
    serviceDuration,    // Тривалість послуги в хвилинах (ВАЖЛИВО для коректного відображення кінця слоту)
    specialistId,       // ID обраного спеціаліста (опціонально)
    userRole,           // Роль поточного користувача ('client', 'specialist', 'admin')
    onSelectSlot,       // Callback при виборі вільного слоту (для клієнта) -> (slotInfo: { start: Date, end: Date })
    onSelectEvent,      // Callback при кліку на існуючий запис (для адміна/спеціаліста) -> (appointment: object)
    preselectedDate,    // Початкова дата для відображення
    viewMode = Views.WEEK // Початковий вигляд календаря ('month', 'week', 'day', 'agenda')
}) => {
  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Поточний діапазон дат, який відображається в календарі (для завантаження даних)
  const [dateRange, setDateRange] = useState(() => {
    const start = preselectedDate ? startOfWeek(preselectedDate, { locale: uk }) : startOfWeek(new Date(), { locale: uk });
    const end = new Date(start);
    end.setDate(start.getDate() + (viewMode === Views.MONTH ? 41 : 6)); // Приблизний діапазон для місяця/тижня
    return { start, end };
  });
  const [currentCalendarDate, setCurrentCalendarDate] = useState(preselectedDate || new Date());


  const fetchCalendarData = useCallback(async () => {
    // Завантажуємо дані тільки якщо є необхідні параметри
    if ((userRole === 'client' && (!serviceId || !serviceDuration)) && (userRole !== 'admin' && userRole !== 'specialist')) {
        setEvents([]);
        setError(userRole === 'client' ? 'Будь ласка, оберіть послугу для перегляду доступних слотів.' : '');
        return;
    }

    setLoading(true);
    setError('');
    try {
      let dataToDisplay = [];
      const apiParams = {
        // Параметри для API, наприклад, date_from, date_to, specialist_id
        date_from: formatISO(dateRange.start, { representation: 'date' }),
        date_to: formatISO(dateRange.end, { representation: 'date' }),
      };
      if (specialistId) {
        apiParams.specialist_id = specialistId;
      }


      if (userRole === 'client') {
        apiParams.service_id = serviceId;
        const availableSlots = await getAvailableSlots(apiParams);
        
        dataToDisplay = (Array.isArray(availableSlots) ? availableSlots : 
                        (typeof availableSlots === 'object' && availableSlots !== null && specialistId && Array.isArray(availableSlots[specialistId]) ? availableSlots[specialistId] : 
                        (typeof availableSlots === 'object' && availableSlots !== null && !specialistId ? Object.values(availableSlots).flat() : [])
                        ))
                        .map(slotISO => {
                            const start = parseISO(slotISO);
                            if (!isValidDate(start)) return null;
                            const end = addMinutes(start, serviceDuration); // Використовуємо передану тривалість
                            return { 
                                title: 'Вільно', 
                                start, 
                                end, 
                                allDay: false, 
                                resource: { type: 'slot', serviceId, serviceDuration } // Додаємо дані для обробки
                            };
                        }).filter(Boolean); // Видаляємо null (невалідні дати)
      } else if (userRole === 'specialist' || userRole === 'admin') {
        // Для спеціаліста фільтруємо за specialistId на бекенді
        // Для адміна можуть бути потрібні всі записи або фільтрація за спеціалістом
        const appointments = await getAllAppointments(apiParams);
        dataToDisplay = (appointments || []).map(app => {
            const start = parseISO(app.appointment_datetime);
            if (!isValidDate(start)) return null;
            const end = addMinutes(start, app.duration_minutes);
            return { 
                title: `${app.service_name} (${app.client_first_name ? `${app.client_first_name} ${app.client_last_name || ''}` : 'Клієнт'})`, 
                start, 
                end, 
                allDay: false, 
                resource: { ...app, type: 'appointment' } // Додаємо тип для розрізнення
            };
        }).filter(Boolean);
      }
      setEvents(dataToDisplay);
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити дані календаря.');
      console.error("fetchCalendarData error:", err);
    } finally {
      setLoading(false);
    }
  }, [userRole, serviceId, specialistId, serviceDuration, dateRange]); // Додаємо serviceDuration

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const handleNavigate = (newDate, view, action) => {
    setCurrentCalendarDate(newDate);
    // Оновлюємо dateRange для завантаження даних для нового видимого періоду
    // Логіка залежить від 'view' (місяць, тиждень, день)
    let newStart = startOfWeek(newDate, { locale: uk });
    let newEnd = new Date(newStart);
    if (view === Views.MONTH) {
        newStart.setDate(1); // Початок місяця
        newEnd = new Date(newStart);
        newEnd.setMonth(newStart.getMonth() + 1);
        newEnd.setDate(0); // Кінець місяця
        // Для завантаження з запасом для місячного вигляду (попередній/наступний місяць частково)
        newStart = startOfWeek(new Date(newStart.getFullYear(), newStart.getMonth(), 1), {locale: uk});
        newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + 41); // 6 тижнів
    } else if (view === Views.WEEK) {
        newEnd.setDate(newStart.getDate() + 6);
    } else { // Views.DAY
        newEnd = new Date(newStart); // Для дня start і end можуть бути однаковими
    }
    setDateRange({ start: newStart, end: newEnd });
  };

  const handleSelectSlotInternal = (slotInfo) => {
    // slotInfo: { start: Date, end: Date, slots: Date[], action: 'select' | 'click' | 'doubleClick' }
    if (userRole === 'client' && onSelectSlot && serviceId && serviceDuration) {
        // Перевіряємо, чи слот не в минулому
        if (slotInfo.start < new Date()) {
            // Можна показати сповіщення
            console.warn("Cannot select past slot");
            return;
        }
        // Передаємо початок слоту та розраховуємо кінець на основі тривалості послуги
        const calculatedEnd = addMinutes(slotInfo.start, serviceDuration);
        onSelectSlot({ start: slotInfo.start, end: calculatedEnd });
    }
  };

  const handleSelectEventInternal = (event) => {
    // event - це об'єкт з полями title, start, end, resource
    if (onSelectEvent && event.resource && event.resource.type === 'appointment') {
      onSelectEvent(event.resource); 
    } else if (onSelectSlot && event.resource && event.resource.type === 'slot') {
      // Якщо клікнули на подію "Вільно", це теж вибір слоту
      handleSelectSlotInternal({start: event.start, end: event.end, action: 'click'});
    }
  };
  
  // Налаштування висоти слотів та кроку
  const minTime = new Date();
  minTime.setHours(8, 0, 0); // Робочий день з 8:00
  const maxTime = new Date();
  maxTime.setHours(21, 0, 0); // Робочий день до 21:00

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', minHeight: '500px', my: 2, position: 'relative' }}> {/* Адаптивна висота */}
      {/* <Typography variant="h6" gutterBottom>Календар доступності</Typography> */}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{mb:2}}>{error}</Alert>}
      {loading && <CircularProgress sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>}
      
      {(!serviceId && userRole === 'client') ? (
        <Alert severity="info">Будь ласка, оберіть послугу, щоб побачити доступні години для запису.</Alert>
      ) : (
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }} // Займає всю висоту батьківського Box
            culture="uk-UA"
            messages={messages}
            selectable={userRole === 'client'} // Дозволити вибір слотів для клієнта
            onSelectSlot={handleSelectSlotInternal}
            onSelectEvent={handleSelectEventInternal}
            onNavigate={handleNavigate}
            onView={(view) => { /* Можна зберігати поточний view у стані */ }}
            defaultView={viewMode}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            date={currentCalendarDate} // Поточна дата, що відображається
            scrollToTime={new Date(1970, 1, 1, 8)} // Прокрутити до 8 ранку при відкритті
            min={minTime} // Обмеження часу для відображення
            max={maxTime} // Обмеження часу для відображення
            step={30}       // Крок слотів у хвилинах (для відображення сітки)
            timeslots={2}   // Кількість слотів на годину (якщо step=30 -> 60/30 = 2)
        />
      )}
    </Box>
  );
};

export default AppointmentCalendar;