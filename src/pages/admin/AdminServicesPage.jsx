// src/pages/admin/AdminServicesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Checkbox, FormControlLabel, IconButton, Tooltip, Paper, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import PageTitle from '../../components/Common/PageTitle.jsx';
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';

import { getServices, createService, updateService, deleteService as apiDeleteService, getAllServiceCategories } from '../../api/dataApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

const renderCellExpand = (params) => (
  <Tooltip title={params.value || ''} placement="bottom-start">
    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {params.value}
    </Box>
  </Tooltip>
);

const AdminServicesPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description_short: '',
    description_full: '',
    price: '',
    duration_minutes: '',
    image_url: '',
    is_active: true,
  });

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceToDeactivate, setServiceToDeactivate] = useState(null);

  const fetchServicesAndCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices({ include_inactive: true }), // Припускаємо, API може повертати неактивні
        getAllServiceCategories()
      ]);
      setServices(servicesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      const errMsg = err.message || 'Не вдалося завантажити дані.';
      setError(errMsg);
      showNotification(errMsg, 'error');
      console.error("Fetch services/categories error:", err);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchServicesAndCategories();
  }, [fetchServicesAndCategories]);

  const handleOpenFormDialog = (service = null) => {
    setEditingService(service);
    if (service) {
      setFormData({
        name: service.name || '',
        category_id: service.category_id || '',
        description_short: service.description_short || '',
        description_full: service.description_full || '',
        price: service.price || '',
        duration_minutes: service.duration_minutes || '',
        image_url: service.image_url || '',
        is_active: service.is_active !== undefined ? service.is_active : true,
      });
    } else {
      setFormData({
        name: '', category_id: '', description_short: '', description_full: '',
        price: '', duration_minutes: '', image_url: '', is_active: true,
      });
    }
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingService(null);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.category_id || !formData.price || !formData.duration_minutes) {
      showNotification('Заповніть обов\'язкові поля: Назва, Категорія, Ціна, Тривалість.', 'error');
      return;
    }
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes, 10),
      };

      if (editingService) {
        await updateService(editingService.id, dataToSubmit);
        showNotification('Послугу успішно оновлено!', 'success');
      } else {
        await createService(dataToSubmit);
        showNotification('Послугу успішно створено!', 'success');
      }
      handleCloseFormDialog();
      fetchServicesAndCategories();
    } catch (err) {
      const errMsg = err.message || `Помилка ${editingService ? 'оновлення' : 'створення'} послуги.`;
      showNotification(errMsg, 'error');
      console.error("Service form submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeactivateDialog = (service) => {
    setServiceToDeactivate(service);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!serviceToDeactivate) return;
    setLoading(true);
    try {
      await apiDeleteService(serviceToDeactivate.id);
      showNotification(`Послугу "${serviceToDeactivate.name}" успішно ${serviceToDeactivate.is_active ? 'деактивовано' : 'активовано'}.`, 'success');
      fetchServicesAndCategories();
    } catch (err) {
      const errMsg = err.message || `Помилка ${serviceToDeactivate.is_active ? 'деактивації' : 'активації'} послуги.`;
      showNotification(errMsg, 'error');
      console.error("Deactivate service error:", err);
    } finally {
      setLoading(false);
      setOpenConfirmDialog(false);
      setServiceToDeactivate(null);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Назва послуги', width: 250, renderCell: renderCellExpand },
    {
      field: 'category_id', // ВИПРАВЛЕНО: поле має відповідати ID категорії з даних послуги
      headerName: 'Категорія',
      width: 180,
      valueGetter: (params) => {
        const categoryId = params.value; // params.value тут буде значенням params.row.category_id
        if (categoryId === undefined || categoryId === null) {
          return 'N/A (без категорії)';
        }
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'N/A (не знайдено)';
      },
      renderCell: renderCellExpand
    },
    { field: 'price', headerName: 'Ціна (грн)', width: 100, type: 'number' },
    { field: 'duration_minutes', headerName: 'Трив. (хв)', width: 100, type: 'number' },
    {
      field: 'is_active',
      headerName: 'Активна',
      width: 100,
      renderCell: (params) => (
        params.value ? <VisibilityIcon color="success" /> : <VisibilityOffIcon color="action" />
      ),
    },
    { field: 'description_short', headerName: 'Короткий опис', width: 300, renderCell: renderCellExpand },
    {
      field: 'actions',
      headerName: 'Дії',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Редагувати">
            <IconButton onClick={() => handleOpenFormDialog(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.is_active ? "Деактивувати" : "Активувати"}>
            <IconButton onClick={() => handleOpenDeactivateDialog(params.row)} size="small" color={params.row.is_active ? "warning" : "success"}>
              {params.row.is_active ? <DeleteIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageTitle
        title="Управління Послугами"
        actions={
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => handleOpenFormDialog()}
          >
            Додати Послугу
          </Button>
        }
      />

      {error && !loading && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}

      <Paper sx={{ height: '70vh', width: '100%', mt: 2 }}>
        <DataGrid
          rows={services}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          checkboxSelection={false}
          disableSelectionOnClick
          getRowId={(row) => row.id}
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
            }
          }}
        />
      </Paper>

      <Dialog open={openFormDialog} onClose={handleCloseFormDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingService ? 'Редагувати Послугу' : 'Створити Нову Послугу'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleFormSubmit} id="service-form" sx={{mt:1}}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="name" label="Назва послуги" value={formData.name} onChange={handleFormChange} fullWidth required margin="dense"/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="category_id" label="Категорія" value={formData.category_id} onChange={handleFormChange} select fullWidth required margin="dense">
                  <MenuItem value=""><em>-- Оберіть категорію --</em></MenuItem>
                  {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="price" label="Ціна (грн)" type="number" value={formData.price} onChange={handleFormChange} fullWidth required margin="dense" InputProps={{ inputProps: { min: 0, step: "0.01" } }}/>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="duration_minutes" label="Тривалість (хвилини)" type="number" value={formData.duration_minutes} onChange={handleFormChange} fullWidth required margin="dense" InputProps={{ inputProps: { min: 1 } }}/>
              </Grid>
              <Grid item xs={12}>
                <TextField name="description_short" label="Короткий опис" value={formData.description_short} onChange={handleFormChange} fullWidth multiline rows={2} margin="dense"/>
              </Grid>
              <Grid item xs={12}>
                <TextField name="description_full" label="Повний опис" value={formData.description_full} onChange={handleFormChange} fullWidth multiline rows={4} margin="dense"/>
              </Grid>
              <Grid item xs={12}>
                <TextField name="image_url" label="URL зображення (необов'язково)" value={formData.image_url} onChange={handleFormChange} fullWidth margin="dense"/>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox name="is_active" checked={formData.is_active} onChange={handleFormChange} />}
                  label="Послуга активна"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Скасувати</Button>
          <Button type="submit" form="service-form" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (editingService ? 'Зберегти зміни' : 'Створити послугу')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmDeactivate}
        title={`${serviceToDeactivate?.is_active ? 'Деактивувати' : 'Активувати'} послугу?`}
        message={`Ви впевнені, що хочете ${serviceToDeactivate?.is_active ? 'деактивувати' : 'активувати'} послугу "${serviceToDeactivate?.name}"?`}
        confirmText={`Так, ${serviceToDeactivate?.is_active ? 'деактивувати' : 'активувати'}`}
        isSubmitting={loading}
      />
    </Box>
  );
};

export default AdminServicesPage;