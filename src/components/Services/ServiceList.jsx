// src/components/Services/ServiceList.jsx
import React from 'react';
import { Grid, Typography, Box, Pagination, CircularProgress } from '@mui/material';
import ServiceCard from './ServiceCard.jsx';
import AlertMessage from '../Common/AlertMessage.jsx';

const ServiceList = ({
    services,
    loading,
    error,
    page,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems
}) => {

  const showInitialLoader = loading && (!services || services.length === 0);
  const showNoResults = !loading && (!services || services.length === 0) && !error;
  const showNoResultsDueToZeroTotal = !loading && totalItems === 0 && !error;
  const showError = error && (!services || services.length === 0);

  if (showInitialLoader) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', py: 5 }}>
        <CircularProgress size={50}/>
      </Box>
    );
  }

  if (showError) {
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 3 }}>
            <AlertMessage severity="error" message={error} />
        </Box>
    );
  }

  if (showNoResults || showNoResultsDueToZeroTotal) {
    return (
        <Typography sx={{ my: 5, textAlign: 'center', color: 'text.secondary', width: '100%' }}>
            Послуг за вашим запитом не знайдено.
        </Typography>
    );
  }

  return (
    <Box
        sx={{
            my: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
        }}
    >
      {loading && services && services.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography color="text.secondary" sx={{mr:1}}>Оновлення...</Typography>
            <CircularProgress size={20}/>
          </Box>
      )}
          <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        justifyContent="center"
        sx={{
            width: '100%',
            // maxWidth: 1200,
        }}
      >
        {(services || []).map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id || service.slug} sx={{ display: 'flex' }}>
            <ServiceCard service={service} />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, width: '100%' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => onPageChange(value)}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default ServiceList;