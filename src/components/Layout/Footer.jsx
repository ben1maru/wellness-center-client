// src/components/Layout/Footer.jsx
import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: {xs: 3, md: 4}, // Адаптивні відступи
        px: 2,
        mt: 'auto', 
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[900], // Зробив темнішим для темної теми
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Оздоровчий Центр "Гармонія"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ваш надійний партнер на шляху до здоров'я, краси та внутрішньої гармонії.
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{fontWeight:'medium'}}>
              Навігація
            </Typography>
            <MuiLink component={RouterLink} to="/" variant="body2" display="block" color="text.secondary" sx={{mb:0.5, '&:hover': {color: 'primary.main'}}}>Головна</MuiLink>
            <MuiLink component={RouterLink} to="/services" variant="body2" display="block" color="text.secondary" sx={{mb:0.5, '&:hover': {color: 'primary.main'}}}>Послуги</MuiLink>
            <MuiLink component={RouterLink} to="/posts" variant="body2" display="block" color="text.secondary" sx={{mb:0.5, '&:hover': {color: 'primary.main'}}}>Блог</MuiLink>
            <MuiLink component={RouterLink} to="/contact" variant="body2" display="block" color="text.secondary" sx={{'&:hover': {color: 'primary.main'}}}>Контакти</MuiLink>
          </Grid>
          <Grid item xs={12} sm={6} md={3}> {/* Змінив xs для кращого відображення на малих екранах */}
            <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{fontWeight:'medium'}}>
              Контакти
            </Typography>
            <Typography variant="body2" color="text.secondary">м. Київ, вул. Здоров'я, 1</Typography>
            <Typography variant="body2" color="text.secondary" sx={{my:0.5}}>
                <MuiLink href="mailto:info@wellness.com.ua" color="inherit" sx={{'&:hover': {color: 'primary.main'}}}>info@wellness.com.ua</MuiLink>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                <MuiLink href="tel:+380991234567" color="inherit" sx={{'&:hover': {color: 'primary.main'}}}>+38 (099) 123-45-67</MuiLink>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ textAlign: {xs: 'left', sm:'right'}, mt: {xs:2, sm:0} }}> {/* Вирівнювання для соц. іконок */}
             <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{fontWeight:'medium'}}>
              Ми в соцмережах
            </Typography>
            <IconButton aria-label="facebook" color="inherit" component="a" href="https://facebook.com" target="_blank" sx={{'&:hover': {color: 'primary.main'}}}>
              <FacebookIcon />
            </IconButton>
            <IconButton aria-label="instagram" color="inherit" component="a" href="https://instagram.com" target="_blank" sx={{'&:hover': {color: 'primary.main'}}}>
              <InstagramIcon />
            </IconButton>
            <IconButton aria-label="telegram" color="inherit" component="a" href="https://telegram.org" target="_blank" sx={{'&:hover': {color: 'primary.main'}}}>
              <TelegramIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 3, mt:3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
          {'© '}
          <MuiLink color="inherit" component={RouterLink} to="/" sx={{'&:hover': {color: 'primary.main'}}}>
            Оздоровчий Центр "Гармонія"
          </MuiLink>{' '}
          {new Date().getFullYear()}
          {'. Всі права захищено.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;