// src/pages/public/SpecialistsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx'; // Шлях: ../../components/Common/PageTitle.jsx
import SpecialistList from '../../components/Specialists/SpecialistList.jsx'; // Шлях: ../../components/Specialists/SpecialistList.jsx
import AlertMessage from '../../components/Common/AlertMessage.jsx'; // Шлях: ../../components/Common/AlertMessage.jsx
import { getAllSpecialists } from '../../api/dataApi.js'; // Шлях: ../../api/dataApi.js

const SpecialistsPage = () => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSpecialists = useCallback(async () => {
    setLoading(true);
    setError('');
    console.log('Attempting to fetch specialists...'); // <-- ЛОГ: Початок запиту
    try {
      const data = await getAllSpecialists();
      console.log('Data received from getAllSpecialists API:', data); // <-- ЛОГ: Отримані дані
      setSpecialists(data || []); // Встановлюємо порожній масив, якщо data - null/undefined
    } catch (err) {
      const errorMessage = err.message || 'Не вдалося завантажити список спеціалістів.';
      console.error('Error fetching specialists:', err); // <-- ЛОГ: Помилка
      setError(errorMessage);
      setSpecialists([]); // Скидаємо спеціалістів у випадку помилки
    } finally {
      setLoading(false);
      console.log('Finished fetching specialists.'); // <-- ЛОГ: Завершення запиту
    }
  }, []); // Порожній масив залежностей, оскільки функція не залежить від пропсів чи стану

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]); // Залежність від мемоізованої функції

  console.log('Current specialists state:', specialists); // <-- ЛОГ: Поточний стан спеціалістів
  console.log('Current loading state:', loading);       // <-- ЛОГ: Поточний стан завантаження
  console.log('Current error state:', error);           // <-- ЛОГ: Поточний стан помилки

  return (
    <Container maxWidth="lg" sx={{ py: {xs:2, md:3} }}>
      <PageTitle title="Наша Команда" subtitle="Познайомтеся з нашими кваліфікованими фахівцями" />
      
      {/* Показуємо помилку, тільки якщо немає даних І є помилка */}
      {error && (!specialists || specialists.length === 0) && (
        <AlertMessage 
            severity="error" 
            message={error} 
            sx={{my:2}} 
            onClose={() => setError('')} 
        />
      )}

      <SpecialistList 
        specialists={specialists} 
        loading={loading} 
        // Передаємо помилку в SpecialistList тільки якщо дані ще не завантажені, 
        // щоб уникнути показу помилки поверх вже існуючих даних при невдалому оновленні
        error={error && (!specialists || specialists.length === 0) ? error : null} 
      />
    </Container>
  );
};

export default SpecialistsPage;