// src/pages/admin/AdminPostsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, Dialog,CircularProgress,Chip, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Paper, Typography, Grid, Switch, FormControlLabel } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import VisibilityIcon from '@mui/icons-material/Visibility'; // Не використовується в цьому файлі
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'; // Не використовується в цьому файлі

// CKEditor
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import PageTitle from '../../components/Common/PageTitle.jsx';
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';

import { getPublishedPosts, createPost, updatePost, deletePost, getAllPostCategories } from '../../api/dataApi.js';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';

// Робота з датами
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { uk } from 'date-fns/locale';

const renderCellExpand = (params) => (
  <Tooltip title={params?.value || ''} placement="bottom-start"> {/* Додано перевірку на params */}
    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {params?.value} {/* Додано перевірку на params */}
    </Box>
  </Tooltip>
);

const AdminPostsPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    content_short: '',
    content_full: '',
    image_url: '',
    status: 'draft',
  });

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchPostsAndCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const postsData = await getPublishedPosts({ limit: 1000, admin_view: true });
      const categoriesData = await getAllPostCategories();
      setPosts(postsData.posts || postsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      const errMsg = err.message || 'Не вдалося завантажити дані постів або категорій.';
      setError(errMsg);
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchPostsAndCategories();
  }, [fetchPostsAndCategories]);

  const handleOpenFormDialog = (post = null) => {
    setEditingPost(post);
    if (post) {
      setFormData({
        title: post.title || '',
        category_id: post.category_id || '',
        content_short: post.content_short || '',
        content_full: post.content_full || '',
        image_url: post.image_url || '',
        status: post.status || 'draft',
      });
    } else {
      setFormData({
        title: '', category_id: '', content_short: '', content_full: '',
        image_url: '', status: 'draft',
      });
    }
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingPost(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData(prev => ({ ...prev, content_full: data }));
  };

  const handleStatusChangeSwitch = (event) => {
    setFormData(prev => ({ ...prev, status: event.target.checked ? 'published' : 'draft' }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.content_full.trim()) {
      showNotification('Заголовок та повний зміст є обов\'язковими.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (editingPost) {
        await updatePost(editingPost.id, formData);
        showNotification('Пост успішно оновлено!', 'success');
      } else {
        await createPost(formData);
        showNotification('Пост успішно створено!', 'success');
      }
      handleCloseFormDialog();
      fetchPostsAndCategories();
    } catch (err) {
      const errMsg = err.message || `Помилка ${editingPost ? 'оновлення' : 'створення'} поста.`;
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (post) => {
    setPostToDelete(post);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setLoading(true);
    try {
      await deletePost(postToDelete.id);
      showNotification(`Пост "${postToDelete.title}" успішно видалено.`, 'success');
      fetchPostsAndCategories();
    } catch (err) {
      showNotification(err.message || 'Не вдалося видалити пост.', 'error');
    } finally {
      setLoading(false);
      setOpenConfirmDialog(false);
      setPostToDelete(null);
    }
  };

  const getCategoryName = (categoryId) => {
    if (categoryId === undefined || categoryId === null) {
      return 'Без категорії';
    }
    return categories.find(c => c.id === categoryId)?.name || 'Без категорії';
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Заголовок', width: 300, renderCell: renderCellExpand },
    {
      field: 'category_id',
      headerName: 'Категорія',
      width: 180,
      valueGetter: (params) => {
        if (params && params.value !== undefined && params.value !== null) { // params.value тут буде category_id
          return getCategoryName(params.value);
        }
        return 'Без категорії';
      },
      renderCell: renderCellExpand
    },
    {
      field: 'status',
      headerName: 'Статус',
      width: 120,
      renderCell: (params) => {
        if (!params || params.value === undefined) return null;
        return (
            <Chip
                label={params.value === 'published' ? 'Опубліковано' : (params.value === 'draft' ? 'Чернетка' : 'Архівовано')}
                color={params.value === 'published' ? 'success' : (params.value === 'draft' ? 'warning' : 'default')}
                size="small"
            />
        );
      }
    },
    {
      field: 'published_at',
      headerName: 'Опубліковано',
      width: 160,
      renderCell: (params) => {
        if (params && params.value && isValidDate(parseISO(params.value))) {
          return format(parseISO(params.value), 'dd.MM.yyyy HH:mm', {locale: uk});
        }
        return '---';
      }
    },
    {
      field: 'author_full_name',
      headerName: 'Автор',
      width: 180,
      valueGetter: (params) => {
        if (params && params.row) {
          return `${params.row.author_first_name || ''} ${params.row.author_last_name || ''}`.trim() || 'N/A';
        }
        return 'N/A';
      },
      renderCell: renderCellExpand
    },
    {
      field: 'actions',
      headerName: 'Дії',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        params && params.row && (
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
        )
      ),
    },
  ];

  return (
    <Box>
      <PageTitle
        title="Управління Постами Блогу"
        actions={
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => handleOpenFormDialog()}
          >
            Створити Пост
          </Button>
        }
      />
      {error && !loading && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}

      <Paper sx={{ height: '70vh', width: '100%', mt: 2 }}>
        <DataGrid
          rows={posts}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
           sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
            }
          }}
        />
      </Paper>

      <Dialog open={openFormDialog} onClose={handleCloseFormDialog} maxWidth="lg" fullWidth>
              <DialogTitle>{editingPost ? 'Редагувати Пост' : 'Створити Пост'}</DialogTitle>
  <DialogContent dividers>
  <Grid container spacing={2}>
    {/* Ліва колонка */}
    <Grid item xs={12} md={5}>
      <TextField
        label="Заголовок"
        name="title"
        value={formData.title}
        onChange={handleFormChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Категорія"
        name="category_id"
        value={formData.category_id}
        onChange={handleFormChange}
        fullWidth
        select
        sx={{ mb: 2 }}
      >
        <MenuItem value="">Без категорії</MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="URL зображення"
        name="image_url"
        value={formData.image_url}
        onChange={handleFormChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={formData.status === 'published'}
            onChange={handleStatusChangeSwitch}
          />
        }
        label={formData.status === 'published' ? 'Опубліковано' : 'Чернетка'}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Короткий опис"
        name="content_short"
        value={formData.content_short}
        onChange={handleFormChange}
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />
    </Grid>

    {/* Права колонка */}
<Grid item xs={12} md={7}>
  <Typography variant="subtitle1" gutterBottom>
    Повний вміст
  </Typography>
  <Paper variant="outlined" sx={{ 
    p: 1, 
    minHeight: 450,
    '& .ck-editor': {
      width: '100%',
    },
    '& .ck-editor__main': {
      height: '400px', // Фіксована висота редактора
    },
    '& .ck-content': {
      height: '100%', // Заповнює всю доступну висоту
      minHeight: '400px', // Мінімальна висота
    }
  }}>
    <CKEditor
      editor={ClassicEditor}
      data={formData.content_full}
      onChange={handleEditorChange}
      config={{
        toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'mediaEmbed', 'undo', 'redo'],
        height: '400px' // Додаємо висоту в конфігурацію редактора
      }}
    />
  </Paper>
</Grid>
  </Grid>
</DialogContent>


        <DialogActions>
          <Button onClick={handleCloseFormDialog} color="inherit">
            Скасувати
          </Button>
          <Button onClick={handleFormSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (editingPost ? 'Оновити' : 'Створити')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openConfirmDialog}
        title="Підтвердження видалення"
        content={`Ви впевнені, що хочете видалити пост "${postToDelete?.title}"?`}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </Box>
  );
};

export default AdminPostsPage;
