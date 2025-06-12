import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ServiceCard from '../../components/Services/ServiceCard.jsx';
import SpecialistCard from '../../components/Specialists/SpecialistCard.jsx';
import PostCard from '../../components/Posts/PostCard.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';

import { getServices, getAllSpecialists, getPublishedPosts } from '../../api/dataApi.js';

// Hero Section
const HeroSection = () => (
  <Box 
    sx={{ 
      py: { xs: 6, md: 10 }, 
      textAlign: 'center', 
      bgcolor: 'primary.main', 
      color: 'primary.contrastText',
    }}
  >
    <Container maxWidth="md">
      <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Оздоровчий Центр "Гармонія"
      </Typography>
      <Typography variant="h5" component="p" color="inherit" paragraph sx={{ mb: 3, opacity: 0.9 }}>
        Ваш шлях до здоров'я, краси та внутрішньої рівноваги. Відкрийте для себе світ професійного догляду та релаксації.
      </Typography>
      <Button component={RouterLink} to="/services" variant="contained" size="large" color="secondary">
        Наші Послуги
      </Button>
      <Button
        component={RouterLink}
        to="/booking"
        variant="outlined"
        size="large"
        sx={{ ml: 2, color: 'white', borderColor: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
      >
        Записатися Онлайн
      </Button>
    </Container>
  </Box>
);

// About Section
const AboutSection = () => (
  <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
    <Grid container spacing={4} alignItems="center">
      <Grid item xs={12} md={6}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
          Про Наш Центр
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          "Гармонія" – це сучасний оздоровчий центр, де кожен знайде для себе індивідуальний підхід та програми для відновлення фізичного та душевного здоров'я.
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Ми пропонуємо широкий спектр послуг: від класичних масажів та SPA-процедур до інноваційних методик оздоровлення, йоги, фітнесу та консультацій дієтолога.
        </Typography>
        <Button component={RouterLink} to="/contact" variant="outlined" color="primary">
          Дізнатися більше
        </Button>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
          <img
            src="https://housing.com/news/wp-content/uploads/2022/11/Small-doctors-clinic-design-ideas-compressed.jpg"
            alt="Інтер'єр центру"
            style={{ width: '100%', display: 'block' }}
          />
        </Box>
      </Grid>
    </Grid>
  </Container>
);

const HomePage = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredSpecialists, setFeaturedSpecialists] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [servicesData, specialistsData, postsData] = await Promise.all([
          getServices({ limit: 3 }),
          getAllSpecialists({ limit: 3 }),
          getPublishedPosts({ limit: 3, page: 1 }),
        ]);
        setFeaturedServices(servicesData || []);
        setFeaturedSpecialists(specialistsData || []);
        setLatestPosts(postsData.posts || postsData || []);
      } catch (err) {
        setError('Не вдалося завантажити дані для головної сторінки.');
        console.error("Home page data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <HeroSection />
      <AboutSection />

      {/* Featured Services */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'medium', mb: 3 }}>
          Популярні Послуги
        </Typography>
        {loading && !featuredServices.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : error && !featuredServices.length ? (
          <AlertMessage severity="warning" message="Не вдалося завантажити послуги." />
        ) : !error && featuredServices.length === 0 && !loading ? (
          <Typography align="center" color="text.secondary">Наразі немає популярних послуг.</Typography>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {featuredServices.map(service => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <ServiceCard service={service} />
              </Grid>
            ))}
          </Grid>
        )}
        {featuredServices.length > 0 && (
          <Box textAlign="center" mt={4}>
            <Button component={RouterLink} to="/services" variant="contained">
              Всі послуги
            </Button>
          </Box>
        )}
      </Container>

      {/* Specialists Section */}
      <Box sx={{ bgcolor: 'alternate.main', py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'medium', mb: 3 }}>
            Наші Спеціалісти
          </Typography>
          {loading && !featuredSpecialists.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
          ) : error && !featuredSpecialists.length ? (
            <AlertMessage severity="warning" message="Не вдалося завантажити спеціалістів." />
          ) : !error && featuredSpecialists.length === 0 && !loading ? (
            <Typography align="center" color="text.secondary">Наразі немає інформації про спеціалістів.</Typography>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {featuredSpecialists.map(specialist => (
                <Grid item xs={12} sm={6} md={4} key={specialist.id}>
                  <SpecialistCard specialist={specialist} />
                </Grid>
              ))}
            </Grid>
          )}
          {featuredSpecialists.length > 0 && (
            <Box textAlign="center" mt={4}>
              <Button component={RouterLink} to="/specialists" variant="contained">
                Вся команда
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Latest Posts */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'medium', mb: 3 }}>
          Останні Статті Блогу
        </Typography>
        {loading && !latestPosts.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : error && !latestPosts.length ? (
          <AlertMessage severity="warning" message="Не вдалося завантажити пости." />
        ) : !error && latestPosts.length === 0 && !loading ? (
          <Typography align="center" color="text.secondary">Наразі немає нових статей.</Typography>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {latestPosts.map(post => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        )}
        {latestPosts.length > 0 && (
          <Box textAlign="center" mt={4}>
            <Button component={RouterLink} to="/posts" variant="contained">
              Читати всі статті
            </Button>
          </Box>
        )}
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', py: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Готові подбати про себе?
          </Typography>
          <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
            Зв'яжіться з нами сьогодні, щоб дізнатися більше про наші послуги або записатися на консультацію.
          </Typography>
          <Button component={RouterLink} to="/contact" variant="contained" color="secondary">
            Зв'язатися з нами
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;