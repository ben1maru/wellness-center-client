// src/pages/specialist/SpecialistProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Grid, Paper, Avatar, List, ListItem, ListItemText, Chip, IconButton } from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { getSpecialistById,getAllSpecialists, updateSpecialistProfile, getSpecialistServices } from '../../api/dataApi.js'; // getSpecialistById - щоб отримати поточний профіль
import { NotificationContext } from '../../contexts/NotificationContext.jsx';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// CKEditor для bio_full, якщо потрібно
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const SpecialistProfilePage = () => {
  const { user, updateUserContext } = useContext(AuthContext); // updateUserContext для оновлення даних в хедері тощо
  const { showNotification } = useContext(NotificationContext);

  const [profileData, setProfileData] = useState({
    first_name: '', // Будуть з user, але форма може їх показувати
    last_name: '',
    specialization: '',
    bio_short: '',
    bio_full: '',
    photo_url: '',
  });
  const [assignedServices, setAssignedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [specialistProfileId, setSpecialistProfileId] = useState(null); // ID з таблиці 'specialists'

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.id) { // user.id - це ID з таблиці users
        setLoading(true);
        setError('');
        try {
          // Потрібно отримати specialist_id, який відповідає user.id
          // Припускаємо, що getMe з authApi повертає specialist_details, якщо користувач - спеціаліст
          // Або потрібен окремий запит для отримання specialist_id за user_id
          // Наприклад, якщо /api/auth/me повертає specialist_details:
          // const specialistDetails = user.specialist_details; 
          // Якщо ні, то потрібно знайти спосіб отримати specialist.id.
          // Для прикладу, припустимо, що ми можемо отримати профіль спеціаліста за user.id або його маємо
          // В AuthContext можемо зберігати specialistId, якщо він є
          
          // Зараз я зроблю припущення, що ми можемо якось отримати specialist.id.
          // В реальному сценарії, це може бути user.specialistProfile?.id або щось подібне.
          // Якщо getSpecialistById приймає user_id як параметр, це було б простіше.
          // Поки що, якщо у user є поле `specialist_id_from_table_specialists`
          
          // Тимчасове рішення: спробуємо знайти спеціаліста за user_id (потрібно додати API)
          // Або, якщо у нас вже є ID спеціаліста з контексту (наприклад, user.specialistProfileId)
          // Зараз я зроблю заглушку, бо у нас немає простого способу отримати specialist.id тільки за user.id без змін API
          
          // Оновлений підхід: припускаємо, що `getMe` в `AuthContext` додає `specialist_details` до об'єкту `user`
          // і там є `id` з таблиці `specialists`.
          if (user.specialist_details && user.specialist_details.id) {
            const specialistId = user.specialist_details.id; // Це id з таблиці specialists
            setSpecialistProfileId(specialistId);
            const data = await getSpecialistById(specialistId); // Запит за ID спеціаліста
            setProfileData({
              first_name: data.first_name || user.first_name || '',
              last_name: data.last_name || user.last_name || '',
              specialization: data.specialization || '',
              bio_short: data.bio_short || '',
              bio_full: data.bio_full || '',
              photo_url: data.photo_url || '',
            });
            const servicesData = await getSpecialistServices(specialistId);
            setAssignedServices(servicesData || []);
          } else if (user.role === 'specialist') {
            // Якщо specialist_details немає, але роль specialist, спробуємо отримати всіх і знайти за user_id
            // Це не оптимально, краще мати прямий зв'язок в AuthContext або API
             const allSpecs = await getAllSpecialists(); // Це api/dataApi
             const myProfile = allSpecs.find(spec => spec.user_id === user.id);
             if (myProfile) {
                setSpecialistProfileId(myProfile.id);
                setProfileData({
                    first_name: myProfile.first_name || '',
                    last_name: myProfile.last_name || '',
                    specialization: myProfile.specialization || '',
                    bio_short: myProfile.bio_short || '',
                    bio_full: myProfile.bio_full || '',
                    photo_url: myProfile.photo_url || '',
                });
                const servicesData = await getSpecialistServices(myProfile.id);
                setAssignedServices(servicesData || []);
             } else {
                setError('Не вдалося знайти ваш профіль спеціаліста.');
             }
          } else {
             setError('Профіль спеціаліста не доступний.');
          }
        } catch (err) {
          setError(err.message || 'Не вдалося завантажити профіль.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]); // Залежність від user

  const handleChange = (event) => {
    setProfileData({ ...profileData, [event.target.name]: event.target.value });
  };

  // const handleEditorChange = (event, editor) => {
  //   const data = editor.getData();
  //   setProfileData(prev => ({ ...prev, bio_full: data }));
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!specialistProfileId) {
        showNotification('Не вдалося визначити ID профілю спеціаліста.', 'error');
        return;
    }
    if (!profileData.first_name.trim() || !profileData.last_name.trim() || !profileData.specialization.trim()) {
      setError("Ім'я, прізвище та спеціалізація є обов'язковими.");
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      // В updateSpecialistProfile передаємо ID з таблиці 'specialists'
      const updatedProfile = await updateSpecialistProfile(specialistProfileId, {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        specialization: profileData.specialization,
        bio_short: profileData.bio_short,
        bio_full: profileData.bio_full,
        photo_url: profileData.photo_url,
      });
      showNotification('Профіль успішно оновлено!', 'success');
      // Оновлюємо дані користувача в AuthContext, щоб зміни відобразилися, наприклад, в хедері
      updateUserContext({ 
        first_name: updatedProfile.first_name, 
        last_name: updatedProfile.last_name,
        // photo_url: updatedProfile.photo_url, // Якщо потрібно
        specialist_details: { // Оновлюємо і деталі спеціаліста
            ...user.specialist_details,
            ...updatedProfile // Припускаємо, що updatedProfile повертає поля з таблиці specialists
        }
      });
    } catch (err) {
      setError(err.message || 'Не вдалося оновити профіль.');
      showNotification(err.message || 'Не вдалося оновити профіль.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (error && !profileData.first_name) { // Показувати помилку, тільки якщо профіль не завантажено взагалі
      return <AlertMessage severity="error" message={error} sx={{m:2}}/>
  }


  return (
    <Box>
      <PageTitle title="Мій Профіль Спеціаліста" subtitle="Редагування вашої публічної інформації" />
      {error && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}
      
      <Grid container spacing={3} sx={{mt:1}}>
        <Grid item xs={12} md={4}>
            <Paper sx={{p:2, textAlign:'center'}}>
                <Avatar
                    alt={`${profileData.first_name} ${profileData.last_name}`}
                    src={profileData.photo_url || undefined}
                    sx={{ width: 150, height: 150, margin: 'auto', mb: 2, fontSize: '4rem' }}
                >
                    {!profileData.photo_url && profileData.first_name ? profileData.first_name.charAt(0).toUpperCase() : <AccountCircleIcon sx={{fontSize: 'inherit'}}/>}
                </Avatar>
                <TextField
                    name="photo_url"
                    label="URL фотографії"
                    value={profileData.photo_url}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    size="small"
                />
                <Typography variant="h5">{profileData.first_name} {profileData.last_name}</Typography>
                <Typography color="text.secondary">{profileData.specialization}</Typography>
            </Paper>
            <Paper sx={{p:2, mt:2}}>
                <Typography variant="h6" gutterBottom>Призначені послуги:</Typography>
                {assignedServices.length > 0 ? (
                    <List dense disablePadding>
                        {assignedServices.map(s => (
                            <ListItem key={s.id} disableGutters>
                                <Chip label={s.name} size="small" variant="outlined" sx={{width:'100%'}}/>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary">Вам ще не призначено послуг. Зверніться до адміністратора.</Typography>
                )}
            </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
            <Paper sx={{ p: {xs: 2, md: 3} }}>
                <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                    <TextField name="first_name" label="Ім'я" value={profileData.first_name} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                    <TextField name="last_name" label="Прізвище" value={profileData.last_name} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                    <TextField name="specialization" label="Спеціалізація" value={profileData.specialization} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                    <TextField name="bio_short" label="Коротке біо (для карточки)" value={profileData.bio_short} onChange={handleChange} fullWidth multiline rows={3} />
                    </Grid>
                    <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{mt:1}}>Повне біо (для детальної сторінки)</Typography>
                    {/* CKEditor можна додати тут для bio_full
                    <CKEditor
                        editor={ClassicEditor}
                        data={profileData.bio_full}
                        onChange={handleEditorChange}
                    />
                    */}
                     <TextField name="bio_full" label="Повне біо" value={profileData.bio_full} onChange={handleChange} fullWidth multiline rows={6} />
                    </Grid>
                    <Grid item xs={12} sx={{mt:1}}>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                        {isSubmitting ? 'Збереження...' : 'Зберегти профіль'}
                    </Button>
                    </Grid>
                </Grid>
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpecialistProfilePage;