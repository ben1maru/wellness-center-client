// src/components/Posts/PostCategoryFilter.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, CircularProgress, Chip } from '@mui/material';
// Переконайтесь, що шлях правильний і функція експортується
import { getAllPostCategories } from '../../api/dataApi.js'; 
import AlertMessage from '../Common/AlertMessage.jsx';

const PostCategoryFilter = ({ currentCategorySlug, onCategoryChange, variant = "tabs" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllPostCategories();
        setCategories([{ id: 'all-posts', name: 'Всі категорії', slug: null }, ...(data || [])]);
      } catch (err) {
        setError('Не вдалося завантажити категорії постів.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (event, newValue) => {
    onCategoryChange(newValue === 'all-posts' ? null : newValue);
  };

  const handleChipClick = (slug) => {
    onCategoryChange(slug === 'all-posts' ? null : slug);
  }

  if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', my:1}}><CircularProgress size={24} /></Box>;
  if (error) return <AlertMessage severity="error" message={error} sx={{mb:2}} />;

  if (variant === "chips") {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: 'center' }}>
            {categories.map((category) => (
                <Chip
                    key={category.id}
                    label={category.name}
                    clickable
                    color={(currentCategorySlug === category.slug) || (!currentCategorySlug && category.slug === null) ? "primary" : "default"}
                    onClick={() => handleChipClick(category.slug)}
                    sx={{textTransform: 'none'}}
                />
            ))}
        </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={currentCategorySlug || 'all-posts'}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="фільтр категорій постів"
      >
        {categories.map((category) => (
          <Tab 
            key={category.id} 
            label={category.name} 
            value={category.slug || 'all-posts'}
            sx={{textTransform: 'none', fontSize: '0.9rem'}} // Трохи зменшив шрифт для табів
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default PostCategoryFilter;