// src/pages/admin/AdminPostCategoriesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, Dialog,CircularProgress, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Paper, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import PageTitle from '../../components/Common/PageTitle.jsx'; // Перевірте шлях!
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx'; // Перевірте шлях!
import AlertMessage from '../../components/Common/AlertMessage.jsx'; // Перевірте шлях!

import { getAllPostCategories, createPostCategory, updatePostCategory, deletePostCategory } from '../../api/dataApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx'; // Перевірте шлях!

const renderCellExpand = (params) => (
  <Tooltip title={params.value || ''} placement="bottom-start">
    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {params.value}
    </Box>
  </Tooltip>
);

const AdminPostCategoriesPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' }); // Тільки 'name' для категорій постів

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPostCategories();
      setCategories(data || []);
    } catch (err) {
      const errMsg = err.message || 'Не вдалося завантажити категорії постів.';
      setError(errMsg);
      console.error("Fetch post categories error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenFormDialog = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({ name: category.name || '' });
    } else {
      setFormData({ name: '' });
    }
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingCategory(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      showNotification('Назва категорії є обов\'язковою.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (editingCategory) {
        await updatePostCategory(editingCategory.id, formData);
        showNotification('Категорію постів успішно оновлено!', 'success');
      } else {
        await createPostCategory(formData);
        showNotification('Категорію постів успішно створено!', 'success');
      }
      handleCloseFormDialog();
      fetchCategories();
    } catch (err) {
      const errMsg = err.message || `Помилка ${editingCategory ? 'оновлення' : 'створення'} категорії постів.`;
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setLoading(true);
    try {
      await deletePostCategory(categoryToDelete.id);
      showNotification(`Категорію постів "${categoryToDelete.name}" успішно видалено.`, 'success');
      fetchCategories();
    } catch (err) {
      const errMsg = err.message || 'Не вдалося видалити категорію. Можливо, вона містить пости.';
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
      setOpenConfirmDialog(false);
      setCategoryToDelete(null);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Назва категорії', width: 300, renderCell: renderCellExpand },
    { field: 'slug', headerName: 'Slug (URL)', flex: 1, minWidth: 250, renderCell: renderCellExpand },
    {
      field: 'actions',
      headerName: 'Дії',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Редагувати">
            <IconButton onClick={() => handleOpenFormDialog(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Видалити">
            <IconButton onClick={() => handleOpenDeleteDialog(params.row)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageTitle
        title="Категорії Постів Блогу"
        actions={
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => handleOpenFormDialog()}
          >
            Додати Категорію
          </Button>
        }
      />
      {error && !loading && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}

      <Paper sx={{ height: '70vh', width: '100%', mt: 2 }}>
        <DataGrid
          rows={categories}
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

      <Dialog open={openFormDialog} onClose={handleCloseFormDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Редагувати Категорію Постів' : 'Створити Нову Категорію Постів'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleFormSubmit} id="post-category-form" sx={{mt:1}}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Назва категорії"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
            {/* Поле для опису видалено, оскільки його немає в БД для post_categories */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Скасувати</Button>
          <Button type="submit" form="post-category-form" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24}/> : (editingCategory ? 'Зберегти зміни' : 'Створити')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Видалити категорію постів?"
        message={`Ви впевнені, що хочете видалити категорію постів "${categoryToDelete?.name}"? Це може бути неможливо, якщо вона містить пости.`}
        confirmText="Так, видалити"
        isSubmitting={loading}
      />
    </Box>
  );
};

export default AdminPostCategoriesPage;