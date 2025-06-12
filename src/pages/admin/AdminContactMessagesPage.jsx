// src/pages/admin/AdminContactMessagesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Button, CircularProgress, Divider, IconButton, Tooltip, Paper, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, MenuItem, Grid } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import FilterListIcon from '@mui/icons-material/FilterList';

import PageTitle from '../../components/Common/PageTitle.jsx';
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';

import { getAllContactMessages, getContactMessageById, updateContactMessageStatus, deleteContactMessage } from '../../api/dataApi.js';
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

const AdminContactMessagesPage = () => {
  const { showNotification } = useContext(NotificationContext);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1); // Для серверної пагінації
  const [limit] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Фільтри
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState(''); // 'new', 'read', 'replied', 'archived'
  const [filterSearchTerm, setFilterSearchTerm] = useState('');

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [messageToAction, setMessageToAction] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState(''); // 'delete', 'archive', 'mark_read'

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (filterStatus) params.status = filterStatus;
      if (filterSearchTerm.trim()) params.search = filterSearchTerm.trim();

      const data = await getAllContactMessages(params);
      setMessages(data.messages || []);
      setTotalMessages(data.totalMessages || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      const errMsg = err.message || 'Не вдалося завантажити повідомлення.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, filterSearchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleViewMessage = async (messageId) => {
    setLoading(true); // Можна інший лоадер для діалогу
    try {
      const messageData = await getContactMessageById(messageId);
      setSelectedMessage(messageData);
      setOpenViewDialog(true);
      // Якщо повідомлення було 'new', воно автоматично стане 'read' на бекенді,
      // тому оновимо список, щоб відобразити зміну статусу.
      if (messageData.status === 'new' || (messages.find(m => m.id === messageId)?.status === 'new')) {
        fetchMessages();
      }
    } catch (err) {
      showNotification(err.message || 'Не вдалося завантажити повідомлення.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedMessage(null);
  };
  
  const handleOpenConfirmDialog = (message, actionType) => {
    setMessageToAction(message);
    setConfirmActionType(actionType);
    setOpenConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!messageToAction || !confirmActionType) return;
    setLoading(true);
    try {
      if (confirmActionType === 'delete') {
        await deleteContactMessage(messageToAction.id);
        showNotification('Повідомлення успішно видалено.', 'success');
      } else if (confirmActionType === 'archive') {
        await updateContactMessageStatus(messageToAction.id, { status: 'archived' });
        showNotification('Повідомлення архівовано.', 'success');
      } else if (confirmActionType === 'mark_as_replied') { // Приклад, якщо є така дія
        await updateContactMessageStatus(messageToAction.id, { status: 'replied' });
        showNotification('Повідомлення позначено як "Відповіли".', 'success');
      }
       // ... інші дії (unarchive, mark_read - хоча read ставиться автоматично)
      fetchMessages();
    } catch (err) {
      showNotification(err.message || `Помилка виконання дії: ${confirmActionType}.`, 'error');
    } finally {
      setLoading(false);
      setOpenConfirmDialog(false);
      setMessageToAction(null);
      setConfirmActionType('');
    }
  };

  const handlePageChangeForGrid = (newPage) => {
    setPage(newPage + 1); // DataGrid нумерує сторінки з 0, API - з 1
  };
  
  const resetFilters = () => {
    setFilterStatus('');
    setFilterSearchTerm('');
    setPage(1); // Скинути на першу сторінку
  };

  const messageStatuses = [
    { value: 'new', label: 'Нові' },
    { value: 'read', label: 'Прочитані' },
    { value: 'replied', label: 'Відповіли' },
    { value: 'archived', label: 'Архівовані' },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Ім\'я', width: 150, renderCell: renderCellExpand },
    { field: 'email', headerName: 'Email', width: 200, renderCell: renderCellExpand },
    { field: 'subject', headerName: 'Тема', width: 200, renderCell: renderCellExpand },
    { field: 'message_preview', headerName: 'Повідомлення (початок)', flex: 1, minWidth: 250, renderCell: renderCellExpand },
    {
      field: 'status',
      headerName: 'Статус',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={messageStatuses.find(s => s.value === params.value)?.label || params.value}
          color={
            params.value === 'new' ? 'error' :
            params.value === 'read' ? 'info' :
            params.value === 'replied' ? 'success' :
            params.value === 'archived' ? 'default' : 'default'
          }
          size="small"
          sx={{textTransform: 'capitalize'}}
        />
      ),
    },
    { 
      field: 'created_at', 
      headerName: 'Отримано', 
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
          <Tooltip title="Переглянути">
            <IconButton onClick={() => handleViewMessage(params.row.id)} size="small">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {params.row.status !== 'replied' && params.row.status !== 'archived' && (
             <Tooltip title="Позначити як 'Відповіли'">
                <IconButton onClick={() => handleOpenConfirmDialog(params.row, 'mark_as_replied')} size="small" color="success">
                    <MarkEmailReadIcon />
                </IconButton>
            </Tooltip>
          )}
          {params.row.status !== 'archived' ? (
            <Tooltip title="Архівувати">
              <IconButton onClick={() => handleOpenConfirmDialog(params.row, 'archive')} size="small" color="action">
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Розархівувати (повернути в 'Прочитані')"> 
              {/* Потрібна логіка для unarchive, наприклад, встановити статус 'read' */}
              {/* <IconButton onClick={() => handleUnarchive(params.row.id)} size="small"><UnarchiveIcon /></IconButton> */}
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
      <PageTitle 
        title="Контактні Повідомлення"
        actions={
            <Tooltip title={showFilters ? "Сховати фільтри" : "Показати фільтри"}>
                <IconButton onClick={() => setShowFilters(!showFilters)} color={showFilters ? "primary" : "default"}>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        }
      />
      {error && !loading && <AlertMessage severity="error" message={error} onClose={() => setError('')} sx={{mb:2}}/>}
      
      {showFilters && (
            <Paper elevation={1} sx={{p:2, mb:3, mt:2}}>
                <Typography variant="h6" gutterBottom>Фільтри повідомлень</Typography>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Пошук (ім'я, email, тема, текст)"
                            value={filterSearchTerm}
                            onChange={(e) => setFilterSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchMessages()} // Пошук по Enter
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Статус повідомлення"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value=""><em>Всі статуси</em></MenuItem>
                            {messageStatuses.map(status => (
                                <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2}>
                        <Button onClick={fetchMessages} variant="outlined" size="small" fullWidth>Застосувати</Button>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2}>
                        <Button onClick={resetFilters} variant="text" size="small" fullWidth>Скинути</Button>
                    </Grid>
                </Grid>
            </Paper>
        )}

      <Paper sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={messages}
          columns={columns}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          paginationMode="server" // Серверна пагінація
          rowCount={totalMessages}
          page={page - 1} // DataGrid очікує індекс сторінки (0-based)
          pageSize={limit}
          rowsPerPageOptions={[limit]} // Тільки один варіант, бо пагінація серверна
          onPageChange={handlePageChangeForGrid}
          disableSelectionOnClick
          getRowId={(row) => row.id}
           sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
            }
          }}
        />
      </Paper>

      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Перегляд повідомлення #{selectedMessage?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedMessage ? (
            <>
              <Typography variant="subtitle1"><strong>Від:</strong> {selectedMessage.name} ({selectedMessage.email})</Typography>
              {selectedMessage.phone && <Typography variant="body2"><strong>Телефон:</strong> {selectedMessage.phone}</Typography>}
              <Typography variant="subtitle1" sx={{mt:1}}><strong>Тема:</strong> {selectedMessage.subject || 'Без теми'}</Typography>
              <Divider sx={{my:1.5}}/>
              <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>{selectedMessage.message}</Typography>
            </>
          ) : <CircularProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Закрити</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleConfirmAction}
        title={
            confirmActionType === 'delete' ? "Видалити повідомлення?" :
            (confirmActionType === 'archive' ? "Архівувати повідомлення?" : "Підтвердити дію")
        }
        message={
            confirmActionType === 'delete' ? `Ви впевнені, що хочете видалити це повідомлення?` :
            (confirmActionType === 'archive' ? `Ви впевнені, що хочете архівувати це повідомлення?` : `Ви впевнені?`)
        }
        confirmText={
            confirmActionType === 'delete' ? "Так, видалити" :
            (confirmActionType === 'archive' ? "Так, архівувати" : "Так")
        }
        isSubmitting={loading}
        confirmButtonColor={confirmActionType === 'delete' ? 'error' : 'primary'}
      />
    </Box>
  );
};

export default AdminContactMessagesPage;