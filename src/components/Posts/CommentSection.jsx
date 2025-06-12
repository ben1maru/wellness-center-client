// src/components/Posts/CommentSection.jsx
import React, { useState, useContext, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
    Link as MuiLink
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink } from 'react-router-dom';

// Контексти та API
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NotificationContext } from '../../contexts/NotificationContext.jsx';
import { addCommentToPost, deletePostComment } from '../../api/dataApi.js'; // ВИПРАВЛЕНО

// Робота з датами
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { uk } from 'date-fns/locale';

// Загальні компоненти
import ConfirmDialog from '../../components/Common/ConfirmDialog.jsx'; // Шлях має бути ../../components/Common/ConfirmDialog.jsx

// Внутрішній компонент для відображення одного коментаря
const CommentItem = ({ comment, postId, onReplyClick, onDeleteClick, userRole, currentUserId }) => {
  const [showReplyFormTrigger, setShowReplyFormTrigger] = useState(false);

  const authorName = comment.author_first_name
    ? `${comment.author_first_name} ${comment.author_last_name || ''}`.trim()
    : (comment.author_name || 'Анонім');

  const commentDate = comment.created_at ? parseISO(comment.created_at) : null;
  const displayCommentDate = () => {
    if (!commentDate || !isValidDate(commentDate)) return '';
    try { return format(commentDate, 'dd MMMM yyyy, HH:mm', { locale: uk }); }
    catch { return ''; }
  };

  const canDelete = userRole === 'admin' || (comment.user_id && comment.user_id === currentUserId);

  const handleReplyToggle = () => {
    const newShowState = !showReplyFormTrigger;
    setShowReplyFormTrigger(newShowState);
    if (onReplyClick) {
        onReplyClick(newShowState ? comment.id : null, newShowState ? `@${authorName} ` : '');
    }
  };

  return (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            mb: comment.parent_comment_id ? 1.5 : 2,
            backgroundColor: comment.parent_comment_id ? 'action.hover' : 'transparent',
            borderRadius: 1
        }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar sx={{ mr: 2, bgcolor: 'secondary.light', width: 32, height: 32, fontSize: '0.875rem' }}>
          {authorName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
            <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
                {authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: {xs: 0, sm: 1}, mt: {xs: 0.5, sm: 0} }}>
                {displayCommentDate()}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {comment.comment_text}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button size="small" startIcon={<ReplyIcon />} onClick={handleReplyToggle} sx={{textTransform: 'none'}}>
              {showReplyFormTrigger ? 'Скасувати' : 'Відповісти'}
            </Button>
            {canDelete && onDeleteClick && (
                 <Tooltip title="Видалити коментар">
                    <IconButton size="small" onClick={() => onDeleteClick(comment.id)} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                 </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ pl: {xs: 3, sm: 6}, mt: 1.5, borderLeft: 1, borderColor: 'divider' }}>
          {comment.replies.map((reply) => (
            <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                onReplyClick={onReplyClick}
                onDeleteClick={onDeleteClick}
                userRole={userRole}
                currentUserId={currentUserId}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

// Компонент форми для додавання коментаря
const AddCommentForm = ({ postId, parentCommentId, initialText = '', onCommentAdded, onCancelReply }) => {
  const authContext = useContext(AuthContext);
  const notificationContext = useContext(NotificationContext);

  const isAuthenticated = authContext ? authContext.isAuthenticated : false;
  const user = authContext ? authContext.user : null;
  const showNotification = notificationContext ? notificationContext.showNotification : () => {};


  const [commentText, setCommentText] = useState('');
  const [authorNameLocal, setAuthorNameLocal] = useState('');
  const [authorEmailLocal, setAuthorEmailLocal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (parentCommentId && initialText) {
        setCommentText(initialText);
    } else {
        setCommentText('');
    }
  }, [parentCommentId, initialText]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setError('Коментар не може бути порожнім.');
      return;
    }
    if (!isAuthenticated && (!authorNameLocal.trim() || !authorEmailLocal.trim())) {
      setError("Для незареєстрованих користувачів ім'я та email є обов'язковими.");
      return;
    }
    if (!isAuthenticated && authorEmailLocal.trim() && !/\S+@\S+\.\S+/.test(authorEmailLocal)) {
        setError('Некоректний формат електронної пошти.');
        return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const commentData = {
        comment_text: commentText,
        parent_comment_id: parentCommentId || null,
      };
      if (!isAuthenticated) {
        commentData.author_name = authorNameLocal;
        commentData.author_email = authorEmailLocal;
      }

      const newComment = await addCommentToPost(postId, commentData); // ВИПРАВЛЕНО (або вже було так)
      showNotification('Коментар успішно додано!', 'success');
      if (onCommentAdded) onCommentAdded(newComment);

      setCommentText('');
      setAuthorNameLocal('');
      setAuthorEmailLocal('');
      if (parentCommentId && onCancelReply) {
        onCancelReply();
      }
    } catch (err) {
      const errMsg = err.message || 'Не вдалося додати коментар.';
      setError(errMsg);
      showNotification(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: parentCommentId ? 1 : 3, mb: 2 }}>
      {!parentCommentId && (
        <Typography variant="h6" gutterBottom>
            {isAuthenticated && user ? `Залишити коментар як ${user.first_name}` : 'Залишити коментар'}
        </Typography>
      )}
      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>{error}</Alert>}

      {!isAuthenticated && (
        <Grid container spacing={1} sx={{mb:1}}>
          <Grid item xs={12} sm={6}>
            <TextField
                label="Ваше ім'я *"
                value={authorNameLocal}
                onChange={(e) => setAuthorNameLocal(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
                required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
                label="Ваш Email *"
                type="email"
                value={authorEmailLocal}
                onChange={(e) => setAuthorEmailLocal(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
                required
            />
          </Grid>
        </Grid>
      )}
      <TextField
        label={parentCommentId ? `Ваша відповідь...` : "Ваш коментар..."}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        fullWidth
        multiline
        rows={parentCommentId ? 2 : 3}
        margin="dense"
        required
        variant="outlined"
        placeholder={parentCommentId && initialText ? '' : (isAuthenticated ? "Напишіть щось..." : "Напишіть ваш коментар тут...")}
      />
      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mt:1}}>
        {parentCommentId && onCancelReply && (
            <Button onClick={onCancelReply} variant="text" size="small" disabled={isSubmitting} sx={{textTransform: 'none'}}>
                Скасувати
            </Button>
        )}
        <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={isSubmitting || !commentText.trim() || (!isAuthenticated && (!authorNameLocal.trim() || !authorEmailLocal.trim()))}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
            {isSubmitting ? 'Відправка...' : (parentCommentId ? 'Відповісти' : 'Надіслати')}
        </Button>
      </Box>
    </Box>
  );
};

// Основний компонент секції коментарів
const CommentSection = ({ postId, initialComments = [] }) => {
  const authContext = useContext(AuthContext);
  const notificationContext = useContext(NotificationContext);

  const user = authContext ? authContext.user : null;
  const isAuthenticated = authContext ? authContext.isAuthenticated : false;
  const showNotification = notificationContext ? notificationContext.showNotification : () => {};

  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState({ commentId: null, initialText: '' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);


  const addCommentToHierarchy = (currentComments, newComment) => {
    if (newComment.parent_comment_id === null) {
      return [...currentComments, newComment];
    }
    return currentComments.map(comment => {
      if (comment.id === newComment.parent_comment_id) {
        return { ...comment, replies: [...(comment.replies || []), newComment] };
      }
      if (comment.replies && comment.replies.length > 0) {
        return { ...comment, replies: addCommentToHierarchy(comment.replies, newComment) };
      }
      return comment;
    });
  };

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => addCommentToHierarchy(prevComments, newComment));
    setReplyTo({ commentId: null, initialText: '' });
  };

  const handleReplyClick = (commentId, textForReply) => {
    setReplyTo({ commentId, initialText: textForReply || '' });
  };

  const handleCancelReply = () => {
    setReplyTo({ commentId: null, initialText: '' });
  };

  const openDeleteDialog = (commentId) => {
    setCommentToDeleteId(commentId);
    setDialogOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDeleteId) return;
    setIsDeletingComment(true);
    try {
        await deletePostComment(postId, commentToDeleteId); // ВИПРАВЛЕНО
        showNotification('Коментар успішно видалено.', 'success');
        const removeCommentRecursive = (items, idToRemove) => {
            return items.filter(item => item.id !== idToRemove).map(item => {
                if (item.replies && item.replies.length > 0) {
                    return { ...item, replies: removeCommentRecursive(item.replies, idToRemove) };
                }
                return item;
            });
        };
        setComments(prev => removeCommentRecursive(prev, commentToDeleteId));
    } catch (error) {
        showNotification(error.message || "Не вдалося видалити коментар.", "error");
        console.error("Error deleting comment:", error);
    } finally {
        setIsDeletingComment(false);
        setDialogOpen(false);
        setCommentToDeleteId(null);
    }
  };

  const countTotalComments = (items) => {
    let count = 0;
    items.forEach(item => {
        count++;
        if (item.replies && item.replies.length > 0) {
            count += countTotalComments(item.replies);
        }
    });
    return count;
  };

  return (
    <Box sx={{ mt: 4, py: 2 }}>
      <Typography variant="h5" gutterBottom>
        Коментарі ({countTotalComments(comments)})
      </Typography>
      <Divider sx={{mb: 2}} />

      {replyTo.commentId === null && (
        isAuthenticated ? (
            <AddCommentForm
                postId={postId}
                onCommentAdded={handleCommentAdded}
            />
        ) : (
            <Paper sx={{p:2, textAlign:'center'}}>
                <Typography>Щоб залишити коментар, будь ласка,
                    <MuiLink component={RouterLink} to="/login" sx={{mx:0.5}}>увійдіть</MuiLink>
                    або
                    <MuiLink component={RouterLink} to="/register" sx={{mx:0.5}}>зареєструйтеся</MuiLink>.
                </Typography>
                 <Typography sx={{mt:2, mb:1, fontWeight:'medium'}}>Або залиште коментар як гість:</Typography>
                 <AddCommentForm postId={postId} onCommentAdded={handleCommentAdded} />
            </Paper>
        )
      )}

      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <Box key={comment.id}>
            <CommentItem
                comment={comment}
                postId={postId}
                onReplyClick={handleReplyClick}
                onDeleteClick={user?.role === 'admin' ? openDeleteDialog : undefined}
                userRole={user?.role}
                currentUserId={user?.id}
            />
            {replyTo.commentId === comment.id && (
                <Box sx={{ pl: {xs: 3, sm: 6}, mt: -1, mb:2, borderLeft: 1, borderColor: 'divider' }}>
                     <AddCommentForm
                        postId={postId}
                        parentCommentId={replyTo.commentId}
                        initialText={replyTo.initialText}
                        onCommentAdded={handleCommentAdded}
                        onCancelReply={handleCancelReply}
                    />
                </Box>
            )}
          </Box>
        ))
      ) : (
        !replyTo.commentId && <Typography color="text.secondary" sx={{mt:2}}>Коментарів поки немає.</Typography>
      )}
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDeleteComment}
        title="Підтвердити видалення"
        message="Ви впевнені, що хочете видалити цей коментар та всі відповіді на нього?"
        confirmText="Так, видалити"
        isSubmitting={isDeletingComment}
      />
    </Box>
  );
};

export default CommentSection;