// src/pages/public/ServiceDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Button, Paper, Grid, Chip, Divider } from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx'; // Може бути не потрібен, якщо заголовок послуги = заголовок сторінки
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import ReviewList from '../../components/Reviews/ReviewList.jsx';
import AddReviewForm from '../../components/Reviews/AddReviewForm.jsx';
import { getServiceBySlug } from '../../api/dataApi.js';
import DOMPurify from 'dompurify'; // Для безпечного рендерингу HTML з CKEditor

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';

// Заглушка для зображення
const DEFAULT_SERVICE_IMAGE_DETAIL = 'https://via.placeholder.com/800x400.png?text=Service+Details';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0); // Для оновлення списку відгуків

  const fetchServiceDetails = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      const data = await getServiceBySlug(slug);
      setService(data);
    } catch (err) {
      setError(err.message || `Послугу "${slug}" не знайдено або виникла помилка.`);
      console.error(`Fetch service ${slug} error:`, err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  const handleReviewAdded = () => {
    setReviewRefreshTrigger(prev => prev + 1);
  };
  
  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}><CircularProgress size={60} /></Box>;
  }
  if (error) {
    return <Container sx={{py:3}}><AlertMessage severity="error" title="Помилка завантаження" message={error} /></Container>;
  }
  if (!service) {
    return <Container sx={{py:3}}><Typography>Послугу не знайдено.</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: {xs:2, md:4} }}>
      <Paper elevation={0} sx={{ p: {xs: 2, md: 3} }}> {/* Обернув у Paper для кращого вигляду */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{borderRadius: 2, overflow: 'hidden', boxShadow: 1, maxHeight: {xs:300, md: 450}, display: 'flex'}}>
                <img 
                    src={service.image_url || DEFAULT_SERVICE_IMAGE_DETAIL} 
                    alt={service.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
              {service.name}
            </Typography>
            {service.category_name && (
              <Chip 
                icon={<CategoryIcon fontSize="small" />}
                label={service.category_name} 
                component={RouterLink}
                to={`/services?category=${service.category_slug}`}
                clickable
                color="info"
                size="small"
                sx={{ mb: 1.5 }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, color: 'text.secondary' }}>
                <Box sx={{display:'flex', alignItems:'center'}}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body1">{service.duration_minutes} хв.</Typography>
                </Box>
                 <Box sx={{display:'flex', alignItems:'center'}}>
                    <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body1">{parseFloat(service.price).toFixed(2)} грн</Typography>
                </Box>
            </Box>
            
            {service.description_short && (
                <Typography variant="h6" color="text.secondary" paragraph sx={{fontStyle: 'italic'}}>
                    {service.description_short}
                </Typography>
            )}
            <Button 
                component={RouterLink} 
                to={`/booking?service=${service.id}`} 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{mt:1, mb:3}}
            >
              Записатися на цю послугу
            </Button>
          </Grid>
        </Grid>
        
        {service.description_full && (
          <Box sx={{ my: 3, py: 2, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h5" gutterBottom sx={{fontWeight:'medium'}}>Детальний опис</Typography>
            {/* Використовуємо dangerouslySetInnerHTML для відображення HTML з CKEditor */}
            <Box className="ck-content" dangerouslySetInnerHTML={createMarkup(service.description_full)} sx={{
                '& p': { mb: 1.5, lineHeight: 1.7 },
                '& ul, & ol': { pl: 3, mb: 1.5 },
                '& li': { mb: 0.5 },
                '& h1, & h2, & h3, & h4, & h5, & h6': {mt:2.5, mb:1, fontWeight:'medium'}
            }}/>
          </Box>
        )}

        <Divider sx={{my: 4}}><Chip label="Відгуки клієнтів" /></Divider>
        <ReviewList serviceId={service.id} refreshTrigger={reviewRefreshTrigger} />
        <AddReviewForm serviceId={service.id} onReviewAdded={handleReviewAdded} />
      </Paper>
    </Container>
  );
};

export default ServiceDetailPage;