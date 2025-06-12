// src/pages/public/PostsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Typography, Grid } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageTitle from '../../components/Common/PageTitle.jsx';
import PostList from '../../components/Posts/PostList.jsx';
import PostCategoryFilter from '../../components/Posts/PostCategoryFilter.jsx';
import PostSearch from '../../components/Posts/PostSearch.jsx';
import AlertMessage from '../../components/Common/AlertMessage.jsx';
import { getPublishedPosts } from '../../api/dataApi.js';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategorySlug = searchParams.get('category');
  const searchTerm = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const limit = 9;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit };
      if (currentCategorySlug) params.category_slug = currentCategorySlug;
      if (searchTerm) params.search = searchTerm;
      
      const data = await getPublishedPosts(params);
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setTotalPosts(data.totalPosts || 0);
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити пости.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentCategorySlug, searchTerm, limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCategoryChange = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearch = (query) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
     const newParams = new URLSearchParams(searchParams);
     newParams.set('page', String(newPage));
     setSearchParams(newParams);
     window.scrollTo(0, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: {xs:2, md:3}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center', width: '100%', mb: 3 }}>
        <PageTitle 
          title="Наш Блог" 
          subtitle="Корисні статті, новини та поради від наших експертів" 
        />
      </Box>
      
      <Grid 
        container 
        spacing={2} 
        sx={{ mb: 2, width: '100%', maxWidth: 1200 }} // maxWidth для контейнера фільтрів
        justifyContent="center" 
        alignItems="center"
      >
        <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'center' }}>
          <PostCategoryFilter 
            currentCategorySlug={currentCategorySlug} 
            onCategoryChange={handleCategoryChange}
            variant="chips"
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <PostSearch onSearch={handleSearch} initialQuery={searchTerm}/>
        </Grid>
      </Grid>

      {error && (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 2 }}>
          <AlertMessage severity="error" message={error} onClose={() => setError('')} />
        </Box>
      )}

      {/* Цей Box центрує PostList, якщо PostList сам по собі має меншу ширину */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <PostList 
          posts={posts} 
          loading={loading} 
          error={error && posts.length === 0 ? error : null}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Box>

      {!loading && totalPosts === 0 && !error && (
        <Typography sx={{ my: 5, textAlign: 'center', color: 'text.secondary' }}>
          Статей за вашим запитом не знайдено.
        </Typography>
      )}
    </Container>
  );
};

export default PostsPage;