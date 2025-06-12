// src/components/Posts/PostCard.jsx
import React from 'react';
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { uk } from 'date-fns/locale';

const DEFAULT_POST_IMAGE = 'https://via.placeholder.com/600x400.png?text=No+Image';

// truncateLocalString може бути непотрібним, якщо використовується line-clamp
// const truncateLocalString = (str, maxLength) => {
//   if (!str) return '';
//   if (str.length <= maxLength) return str;
//   return str.substring(0, maxLength) + '...';
// };

const PostCard = ({ post }) => {
  if (!post) return null;

  const {
    slug,
    title,
    content_short,
    image_url,
    published_at,
    category_name,
    category_slug,
    author_first_name,
    author_last_name,
  } = post;

  const displayPublishedDate = () => {
    if (!published_at) return 'Дата не вказана';
    const date = parseISO(published_at);
    if (!isValidDate(date)) return 'Некоректна дата';
    try {
      return format(date, 'dd MMMM yyyy', { locale: uk });
    } catch (error) {
      console.error("Error formatting post date:", error);
      return 'Помилка форматування';
    }
  };

  return (
    <Card sx={{
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    maxWidth: 500, // обмежуємо максимальну ширину картки
    mx: 'auto',    // центр картки в колонці
  }}
  elevation={3}>
      <CardActionArea component={RouterLink} to={`/posts/${slug}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200" // Фіксована висота для зображення
          image={image_url || DEFAULT_POST_IMAGE}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {category_name && (
            <Chip
              label={category_name} // Можна додати truncateLocalString сюди, якщо назви категорій довгі
              size="small"
              color="secondary"
              component={RouterLink}
              to={category_slug ? `/posts/category/${category_slug}` : '/posts'}
              clickable
              sx={{ mb: 1, alignSelf: 'flex-start' }}
            />
          )}
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              // Варіант з line-clamp (потрібно підібрати height)
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2, // Обмеження в 2 рядки
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              height: '3.2em', // Приблизна висота для 2 рядків h5 з line-height: 1.3-1.4
                               // Можна також використовувати theme.typography.h5.lineHeight
              // Або ваш попередній варіант з minHeight:
              // minHeight: '3.5em'
            }}
          >
            {title} {/* Передаємо повний title, CSS обріже, якщо використовується line-clamp */}
            {/* {truncateLocalString(title, 70)} // Якщо використовуєте minHeight */}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              flexGrow: 1, // Це дозволить цьому блоку розтягнутися
              // Варіант з line-clamp (потрібно підібрати height)
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3, // Обмеження в 3 рядки
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              height: '4.5em', // Приблизна висота для 3 рядків body2
              // Або ваш попередній варіант з minHeight:
              // minHeight: '4.5em'
            }}
          >
            {content_short || ''} {/* Передаємо повний content_short */}
            {/* {truncateLocalString(content_short || '', 150)} // Якщо використовуєте minHeight */}
          </Typography>
          {/* Блок автора і дати притиснутий до низу завдяки mt: 'auto' та flexGrow:1 на описі */}
          <Box sx={{ mt: 'auto', pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {author_first_name && author_last_name
                ? `Автор: ${author_first_name} ${author_last_name}`
                : (author_first_name ? `Автор: ${author_first_name}`: 'Автор не вказаний')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {displayPublishedDate()}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PostCard;