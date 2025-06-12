// src/components/Reviews/ReviewItem.jsx
import React from 'react';
import { 
    Paper, 
    Avatar, 
    Rating, 
    Typography, 
    Box, 
    Divider // Для візуального розділення, якщо потрібно
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star'; // Для порожніх зірок в Rating
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Заглушка для аватара

// Імпорти з date-fns для форматування дати
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { uk } from 'date-fns/locale';

const ReviewItem = ({ review }) => {
  if (!review) return null;

  const reviewDate = review.created_at ? parseISO(review.created_at) : null;
  const displayReviewDate = () => {
    if (!reviewDate || !isValidDate(reviewDate)) return 'Дата невідома';
    try { 
      return format(reviewDate, 'dd MMMM yyyy', { locale: uk }); // Формат без часу
    } catch (error) {
      console.error("Error formatting review date:", error);
      return '';
    }
  };

  const authorFirstName = review.user_first_name || review.first_name || 'Анонім'; // Пріоритет user_first_name, якщо є з JOIN
  const authorLastName = review.user_last_name || review.last_name || '';

  return (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 2, 
            mb: 2, 
            // border: 1, borderColor: 'divider', borderRadius: 1 // Або так
            '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' } // Лінія тільки між відгуками
        }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Avatar sx={{ mr: 2, bgcolor: 'secondary.light', width: 40, height: 40 }}>
          {/* Тут можна додати логіку для user.photo_url, якщо він є */}
          {authorFirstName ? authorFirstName.charAt(0).toUpperCase() : <AccountCircleIcon />}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
            {authorFirstName} {authorLastName}
          </Typography>
          <Rating 
            value={review.rating || 0} 
            readOnly 
            size="small" 
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} 
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
          {displayReviewDate()}
        </Typography>
      </Box>
      {review.comment && (
        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', pl: {xs:0, sm: '56px'} /* Відступ як у тексту під аватаром */ }}>
          {review.comment}
        </Typography>
      )}
    </Paper>
  );
};

export default ReviewItem;