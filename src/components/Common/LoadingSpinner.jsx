// src/components/Common/LoadingSpinner.jsx
import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = ({ size = 40, thickness = 3.6, sx, containerSx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%', 
        minHeight: '100px', 
        ...containerSx, // Дозволяє стилізувати контейнер ззовні
      }}
    >
      <CircularProgress size={size} thickness={thickness} sx={sx} /> {/* Дозволяє стилізувати сам спінер */}
    </Box>
  );
};

export default LoadingSpinner;