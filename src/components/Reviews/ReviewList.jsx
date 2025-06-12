// src/components/Reviews/ReviewList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Pagination, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Grid 
} from '@mui/material';
import ReviewItem from './ReviewItem.jsx'; // Імпортуємо наш ReviewItem
import { getServiceReviews } from '../../api/dataApi.js'; // Використовуємо dataApi.js
import AlertMessage from '../Common/AlertMessage.jsx';

const ReviewList = ({ serviceId, refreshTrigger = 0 }) => { // refreshTrigger для оновлення списку ззовні
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [limit] = useState(5); 
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sort, setSort] = useState('newest');

  const fetchReviews = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getServiceReviews(serviceId, { page, limit, sort });
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити відгуки.');
      console.error("Fetch reviews error:",err);
    } finally {
      setLoading(false);
    }
  }, [serviceId, page, limit, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1); 
  };

  if (loading && reviews.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>;
  }

  if (error && reviews.length === 0) { // Показувати помилку, тільки якщо немає відгуків для відображення
    return <AlertMessage severity="error" message={error} sx={{my: 2}} onClose={() => setError('')} />;
  }

  if (!loading && totalReviews === 0 && !error) {
    return <Typography color="text.secondary" sx={{my:2, fontStyle: 'italic'}}>Для цієї послуги ще немає відгуків.</Typography>;
  }

  return (
    <Box>
        <Grid container justifyContent="space-between" alignItems="center" sx={{mb:2, mt:1, flexWrap: 'wrap', gap: 1}}>
            <Grid item xs={12} sm="auto">
                 {totalReviews > 0 && (
                    <Typography variant="body1" component="div">
                        Всього відгуків: <strong>{totalReviews}</strong>
                    </Typography>
                 )}
            </Grid>
            <Grid item xs={12} sm="auto" sx={{ml: {sm: 'auto'}}}>
                {totalReviews > 0 && (
                    <FormControl size="small" sx={{minWidth: 200}}>
                        <InputLabel id="sort-reviews-label">Сортувати за</InputLabel>
                        <Select
                            labelId="sort-reviews-label"
                            value={sort}
                            label="Сортувати за"
                            onChange={handleSortChange}
                        >
                            <MenuItem value="newest">Спочатку новіші</MenuItem>
                            <MenuItem value="oldest">Спочатку старіші</MenuItem>
                            <MenuItem value="highest_rating">Найвища оцінка</MenuItem>
                            <MenuItem value="lowest_rating">Найнижча оцінка</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Grid>
        </Grid>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
      
      {!loading && reviews.length > 0 && reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default ReviewList;