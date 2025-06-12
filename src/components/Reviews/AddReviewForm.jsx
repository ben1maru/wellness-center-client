// src/components/Reviews/AddReviewForm.jsx
import React, { useState, useContext } from 'react';
import { 
    Box, 
    Paper,
    TextField, 
    Button, 
    Rating, 
    Typography, 
    CircularProgress, 
    Alert,
    Link as MuiLink // Для посилання на логін/реєстрацію
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Link as RouterLink } from 'react-router-dom';

import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';
import { addReviewToService } from '../../api/dataApi.js'; // Використовуємо dataApi.js

const AddReviewForm = ({ serviceId, onReviewAdded }) => {
  const authContext = useContext(AuthContext);
  const notificationContext = useContext(NotificationContext);

  const isAuthenticated = authContext ? authContext.isAuthenticated : false;
  // const user = authContext ? authContext.user : null; // Не використовується напряму тут
  const showNotification = notificationContext ? notificationContext.showNotification : () => {};

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ratingLabels = {
    0.5: 'Дуже погано+', 1: 'Жахливо',
    1.5: 'Погано+',     2: 'Погано',
    2.5: 'Задовільно+', 3: 'Нормально',
    3.5: 'Добре+',      4: 'Добре',
    4.5: 'Чудово',    5: 'Відмінно!',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification('Будь ласка, увійдіть, щоб залишити відгук.', 'warning');
      return;
    }
    if (rating === 0) {
      setError('Будь ласка, поставте оцінку (кількість зірок).');
      return;
    }
    // Коментар може бути необов'язковим, валідація на бекенді
    // if (!comment.trim() && rating > 0) { // Якщо оцінка є, а коментаря немає - можна дозволити
    //   setError('Будь ласка, напишіть ваш відгук.');
    //   return;
    // }

    setIsSubmitting(true);
    setError('');
    try {
      await addReviewToService(serviceId, { rating, comment }); // Передаємо serviceId
      showNotification('Дякуємо! Ваш відгук додано та очікує на модерацію.', 'success');
      setRating(0);
      setComment('');
      if (onReviewAdded) {
        onReviewAdded(); 
      }
    } catch (err) {
      const errMsg = err.message || 'Не вдалося додати відгук. Можливо, ви вже залишали відгук на цю послугу, або не користувалися нею раніше.';
      setError(errMsg);
      showNotification(errMsg, 'error');
      console.error("Add review error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Щоб залишити відгук, будь ласка,{' '}
          <MuiLink component={RouterLink} to="/login" state={{ from: window.location.pathname + window.location.search }}>
            увійдіть
          </MuiLink>{' '}
          або{' '}
          <MuiLink component={RouterLink} to="/register" state={{ from: window.location.pathname + window.location.search }}>
            зареєструйтеся
          </MuiLink>.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p:2, border: 1, borderColor: 'divider', borderRadius: 1}}>
      <Typography variant="h6" gutterBottom>Залишити відгук</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography component="legend" sx={{mr: 1, fontSize: '0.9rem', color: 'text.secondary'}}>Ваша оцінка:</Typography>
        <Rating
          name="service-rating"
          value={rating}
          precision={0.5} // Дозволити півзірки
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          onChangeActive={(event, newHover) => {
            setHover(newHover);
          }}
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          size="large"
        />
        {rating !== null && rating > 0 && ( // Показувати текст, якщо оцінка не 0
          <Box sx={{ ml: 2, minWidth: '80px' }}>{ratingLabels[hover !== -1 ? hover : rating] || ''}</Box>
        )}
      </Box>

      <TextField
        label="Ваш коментар (необов'язково)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
        variant="outlined"
        placeholder="Напишіть тут свої враження від послуги..."
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting || rating === 0} // Кнопка неактивна, якщо не обрано рейтинг
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{mt:1}}
      >
        {isSubmitting ? 'Відправка...' : 'Надіслати відгук'}
      </Button>
    </Box>
  );
};

export default AddReviewForm;