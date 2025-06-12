// src/pages/admin/AdminReviewsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, IconButton, Tooltip, Paper, Typography, Chip, Switch, FormControlLabel, Grid, TextField, MenuItem, Rating } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star'; // Для Rating

import PageTitle from '../../components/Common/PageTitle.jsx';
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';

import { getAllReviewsAdmin, updateReviewApproval, deleteReview as apiDeleteReview, getServices } from '../../api/dataApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { uk } from 'date-fns/locale';

const renderCellExpand = (params) => (
  <Tooltip title={params.value || ''} placement="bottom-start">
    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {params.value}
    </Box>
  </Tooltip>
);

const AdminReviewsPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]); // Для фільтрації за послугою
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Фільтри
  const [filterServiceId, setFilterServiceId] = useState('');
  const [filterApprovedStatus, setFilterApprovedStatus] = useState('all'); // 'all', 'pending', 'approved'

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [reviewToAction, setReviewToAction] = useState(null); // Для видалення або зміни статусу
  const [confirmActionType, setConfirmActionType] = useState(''); // 'delete', 'approve', 'reject'

  const fetchReviewsAndServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterServiceId) params.service_id = filterServiceId;
      if (filterApprovedStatus !== 'all') {
        params.approved_status = filterApprovedStatus; // 'pending' (0) or 'approved' (1)
      }
      
      const [reviewsData, servicesData] = await Promise.all([
        getAllReviewsAdmin(params),
        getServices() // Для випадаючого списку фільтра
      ]);
      setReviews(reviewsData.reviews || reviewsData || []); // getAllReviewsAdmin повертає об'єкт з ключем reviews
      setServices(servicesData || []);
    } catch (err) {
      const errMsg = err.message || 'Не вдалося завантажити відгуки.';
      setError(errMsg);
      console.error("Fetch reviews error:", err);
    } finally {
      setLoading(false);
    }
  }, [filterServiceId, filterApprovedStatus]);

  useEffect(() => {
    fetchReviewsAndServices();
  }, [fetchReviewsAndServices]);

  const handleOpenConfirmDialog = (review, actionType) => {
    setReviewToAction(review);
    setConfirmActionType(actionType);
    setOpenConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!reviewToAction || !confirmActionType) return;
    setLoading(true);
    try {
      if (confirmActionType === 'delete') {
        await apiDeleteReview(reviewToAction.id);
        showNotification('Відгук успішно видалено.', 'success');
      } else if (confirmActionType === 'approve') {
        await updateReviewApproval(reviewToAction.id, { is_approved: true });
        showNotification('Відгук схвалено.', 'success');
      } else if (confirmActionType === 'reject') {
        await updateReviewApproval(reviewToAction.id, { is_approved: false });
        showNotification('Відгук відхилено/приховано.', 'success');
      }
      fetchReviewsAndServices(); // Оновити список
    } catch (err) {
      const errMsg = err.message || `Помилка виконання дії: ${confirmActionType}.`;
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
      setOpenConfirmDialog(false);
      setReviewToAction(null);
      setConfirmActionType('');
    }
  };
  
  const getServiceName = (serviceId) => {
    return services.find(s => s.id === serviceId)?.name || 'N/A';
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'user_full_name', 
      headerName: 'Автор', 
      width: 180, 
      valueGetter: (params) => `${params.row.user_first_name || ''} ${params.row.user_last_name || ''}`.trim() || 'Анонім',
      renderCell: renderCellExpand 
    },
    { 
      field: 'service_id_val', // Назва поля з бекенду
      headerName: 'Послуга', 
      width: 200, 
      valueGetter: (params) => getServiceName(params.value),
      renderCell: renderCellExpand 
    },
    { 
      field: 'rating', 
      headerName: 'Рейтинг', 
      width: 120,
      renderCell: (params) => <Rating value={params.value} readOnly size="small" emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}/>
    },
    { field: 'comment', headerName: 'Коментар', flex: 1, minWidth: 250, renderCell: renderCellExpand },
    {
      field: 'is_approved',
      headerName: 'Статус',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Схвалено' : 'Очікує'}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    { 
      field: 'created_at', 
      headerName: 'Дата', 
      width: 160,
      renderCell: (params) => params.value ? format(parseISO(params.value), 'dd.MM.yyyy HH:mm', {locale: uk}) : '---'
    },
    {
      field: 'actions',
      headerName: 'Дії',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          {!params.row.is_approved && (
            <Tooltip title="Схвалити">
              <IconButton onClick={() => handleOpenConfirmDialog(params.row, 'approve')} size="small" color="success">
                <CheckCircleOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
          {params.row.is_approved && (
            <Tooltip title="Відхилити/Приховати">
              <IconButton onClick={() => handleOpenConfirmDialog(params.row, 'reject')} size="small" color="warning">
                <HighlightOffIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Видалити">
            <IconButton onClick={() => handleOpenConfirmDialog(params.row, 'delete')} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageTitle title="Управління Відгуками" />
      {error && !loading && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}
      
      <Paper elevation={1} sx={{ p: 2, mb: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Фільтри відгуків</Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Послуга"
              value={filterServiceId}
              onChange={(e) => setFilterServiceId(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value=""><em>Всі послуги</em></MenuItem>
              {services.map(service => (
                <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Статус схвалення"
              value={filterApprovedStatus}
              onChange={(e) => setFilterApprovedStatus(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="all"><em>Всі статуси</em></MenuItem>
              <MenuItem value="pending">Очікують схвалення</MenuItem>
              <MenuItem value="approved">Схвалені</MenuItem>
            </TextField>
          </Grid>
           {/* Кнопка "Застосувати" не потрібна, якщо useEffect реагує на зміни фільтрів */}
        </Grid>
      </Paper>

      <Paper sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={reviews}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
          getRowId={(row) => row.id}
           sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
            }
          }}
        />
      </Paper>

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmAction}
        title={
            confirmActionType === 'delete' ? "Видалити відгук?" :
            (confirmActionType === 'approve' ? "Схвалити відгук?" : "Відхилити відгук?")
        }
        message={
            confirmActionType === 'delete' ? `Ви впевнені, що хочете видалити цей відгук?` :
            (confirmActionType === 'approve' ? `Ви впевнені, що хочете схвалити цей відгук?` : `Ви впевнені, що хочете відхилити/приховати цей відгук?`)
        }
        confirmText={
            confirmActionType === 'delete' ? "Так, видалити" :
            (confirmActionType === 'approve' ? "Так, схвалити" : "Так, відхилити")
        }
        isSubmitting={loading}
        confirmButtonColor={confirmActionType === 'delete' ? 'error' : (confirmActionType === 'approve' ? 'success' : 'warning')}
      />
    </Box>
  );
};

export default AdminReviewsPage;