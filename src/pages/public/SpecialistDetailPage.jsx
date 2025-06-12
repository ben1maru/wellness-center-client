// src/pages/public/SpecialistDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Button, Paper, Grid, Avatar, Chip, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { getSpecialistById } from '../../api/dataApi.js';
import DOMPurify from 'dompurify'; // Для безпечного рендерингу HTML

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkIcon from '@mui/icons-material/Work'; // Для спеціалізації
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'; // Для послуг
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { Link } from '@mui/material';
const SpecialistDetailPage = () => {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSpecialistDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getSpecialistById(id);
      setSpecialist(data);
    } catch (err) {
      setError(err.message || `Спеціаліста з ID ${id} не знайдено або виникла помилка.`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSpecialistDetails();
  }, [fetchSpecialistDetails]);

  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent || '') };
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}><CircularProgress size={60} /></Box>;
  }
  if (error) {
    return <Container sx={{py:3}}><AlertMessage severity="error" title="Помилка завантаження" message={error} /></Container>;
  }
  if (!specialist) {
    return <Container sx={{py:3}}><Typography>Спеціаліста не знайдено.</Typography></Container>;
  }

  const fullName = `${specialist.first_name || ''} ${specialist.last_name || ''}`.trim();

  return (
    <Container maxWidth="lg" sx={{ py: {xs:2, md:4} }}>
      <Paper elevation={0} sx={{ p: {xs: 2, md: 3} }}>
        <Grid container spacing={{xs:2, md:4}}>
          <Grid item xs={12} md={4} sx={{textAlign: {xs:'center', md:'left'}}}>
            <Avatar
              alt={fullName}
              src={specialist.photo_url || undefined}
              sx={{ width: {xs:150, md:200}, height: {xs:150, md:200}, mb: 2, mx: {xs:'auto', md:0}, border: '4px solid', borderColor: 'primary.light', fontSize: {xs: '4rem', md:'5rem'} }}
            >
              {!specialist.photo_url && fullName ? fullName.charAt(0).toUpperCase() : <AccountCircleIcon sx={{fontSize:'inherit'}} />}
            </Avatar>
            <Typography variant="h4" component="h1" sx={{fontWeight: 'bold'}}>{fullName}</Typography>
            {specialist.specialization && (
              <Chip 
                icon={<WorkIcon />} 
                label={specialist.specialization} 
                color="secondary" 
                sx={{ mt: 1, mb: 2 }} 
              />
            )}
             <Button 
                component={RouterLink} 
                to={`/booking?specialist=${specialist.id}`} 
                variant="contained" 
                color="primary" 
                size="large"
                fullWidth
                sx={{mt:1}}
            >
              Записатися до спеціаліста
            </Button>
            {(specialist.contact_email || specialist.contact_phone) && (
                <Box sx={{mt:3, pt:2, borderTop:1, borderColor:'divider'}}>
                    <Typography variant="h6" gutterBottom sx={{fontWeight:'medium'}}>Контакти:</Typography>
                    {specialist.contact_email && (
                        <Box sx={{display:'flex', alignItems:'center', mb:0.5}}>
                            <EmailIcon fontSize="small" sx={{mr:1, color:'text.secondary'}}/>
                            <Link href={`mailto:${specialist.contact_email}`} color="inherit">{specialist.contact_email}</Link>
                        </Box>
                    )}
                    {specialist.contact_phone && (
                        <Box sx={{display:'flex', alignItems:'center'}}>
                            <PhoneIcon fontSize="small" sx={{mr:1, color:'text.secondary'}}/>
                            <Link href={`tel:${specialist.contact_phone}`} color="inherit">{specialist.contact_phone}</Link>
                        </Box>
                    )}
                </Box>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            {specialist.bio_short && (
              <Typography variant="h6" paragraph color="text.secondary" sx={{fontStyle: 'italic'}}>
                {specialist.bio_short}
              </Typography>
            )}
            {specialist.bio_full && (
              <Box sx={{ my: 2}}>
                <Typography variant="h5" gutterBottom sx={{fontWeight:'medium'}}>Про мене</Typography>
                <Box className="ck-content" dangerouslySetInnerHTML={createMarkup(specialist.bio_full)} sx={{
                    '& p': { mb: 1.5, lineHeight: 1.7 },
                    '& ul, & ol': { pl: 3, mb: 1.5 },
                    '& li': { mb: 0.5 },
                }}/>
              </Box>
            )}

            {specialist.services_provided && specialist.services_provided.length > 0 && (
              <Box sx={{ mt: 3, pt:2, borderTop:1, borderColor:'divider' }}>
                <Typography variant="h5" gutterBottom sx={{fontWeight:'medium'}}>Послуги, які надає спеціаліст</Typography>
                <List dense>
                  {specialist.services_provided.map(service => (
                    <ListItem key={service.id} disablePadding component={RouterLink} to={`/services/${service.slug}`} sx={{color: 'text.primary', '&:hover': {bgcolor: 'action.hover'}}}>
                      <ListItemIcon sx={{minWidth: 36}}><MedicalServicesIcon color="primary" fontSize="small"/></ListItemIcon>
                      <ListItemText 
                        primary={service.name} 
                        secondary={`${service.duration_minutes} хв / ${parseFloat(service.price).toFixed(2)} грн`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SpecialistDetailPage;