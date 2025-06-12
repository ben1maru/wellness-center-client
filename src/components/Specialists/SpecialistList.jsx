// src/components/Specialists/SpecialistList.jsx
import React from 'react';
import { Grid, Typography, Box, CircularProgress, Pagination } from '@mui/material';
import SpecialistCard from './SpecialistCard.jsx';
import AlertMessage from '../Common/AlertMessage.jsx'; // ВИПРАВЛЕНО ШЛЯХ

const SpecialistList = ({
    specialists,
    loading,
    error,
    // Пропси для пагінації, якщо вона буде реалізована для спеціалістів
    // page,
    // totalPages,
    // onPageChange
}) => {

  const showLoader = loading && (!specialists || specialists.length === 0);
  const showNoResults = !loading && (!specialists || specialists.length === 0) && !error;

  if (showLoader) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress size={50}/>
      </Box>
    );
  }

  if (error) {
    if (!specialists || specialists.length === 0) {
      return <AlertMessage severity="error" message={error} sx={{my: 3}} />;
    }
  }

  if (showNoResults) {
    return <Typography sx={{ my: 5, textAlign: 'center', color: 'text.secondary' }}>Інформація про спеціалістів наразі відсутня.</Typography>;
  }

  return (
    <Box sx={{my: 3}}>
      {loading && specialists && specialists.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography color="text.secondary" sx={{mr:1}}>Оновлення...</Typography><CircularProgress size={20}/>
          </Box>
      )}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {(specialists || []).map((specialist) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={specialist.id} sx={{ display: 'flex' }}>
            <SpecialistCard specialist={specialist} />
          </Grid>
        ))}
      </Grid>
      {/*
        Пагінація для спеціалістів зазвичай не потрібна, якщо їх не дуже багато.
        Якщо буде потрібно, розкоментуйте та передайте відповідні пропси.
      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
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
      */}
    </Box>
  );
};

export default SpecialistList;