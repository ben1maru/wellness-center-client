// src/components/Services/ServiceCategoryFilter.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, CircularProgress, Chip } from '@mui/material';
// Переконайтесь, що шлях правильний і функція експортується
import { getAllServiceCategories  } from '../../api/dataApi.js'; 
import AlertMessage from '../Common/AlertMessage.jsx'; // Переконайтесь, що шлях правильний

const ServiceCategoryFilter = ({ currentCategorySlug, onCategoryChange, variant = "tabs" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllServiceCategories ();
        // Додаємо опцію "Всі" на початок, тільки якщо є інші категорії
        setCategories(data && data.length > 0 ? [{ id: 'all-services', name: 'Всі послуги', slug: null }, ...data] : []);
      } catch (err) {
        setError('Не вдалося завантажити категорії послуг.');
        console.error("Fetch service categories error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (event, newValue) => {
    onCategoryChange(newValue === 'all-services' ? null : newValue);
  };

  const handleChipClick = (slug) => {
    onCategoryChange(slug === 'all-services' ? null : slug);
  }

  // Не показуємо фільтр, якщо немає категорій або йде завантаження/помилка
  if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', my:1, height: 48 /* приблизна висота Tabs */}}><CircularProgress size={24} /></Box>;
  if (error) return <AlertMessage severity="warning" message={error} sx={{mb:2}} />; // Попередження, бо це не критична помилка для сторінки
  if (categories.length <= 1) return null; // Не показувати фільтр, якщо є тільки "Всі послуги" або порожньо

  if (variant === "chips") {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: 'center' }}>
            {categories.map((category) => (
                <Chip
                    key={category.id || category.slug || 'all-services-chip'} // Унікальний ключ
                    label={category.name}
                    clickable
                    color={(currentCategorySlug === category.slug) || (!currentCategorySlug && category.slug === null) ? "primary" : "default"}
                    onClick={() => handleChipClick(category.slug)}
                    sx={{textTransform: 'none', fontSize: '0.9rem', px: 1}} // Зменшив шрифт і падінги для чіпсів
                />
            ))}
        </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={currentCategorySlug || 'all-services'}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="фільтр категорій послуг"
      >
        {categories.map((category) => (
          <Tab 
            key={category.id || category.slug || 'all-services-tab'} // Унікальний ключ
            label={category.name} 
            value={category.slug || 'all-services'}
            sx={{textTransform: 'none', fontSize: '0.9rem', minWidth: 100}} // Зменшив шрифт та встановив minWidth
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default ServiceCategoryFilter;