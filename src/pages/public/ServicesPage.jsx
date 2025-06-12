// src/pages/public/ServicesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageTitle from '../../components/Common/PageTitle.jsx';
import ServiceList from '../../components/Services/ServiceList.jsx';
import ServiceCategoryFilter from '../../components/Services/ServiceCategoryFilter.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { getServices } from '../../api/dataApi.js';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategorySlug = searchParams.get('category');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (currentCategorySlug) {
        params.category_slug = currentCategorySlug;
      }
      const data = await getServices(params);
      setServices(data || []);
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити список послуг.');
    } finally {
      setLoading(false);
    }
  }, [currentCategorySlug]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCategoryChange = (slug) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <PageTitle title="Наші Послуги" subtitle="Ознайомтеся з повним переліком послуг нашого центру" />

      <ServiceCategoryFilter
        currentCategorySlug={currentCategorySlug}
        onCategoryChange={handleCategoryChange}
        variant="chips"
      />

      {error && (
        <AlertMessage
          severity="error"
          message={error}
          sx={{ my: 2 }}
          onClose={() => setError('')}
        />
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <ServiceList
          services={services}
          loading={loading}
          error={error && services.length === 0 ? error : null}
        />
      )}
    </Container>
  );
};

export default ServicesPage;
