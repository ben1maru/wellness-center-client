// src/pages/admin/AdminDashboardPage.jsx
import React, { useContext } from 'react';
import { Box, Typography, Grid, Paper, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageTitle from '../../components/Common/PageTitle.jsx'; // Перевірте шлях!
import { AuthContext } from '../../contexts/AuthContext.jsx'; // Перевірте шлях!

// Іконки для швидких посилань (приклади)
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';

const QuickLinkItem = ({ to, icon, title, description }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Paper 
        elevation={2} 
        sx={{ 
            p: 2.5, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            height: '100%', // Для однакової висоти
            '&:hover': { boxShadow: 4 },
            textDecoration: 'none', 
            color: 'inherit'
        }}
        component={RouterLink}
        to={to}
    >
      <Box sx={{ color: 'primary.main', mb: 1.5 }}>{React.cloneElement(icon, { sx: { fontSize: 40 } })}</Box>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </Paper>
  </Grid>
);

const AdminDashboardPage = () => {
  const auth = useContext(AuthContext);
  const user = auth ? auth.user : null;

  return (
    <Box>
      <PageTitle title={`Вітаємо, ${user?.first_name || 'Адміністратор'}!`} subtitle="Головна панель управління центром." />
      
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Швидкий доступ
      </Typography>
      <Grid container spacing={3}>
        <QuickLinkItem
          to="/admin/appointments"
          icon={<EventNoteIcon />}
          title="Записи на прийом"
          description="Перегляд та управління записами клієнтів."
        />
        <QuickLinkItem
          to="/admin/services"
          icon={<MedicalServicesIcon />}
          title="Послуги"
          description="Керування списком послуг та їх категоріями."
        />
        <QuickLinkItem
          to="/admin/specialists"
          icon={<PeopleIcon />}
          title="Спеціалісти"
          description="Управління профілями спеціалістів центру."
        />
        <QuickLinkItem
          to="/admin/posts"
          icon={<ArticleIcon />}
          title="Пости блогу"
          description="Створення та редагування статей для блогу."
        />
        {/* Додайте інші швидкі посилання за потреби */}
      </Grid>

      {/* Тут можна додати блок зі статистикою, якщо вона буде */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Статистика (приклад)
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{p:2, textAlign:'center'}}>
                <Typography variant="h6" color="primary">125</Typography>
                <Typography variant="body2" color="text.secondary">Записів цього місяця</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{p:2, textAlign:'center'}}>
                <Typography variant="h6" color="secondary">15</Typography>
                <Typography variant="body2" color="text.secondary">Нових клієнтів</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{p:2, textAlign:'center'}}>
                <Typography variant="h6" sx={{color: 'success.main'}}>5</Typography>
                <Typography variant="body2" color="text.secondary">Нових відгуків</Typography>
            </Paper>
        </Grid>
         <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{p:2, textAlign:'center'}}>
                <Typography variant="h6" sx={{color: 'warning.main'}}>2</Typography>
                <Typography variant="body2" color="text.secondary">Повідомлення очікують</Typography>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;