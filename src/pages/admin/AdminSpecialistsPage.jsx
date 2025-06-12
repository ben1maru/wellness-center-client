// src/pages/admin/AdminSpecialistsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, Dialog, CircularProgress, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Paper, Typography, Grid, Avatar, Checkbox, FormGroup, FormControlLabel, List, ListItem, ListItemText, Autocomplete } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Для заглушки аватара в renderCell

import PageTitle from '../../components/Common/PageTitle.jsx';
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import {
    getAllSpecialists,
    updateSpecialistProfile,
    assignServicesToSpecialist,
    getServices,
    getSpecialistServices as apiGetSpecialistServices
} from '../../api/dataApi.js';
import { registerUser as apiRegisterUser } from '../../api/authApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

const renderCellExpand = (params) => (
  <Tooltip title={params.value || ''} placement="bottom-start">
    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {params.value}
    </Box>
  </Tooltip>
);

const AdminSpecialistsPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [specialists, setSpecialists] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    user_id: null,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    specialization: '',
    bio_short: '',
    bio_full: '',
    photo_url: '',
  });

  const [openServicesDialog, setOpenServicesDialog] = useState(false);
  const [currentSpecialistForServices, setCurrentSpecialistForServices] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const fetchSpecialistsAndServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [specialistsData, servicesData] = await Promise.all([
        getAllSpecialists(),
        getServices({is_active: true})
      ]);
      setSpecialists(specialistsData || []);
      setAllServices(servicesData || []);
    } catch (err) {
      const errMsg = err.message || 'Не вдалося завантажити дані спеціалістів або послуг.';
      setError(errMsg);
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchSpecialistsAndServices();
  }, [fetchSpecialistsAndServices]);

  const handleOpenProfileDialog = (specialist = null) => {
    setEditingSpecialist(specialist);
    if (specialist) {
      setProfileFormData({
        user_id: specialist.user_id,
        first_name: specialist.first_name || '',
        last_name: specialist.last_name || '',
        email: specialist.contact_email || '', // Припускаємо, це поле є
        password: '',
        specialization: specialist.specialization || '',
        bio_short: specialist.bio_short || '',
        bio_full: specialist.bio_full || '',
        photo_url: specialist.photo_url || '',
      });
    } else {
      setProfileFormData({
        user_id: null, first_name: '', last_name: '', email: '', password: '',
        specialization: '', bio_short: '', bio_full: '', photo_url: '',
      });
    }
    setOpenProfileDialog(true);
  };

  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
    setEditingSpecialist(null);
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileFormSubmit = async (event) => {
    event.preventDefault();
    if (!profileFormData.first_name || !profileFormData.last_name || !profileFormData.specialization) {
      showNotification("Ім'я, прізвище та спеціалізація є обов'язковими.", 'error');
      return;
    }
    if (!editingSpecialist && (!profileFormData.email || !profileFormData.password)) {
      showNotification("Email та пароль є обов'язковими для нового спеціаліста.", 'error');
      return;
    }
    if (!editingSpecialist && profileFormData.password.length < 6) {
      showNotification("Пароль має містити щонайменше 6 символів.", 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingSpecialist) {
        const dataToUpdate = { ...profileFormData };
        delete dataToUpdate.email;
        delete dataToUpdate.password;
        await updateSpecialistProfile(editingSpecialist.id, dataToUpdate);
        showNotification('Профіль спеціаліста успішно оновлено!', 'success');
      } else {
        const newUserAndSpecialistData = {
            first_name: profileFormData.first_name,
            last_name: profileFormData.last_name,
            email: profileFormData.email,
            password: profileFormData.password,
            role: 'specialist',
        };
        const registeredUser = await apiRegisterUser(newUserAndSpecialistData);
        if (registeredUser && registeredUser.id) {
            showNotification(`Спеціаліста ${registeredUser.first_name} створено. Відредагуйте профіль для додавання деталей.`, 'success');
        } else {
            showNotification('Спеціаліста створено, але профіль потребує оновлення.', 'warning');
        }
      }
      handleCloseProfileDialog();
      fetchSpecialistsAndServices();
    } catch (err) {
      const errMsg = err.message || `Помилка ${editingSpecialist ? 'оновлення' : 'створення'} профілю.`;
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenServicesDialog = async (specialist) => {
    setCurrentSpecialistForServices(specialist);
    setLoading(true); // Можна окремий лоадер для діалогу призначення послуг
    try {
      const assignedServices = await apiGetSpecialistServices(specialist.id);
      setSelectedServiceIds(assignedServices.map(s => s.id));
    } catch (err) {
      showNotification('Не вдалося завантажити поточні послуги спеціаліста.', 'error');
      setSelectedServiceIds([]);
    } finally {
      setLoading(false);
    }
    setOpenServicesDialog(true);
  };

  const handleCloseServicesDialog = () => {
    setOpenServicesDialog(false);
    setCurrentSpecialistForServices(null);
    setSelectedServiceIds([]);
  };

  const handleServiceSelectionChange = (serviceId) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAssignServicesSubmit = async () => {
    if (!currentSpecialistForServices) return;
    setLoading(true);
    try {
      await assignServicesToSpecialist(currentSpecialistForServices.id, { service_ids: selectedServiceIds });
      showNotification(`Послуги для спеціаліста ${currentSpecialistForServices.first_name} оновлено!`, 'success');
      handleCloseServicesDialog();
      fetchSpecialistsAndServices();
    } catch (err) {
      showNotification(err.message || 'Помилка призначення послуг.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'avatar',
      headerName: 'Фото',
      width: 80,
      renderCell: (params) => {
        if (!params || !params.row) return null;
        return (
          <Avatar src={params.row.photo_url} alt={`${params.row.first_name || ''} ${params.row.last_name || ''}`}>
            {(!params.row.photo_url && params.row.first_name) ? params.row.first_name.charAt(0).toUpperCase() : <AccountCircleIcon />}
          </Avatar>
        );
      },
      sortable: false, filterable: false,
    },
    { field: 'first_name', headerName: 'Ім\'я', width: 150, renderCell: renderCellExpand },
    { field: 'last_name', headerName: 'Прізвище', width: 150, renderCell: renderCellExpand },
    { field: 'specialization', headerName: 'Спеціалізація', width: 200, renderCell: renderCellExpand },
    {
      field: 'contact_email', // Це поле має приходити з бекенду (JOIN з users)
      headerName: 'Email',
      width: 220,
      renderCell: renderCellExpand,
      valueGetter: (params) => params?.row?.contact_email || 'N/A' // ВИПРАВЛЕНО
    },
    { field: 'services_provided', headerName: 'Надає послуги', flex:1, minWidth: 250, renderCell: renderCellExpand },
    {
      field: 'actions',
      headerName: 'Дії',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Редагувати профіль">
            <IconButton onClick={() => handleOpenProfileDialog(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Призначити послуги">
            <IconButton onClick={() => handleOpenServicesDialog(params.row)} size="small">
              <ManageAccountsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageTitle
        title="Управління Спеціалістами"
        actions={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => handleOpenProfileDialog()}
          >
            Додати Спеціаліста
          </Button>
        }
      />
      {error && !loading && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}

      <Paper sx={{ height: '70vh', width: '100%', mt: 2 }}>
        <DataGrid
          rows={specialists}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableSelectionOnClick
          getRowId={(row) => row.id}
           sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
            }
          }}
        />
      </Paper>

      <Dialog open={openProfileDialog} onClose={handleCloseProfileDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingSpecialist ? 'Редагувати Профіль Спеціаліста' : 'Створити Нового Спеціаліста'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleProfileFormSubmit} id="specialist-profile-form" sx={{mt:1}}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField name="first_name" label="Ім'я" value={profileFormData.first_name} onChange={handleProfileFormChange} fullWidth required margin="dense"/></Grid>
              <Grid item xs={12} sm={6}><TextField name="last_name" label="Прізвище" value={profileFormData.last_name} onChange={handleProfileFormChange} fullWidth required margin="dense"/></Grid>
              {!editingSpecialist && (
                <>
                    <Grid item xs={12} sm={6}><TextField name="email" label="Email" type="email" value={profileFormData.email} onChange={handleProfileFormChange} fullWidth required margin="dense"/></Grid>
                    <Grid item xs={12} sm={6}><TextField name="password" label="Пароль" type="password" value={profileFormData.password} onChange={handleProfileFormChange} fullWidth required margin="dense" helperText="Мінімум 6 символів"/></Grid>
                </>
              )}
              <Grid item xs={12}><TextField name="specialization" label="Спеціалізація" value={profileFormData.specialization} onChange={handleProfileFormChange} fullWidth required margin="dense"/></Grid>
              <Grid item xs={12}><TextField name="bio_short" label="Коротке біо" value={profileFormData.bio_short} onChange={handleProfileFormChange} fullWidth multiline rows={2} margin="dense"/></Grid>
              <Grid item xs={12}><TextField name="bio_full" label="Повне біо" value={profileFormData.bio_full} onChange={handleProfileFormChange} fullWidth multiline rows={4} margin="dense"/></Grid>
              <Grid item xs={12}><TextField name="photo_url" label="URL фотографії" value={profileFormData.photo_url} onChange={handleProfileFormChange} fullWidth margin="dense"/></Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfileDialog}>Скасувати</Button>
          <Button type="submit" form="specialist-profile-form" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24}/> : (editingSpecialist ? 'Зберегти зміни' : 'Створити спеціаліста')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openServicesDialog} onClose={handleCloseServicesDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Призначити послуги для {currentSpecialistForServices?.first_name} {currentSpecialistForServices?.last_name}</DialogTitle>
        <DialogContent dividers>
          {loading && !allServices.length ? <CircularProgress /> : ( // Можливо, інший лоадер для цього діалогу
            <FormGroup>
                {allServices.length > 0 ? allServices.map(service => (
                    <FormControlLabel
                        key={service.id}
                        control={
                        <Checkbox
                            checked={selectedServiceIds.includes(service.id)}
                            onChange={() => handleServiceSelectionChange(service.id)}
                            name={String(service.id)}
                        />
                        }
                        label={`${service.name} (${service.price} грн)`}
                    />
                )) : <Typography>Немає доступних послуг для призначення.</Typography>}
            </FormGroup>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseServicesDialog}>Скасувати</Button>
          <Button onClick={handleAssignServicesSubmit} variant="contained" disabled={loading || !currentSpecialistForServices}>
            {loading ? <CircularProgress size={24}/> : 'Зберегти послуги'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSpecialistsPage;