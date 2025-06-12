// src/components/Posts/PostList.jsx
import React from 'react';
import { Grid, Typography, Box, Pagination, CircularProgress } from '@mui/material';
import PostCard from './PostCard.jsx';
import AlertMessage from '../Common/AlertMessage.jsx'; // Виправлено шлях

const PostList = ({ posts, loading, error, page, totalPages, onPageChange }) => {
  const showInitialLoader = loading && (!posts || posts.length === 0);
  const showNoResults = !loading && (!posts || posts.length === 0) && !error;
  const showError = error && (!posts || posts.length === 0); // Показувати помилку, тільки якщо немає даних

  if (showInitialLoader) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (showError) {
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 3 }}>
            <AlertMessage severity="error" message={error} />
        </Box>
    );
  }

  if (showNoResults) {
    return (
        <Typography sx={{ my: 5, textAlign: 'center', color: 'text.secondary', width: '100%' }}>
            Наразі немає доступних постів.
        </Typography>
    );
  }

  return (
    // Головний контейнер для PostList, який центрує свій вміст
    <Box 
        sx={{
            my: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', // Центрує Grid і Pagination по горизонталі
            width: '100%'
        }}
    >
      {loading && posts && posts.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24}/>
            <Typography color="text.secondary" sx={{ml:1}}>Оновлення...</Typography>
          </Box>
      )}
      
      {/* Grid для карток постів. justifyContent="center" тут для вирівнювання 
          карток, якщо вони не заповнюють весь рядок */}
      <Grid 
        container 
        spacing={3} 
        justifyContent="center" // Центрує Grid items, якщо рядок неповний
        sx={{ 
            width: '100%', // Дозволяє Grid зайняти всю доступну ширину (обмежену батьком)
            // Можна додати maxWidth, якщо потрібно обмежити ширину самого блоку з постами
            // maxWidth: 1200, // наприклад
        }}
      >
        {(posts || []).map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id || post.slug} sx={{ display: 'flex' }}> {/* display:flex для PostCard */}
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
      
      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, width: '100%' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => onPageChange(value)}
            color="primary"
            showFirstButton
            showLastButton
            size="large" // Зробив пагінацію більшою
          />
        </Box>
      )}
    </Box>
  );
};

export default PostList;