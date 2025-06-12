// src/components/Specialists/SpecialistCard.jsx
import React from 'react';
import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    Avatar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Локальна функція для скорочення рядка
const truncateLocalString = (str, maxLength) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength).trim() + '...';
};

const SpecialistCard = ({ specialist }) => {
  if (!specialist) return null;

  const {
    id,
    first_name,
    last_name,
    specialization,
    bio_short,
    photo_url,
    services_provided, // Рядок з переліком послуг (наприклад, "Масаж, Йога, Консультація")
  } = specialist;

  const fullName = `${first_name || ''} ${last_name || ''}`.trim();

  return (
    <Card
       sx={{
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    maxWidth: 500, // обмежуємо максимальну ширину картки
    mx: 'auto',    // центр картки в колонці
  }}
  elevation={3}
    >
      <CardActionArea
        component={RouterLink}
        to={`/specialists/${id}`}
        sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: {xs: 2, sm: 2.5} // Адаптивні падінги
        }}
      >
        <Avatar
          alt={fullName}
          src={photo_url || undefined } // undefined, щоб показати fallback іконку, якщо photo_url немає
          sx={{
              width: {xs: 100, sm: 120},
              height: {xs: 100, sm: 120},
              mb: 2,
              border: '3px solid',
              borderColor: 'primary.light', // Колір рамки аватара
              fontSize: {xs: '2.5rem', sm: '3rem'} // Розмір іконки/літери всередині
          }}
        >
          {/* Якщо немає photo_url, показуємо першу літеру імені або іконку за замовчуванням */}
          {!photo_url && fullName ? fullName.charAt(0).toUpperCase() :
           !photo_url && !fullName ? <AccountCircleIcon sx={{fontSize: 'inherit'}} /> : null}
        </Avatar>
        <CardContent sx={{ flexGrow: 1, p: 0, width: '100%' }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{ fontWeight: 'medium', minHeight: {xs:'auto', sm:'2.6em'} /* ~2 рядки */}}
          >
            {fullName || 'Ім\'я не вказано'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
            {truncateLocalString(specialization || 'Спеціалізація не вказана', 50)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
                mb: 2,
                minHeight: {xs: 'auto', sm: '4.2em'} /* ~3 рядки */,
                lineHeight: 1.4
            }}
          >
            {truncateLocalString(bio_short || 'Короткий опис відсутній.', 100)}
          </Typography>
          {services_provided && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb:1, minHeight: '24px' /* Щоб не стрибала висота */}}>
                {services_provided.split(',').slice(0, 2).map(service => ( // Показуємо тільки перші 2 для компактності
                    <Chip key={service.trim()} label={truncateLocalString(service.trim(), 20)} size="small" variant="outlined" />
                ))}
                {services_provided.split(',').length > 2 && <Chip label="..." size="small" variant="outlined"/>}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0, borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
        <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to={`/booking?specialist=${id}`} // Посилання на бронювання з ID спеціаліста
            fullWidth
            sx={{mt:1.5}}
            size="medium"
        >
          Записатися
        </Button>
      </Box>
    </Card>
  );
};

export default SpecialistCard;