// src/components/Common/PageTitle.jsx
import React from 'react';
import { Typography, Box, Divider } from '@mui/material';

const PageTitle = ({ title, subtitle, actions, sx, ...props }) => {
  return (
    <Box sx={{ mb: {xs: 2, sm:3}, pt: {xs:1, sm:0}, ...sx }} {...props}> {/* Додав адаптивний відступ зверху і знизу */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: subtitle ? 0.5 : 2, flexWrap: 'wrap', gap: 1 /* Для actions на мобільних */ }}>
        <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom={!subtitle}
            sx={{ fontWeight: 'medium' }} // Зробив заголовок трохи жирнішим
        >
          {title}
        </Typography>
        {actions && <Box sx={{ ml: 'auto' /* Щоб дії були справа, якщо є місце */ }}>{actions}</Box>}
      </Box>
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      <Divider />
    </Box>
  );
};

export default PageTitle;