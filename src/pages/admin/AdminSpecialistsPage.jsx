// src/pages/admin/AdminSpecialistsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, Dialog, CircularProgress, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Paper, Typography, Grid, Avatar, Checkbox, FormGroup, FormControlLabel } from '@mui/material'; // Autocomplete прибрав, якщо не використовується
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import PageTitle from '../../components/Common/PageTitle.jsx';
// ConfirmDialog тут не потрібен для спеціалістів, якщо немає прямого видалення
// import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx';
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
  <Tooltip title={params?.value || ''} placement="bottom-start"> {/* Додав перевірку на params */}
    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {params?.value} {/* Додав перевірку на params */}
    </Box>
  </Tooltip>
);

const AdminSpecialistsPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [specialists, setSpecialists] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false); // Окремий лоадер для діалогів
  const [error, setError] = useState('');

  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null); // null для створення, об'єкт для редагування
  const [profileFormData, setProfileFormData] = useState({
    // Поля для РЕДАГУВАННЯ (email та пароль не редагуються тут)
    first_name: '',
    last_name: '',
    specialization: '',
    bio_short: '',
    bio_full: '',
    photo_url: '',
    // Поля для СТВОРЕННЯ нового user-specialist
    new_email: '',
    new_password: '',
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
      const errMsg = err.message || 'Не вдалося завантажити дані.';
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
    if (specialist) { // Режим редагування
      setProfileFormData({
        first_name: specialist.first_name || '',
        last_name: specialist.last_name || '',
        specialization: specialist.specialization || '',
        bio_short: specialist.bio_short || '',
        bio_full: specialist.bio_full || '',
        photo_url: specialist.photo_url || '',
        new_email: '', // Не потрібні для редагування
        new_password: '', // Не потрібні для редагування
      });
    } else { // Режим створення нового спеціаліста (тільки основні дані для реєстрації)
      setProfileFormData({
        first_name: '',
        last_name: '',
        new_email: '', // Email для нового user
        new_password: '', // Пароль для нового user
        specialization: '', // Ці поля спеціаліст заповнить сам
        bio_short: '',
        bio_full: '',
        photo_url: '',
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
    setLoadingDialog(true); // Використовуємо окремий лоадер для діалогу
    setError(''); // Скидаємо помилку діалогу
    try {
      if (editingSpecialist) { // --- РЕЖИМ РЕДАГУВАННЯ ---
        if (!profileFormData.first_name || !profileFormData.last_name || !profileFormData.specialization) {
          showNotification("Для редагування: Ім'я, прізвище та спеціалізація є обов'язковими.", 'error');
          setLoadingDialog(false); return;
        }
        const dataToUpdate = {
            first_name: profileFormData.first_name,
            last_name: profileFormData.last_name,
            specialization: profileFormData.specialization,
            bio_short: profileFormData.bio_short,
            bio_full: profileFormData.bio_full,
            photo_url: profileFormData.photo_url,
        };
        await updateSpecialistProfile(editingSpecialist.id, dataToUpdate);
        showNotification('Профіль спеціаліста успішно оновлено!', 'success');
      } else { // --- РЕЖИМ СТВОРЕННЯ ---
        if (!profileFormData.first_name || !profileFormData.last_name || !profileFormData.new_email || !profileFormData.new_password) {
          showNotification("Для створення: Ім'я, прізвище, email та пароль є обов'язковими.", 'error');
          setLoadingDialog(false); return;
        }
        if (profileFormData.new_password.length < 6) {
          showNotification("Пароль має містити щонайменше 6 символів.", 'error');
          setLoadingDialog(false); return;
        }
        const newUserAndSpecialistData = {
            first_name: profileFormData.first_name,
            last_name: profileFormData.last_name,
            email: profileFormData.new_email,
            password: profileFormData.new_password,
            role: 'specialist',
        };
        const registeredUser = await apiRegisterUser(newUserAndSpecialistData);
        showNotification(`Спеціаліста ${registeredUser.first_name} ${registeredUser.last_name} успішно зареєстровано. Він/вона може заповнити деталі профілю самостійно.`, 'success');
      }
      handleCloseProfileDialog();
      fetchSpecialistsAndServices(); // Оновити список спеціалістів
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || `Помилка ${editingSpecialist ? 'оновлення' : 'створення'} профілю.`;
      showNotification(errMsg, 'error');
      setError(errMsg); // Встановлюємо помилку для відображення в діалозі, якщо потрібно
    } finally {
      setLoadingDialog(false);
    }
  };

  // ... (решта коду для handleOpenServicesDialog, handleCloseServicesDialog, handleServiceSelectionChange, handleAssignServicesSubmit залишається такою ж)
  const handleOpenServicesDialog = async (specialist) => { /* ... */ };
  const handleCloseServicesDialog = () => { /* ... */ };
  const handleServiceSelectionChange = (serviceId) => { /* ... */ };
  const handleAssignServicesSubmit = async () => { /* ... */ };


  const columns = [ /* ... (колонки залишаються такими ж) ... */
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'avatar', headerName: 'Фото', width: 80,
      renderCell: (params) => {
        if (!params?.row) return null;
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
      field: 'contact_email', headerName: 'Email', width: 220, renderCell: renderCellExpand,
      valueGetter: (params) => params?.row?.contact_email || 'N/A'
    },
    { field: 'services_provided', headerName: 'Надає послуги', flex:1, minWidth: 250, renderCell: renderCellExpand },
    {
      field: 'actions', headerName: 'Дії', width: 180, sortable: false, filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Редагувати профіль"><IconButton onClick={() => handleOpenProfileDialog(params.row)} size="small"><EditIcon /></IconButton></Tooltip>
          <Tooltip title="Призначити послуги"><IconButton onClick={() => handleOpenServicesDialog(params.row)} size="small"><ManageAccountsIcon /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageTitle
        title="Управління Спеціалістами"
        actions={ <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => handleOpenProfileDialog()}> Додати Спеціаліста </Button> }
      />
      {error && !loading && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}

      <Paper sx={{ height: '70vh', width: '100%', mt: 2 }}>
        <DataGrid
          rows={specialists}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' }}}
        />
      </Paper>

      {/* Діалог для створення/редагування профілю спеціаліста */}
      <Dialog open={openProfileDialog} onClose={handleCloseProfileDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingSpecialist ? `Редагувати Профіль: ${profileFormData.first_name} ${profileFormData.last_name}` : 'Додати Нового Спеціаліста (Реєстрація)'}</DialogTitle>
        <DialogContent>
          {/* Можна додати AlertMessage для помилок всередині діалогу, якщо error зі стану використовується для цього */}
          {/* {error && <AlertMessage severity="error" message={error} sx={{mb:1}} />} */}
          <Box component="form" onSubmit={handleProfileFormSubmit} id="specialist-profile-form" sx={{mt:1}}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField name="first_name" label="Ім'я" value={profileFormData.first_name} onChange={handleProfileFormChange} fullWidth required margin="dense"/></Grid>
              <Grid item xs={12} sm={6}><TextField name="last_name" label="Прізвище" value={profileFormData.last_name} onChange={handleProfileFormChange} fullWidth required margin="dense"/></Grid>
              
              {!editingSpecialist && ( // Поля email та пароль тільки для створення нового
                <>
                    <Grid item xs={12} sm={6}><TextField name="new_email" label="Email для входу" type="email" value={profileFormData.new_email} onChange={handleProfileFormChange} fullWidth required margin="dense"/></Grid>
                    <Grid item xs={12} sm={6}><TextField name="new_password" label="Пароль для входу" type="password" value={profileFormData.new_password} onChange={handleProfileFormChange} fullWidth required margin="dense" helperText="Мінімум 6 символів"/></Grid>
                </>
              )}
              {/* Поля, що редагуються адміном АБО заповнюються спеціалістом пізніше */}
              <Grid item xs={12}>
                <TextField 
                    name="specialization" 
                    label={editingSpecialist ? "Спеціалізація" : "Спеціалізація (необов'язково, заповнить сам)"} 
                    value={profileFormData.specialization} 
                    onChange={handleProfileFormChange} 
                    fullWidth 
                    required={!!editingSpecialist} // Обов'язкове тільки при редагуванні
                    margin="dense"
                />
              </Grid>
              {editingSpecialist && ( // Показуємо розширені поля тільки при редагуванні
                <>
                  <Grid item xs={12}><TextField name="bio_short" label="Коротке біо" value={profileFormData.bio_short} onChange={handleProfileFormChange} fullWidth multiline rows={2} margin="dense"/></Grid>
                  <Grid item xs={12}><TextField name="bio_full" label="Повне біо" value={profileFormData.bio_full} onChange={handleProfileFormChange} fullWidth multiline rows={4} margin="dense"/></Grid>
                  <Grid item xs={12}><TextField name="photo_url" label="URL фотографії" value={profileFormData.photo_url} onChange={handleProfileFormChange} fullWidth margin="dense"/></Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfileDialog} disabled={loadingDialog}>Скасувати</Button>
          <Button type="submit" form="specialist-profile-form" variant="contained" disabled={loadingDialog}>
            {loadingDialog ? <CircularProgress size={24}/> : (editingSpecialist ? 'Зберегти зміни' : 'Зареєструвати спеціаліста')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Діалог для призначення послуг (залишається без змін) */}
      <Dialog open={openServicesDialog} onClose={handleCloseServicesDialog} maxWidth="sm" fullWidth>
        {/* ... код діалогу призначення послуг ... */}
        <DialogTitle>Призначити послуги для {currentSpecialistForServices?.first_name} {currentSpecialistForServices?.last_name}</DialogTitle>
        <DialogContent dividers>
          {loadingDialog && !allServices.length ? <CircularProgress /> : (
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
          <Button onClick={handleCloseServicesDialog} disabled={loadingDialog}>Скасувати</Button>
          <Button onClick={handleAssignServicesSubmit} variant="contained" disabled={loadingDialog || !currentSpecialistForServices}>
            {loadingDialog ? <CircularProgress size={24}/> : 'Зберегти послуги'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSpecialistsPage;