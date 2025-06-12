// src/components/Services/ServiceCard.jsx
import React from 'react';
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Button,
    Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';

const DEFAULT_SERVICE_IMAGE = 'https://via.placeholder.com/600x400.png?text=Wellness+Service';

const formatLocalPrice = (priceValue, currencySymbol = 'грн') => {
  if (typeof priceValue !== 'number' && typeof priceValue !== 'string') return '';
  const numPrice = parseFloat(priceValue);
  if (isNaN(numPrice)) return '';
  return `${numPrice.toFixed(2)} ${currencySymbol}`;
};

const ServiceCard = ({ service }) => {
  if (!service) return null;

  const {
    id,
    slug,
    name,
    description_short,
    image_url,
    price,
    duration_minutes,
    category_name,
    category_slug,
  } = service;

  return (<Card
  sx={{
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    maxWidth: 300, // обмежуємо максимальну ширину картки
    mx: 'auto',    // центр картки в колонці
  }}
  elevation={3}
>

      <CardActionArea
        component={RouterLink}
        to={`/services/${slug}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <CardMedia
          component="img"
          sx={{
            height: 200,
            objectFit: 'cover'
          }}
          image={image_url || DEFAULT_SERVICE_IMAGE}
          alt={name}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {category_name && (
            <Chip
              icon={<CategoryIcon fontSize="small" />}
              label={category_name} // Повний текст категорії
              size="small"
              color="info"
              component={RouterLink}
              to={category_slug ? `/services?category=${category_slug}` : '/services'}
              clickable
              sx={{
                mb: 1.5,
                alignSelf: 'flex-start',
                textTransform: 'none',
                // Стилі для переносу тексту та обмеження ширини
                height: 'auto', // Дозволяє чіпу змінювати висоту залежно від тексту
                maxWidth: '90%', // Обмежуємо максимальну ширину чіпа (наприклад, 90% від батька)
                                 // Або фіксоване значення: maxWidth: 200,
                '& .MuiChip-label': { // Стилізуємо внутрішній label
                  whiteSpace: 'normal', // Дозволяє перенос тексту
                  wordWrap: 'break-word', // Перенос довгих слів
                  overflowWrap: 'break-word', // Альтернатива для переносу
                  textAlign: 'left', // Вирівнювання тексту вліво, якщо він у кілька рядків
                  py: 0.3, // Невеликий вертикальний падінг для label, якщо потрібно
                },
              }}
            />
          )}
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
                fontWeight: 'medium',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '2.6em',
                maxHeight: '2.6em',
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
                mb: 2,
                flexGrow: 1,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '4.2em',
                maxHeight: '4.2em',
            }}
          >
            {description_short || 'Опис відсутній.'}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {duration_minutes} хв
                </Typography>
              </Box>
              <Typography variant="h6" component="p" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {formatLocalPrice(price)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0, borderTop: 1, borderColor: 'divider' }}>
        <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to={`/booking?service=${id}`}
            fullWidth
            sx={{mt:1.5}}
        >
          Записатися
        </Button>
      </Box>
    </Card>
  );
};

export default ServiceCard;