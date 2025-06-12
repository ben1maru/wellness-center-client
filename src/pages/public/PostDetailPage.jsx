// src/pages/public/PostDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Paper, Chip, Avatar, Grid, Divider } from '@mui/material';
import PageTitle from '../../components/Common/PageTitle.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import CommentSection from '../../components/Posts/CommentSection.jsx';
import { getPostBySlug } from '../../api/dataApi.js';
import DOMPurify from 'dompurify';

import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { uk } from 'date-fns/locale';

const DEFAULT_POST_DETAIL_IMAGE = 'https://via.placeholder.com/1200x500.png?text=Blog+Post';

const PostDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPostDetails = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      const data = await getPostBySlug(slug);
      setPost(data);
    } catch (err) {
      setError(err.message || `Пост "${slug}" не знайдено або виникла помилка.`);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);
  
  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent || '') };
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}><CircularProgress size={60} /></Box>;
  }
  if (error) {
    return <Container sx={{py:3}}><AlertMessage severity="error" title="Помилка завантаження" message={error} /></Container>;
  }
  if (!post) {
    return <Container sx={{py:3}}><Typography>Пост не знайдено.</Typography></Container>;
  }

  const authorFullName = `${post.author_first_name || ''} ${post.author_last_name || ''}`.trim();
  const publishedDate = post.published_at && isValidDate(parseISO(post.published_at)) 
                        ? format(parseISO(post.published_at), 'dd MMMM yyyy', { locale: uk }) 
                        : 'Дата не вказана';

  return (
    <Container maxWidth="lg" sx={{ py: {xs:2, md:4} }}>
      <Paper elevation={0} sx={{p: {xs:0, md:0}}}> {/* Можна прибрати падінги, якщо керувати ними всередині */}
        {post.image_url && (
            <Box 
                component="img" 
                src={post.image_url || DEFAULT_POST_DETAIL_IMAGE} 
                alt={post.title} 
                sx={{ width: '100%', height: {xs:250, sm: 350, md:450}, objectFit: 'cover', borderRadius: {xs:0, md:1}, mb: 3, boxShadow:1 }} 
            />
        )}
        <Box sx={{px: {xs:2, md:0}}}> {/* Додав падінги для тексту, якщо зображення на всю ширину */}
            <Typography variant="h3" component="h1" gutterBottom sx={{fontWeight: 'bold', lineHeight: 1.2}}>
            {post.title}
            </Typography>

            <Grid container spacing={1} alignItems="center" sx={{ color: 'text.secondary', mb: 2, flexWrap:'wrap' }}>
                <Grid item sx={{display:'flex', alignItems:'center'}}>
                    <EventIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                    <Typography variant="body2">{publishedDate}</Typography>
                </Grid>
                {authorFullName && (
                    <Grid item sx={{display:'flex', alignItems:'center', mx:1}}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{authorFullName}</Typography>
                    </Grid>
                )}
                {post.category_name && (
                    <Grid item>
                        <Chip 
                            icon={<CategoryIcon fontSize="small" />}
                            label={post.category_name} 
                            size="small" 
                            component={RouterLink}
                            to={`/posts?category=${post.category_slug}`}
                            clickable
                            variant="outlined"
                        />
                    </Grid>
                )}
            </Grid>
            
            {post.content_short && (
                <Typography variant="h6" paragraph color="text.secondary" sx={{fontStyle: 'italic', mb:3}}>
                    {post.content_short}
                </Typography>
            )}
            <Divider sx={{my:3}}/>

            {post.content_full && (
            <Box className="ck-content" dangerouslySetInnerHTML={createMarkup(post.content_full)} sx={{
                lineHeight: 1.75,
                '& p': { mb: '1em' },
                '& h2': { mt: '1.5em', mb: '0.5em', fontSize: '1.75rem', fontWeight:'medium' },
                '& h3': { mt: '1.25em', mb: '0.4em', fontSize: '1.5rem', fontWeight:'medium' },
                '& ul, & ol': { pl: '2em', mb: '1em' },
                '& li': { mb: '0.25em' },
                '& a': {color: 'primary.main', textDecoration: 'underline'},
                '& img': {maxWidth: '100%', height: 'auto', my: '1em', borderRadius: 1, boxShadow: 1}
            }}/>
            )}
        </Box>
        <CommentSection postId={post.id} initialComments={post.comments || []} />
      </Paper>
    </Container>
  );
};

export default PostDetailPage;