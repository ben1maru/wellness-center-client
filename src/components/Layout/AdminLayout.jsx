// src/components/Layout/AdminLayout.jsx
import React, { useState, useContext } from 'react';
import { Outlet, Navigate, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, CssBaseline, Tooltip, Avatar, Menu, MenuItem, Divider, Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArticleIcon from '@mui/icons-material/Article';
import RateReviewIcon from '@mui/icons-material/RateReview'; // Змінено з ReviewsIcon
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Змінено з MailIcon
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Змінено з AccountCircle
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category'; // Для категорій

import { AuthContext } from '../../contexts/AuthContext.jsx';

const drawerWidth = 250; // Трохи збільшив ширину

const adminNavItems = [
  { text: 'Головна панель', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Записи', icon: <EventNoteIcon />, path: '/admin/appointments' },
  { text: 'Послуги', icon: <MedicalServicesIcon />, path: '/admin/services' },
  { text: 'Категорії (послуги)', icon: <CategoryIcon />, path: '/admin/service-categories' }, // Окремо
  { text: 'Спеціалісти', icon: <PeopleIcon />, path: '/admin/specialists' },
  { text: 'Пости блогу', icon: <ArticleIcon />, path: '/admin/posts' },
  { text: 'Категорії (пости)', icon: <CategoryIcon />, path: '/admin/post-categories' }, // Окремо
  { text: 'Відгуки', icon: <RateReviewIcon />, path: '/admin/reviews' },
  { text: 'Повідомлення', icon: <MailOutlineIcon />, path: '/admin/contact-messages' },
  // { text: 'Користувачі', icon: <PeopleIcon />, path: '/admin/users' }, 
];

const AdminLayout = () => {
  const auth = useContext(AuthContext);
  const { isAuthenticated, user, logout } = auth || {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    if(logout) logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [2] }}>
        <Typography variant="h6" component={RouterLink} to="/admin/dashboard" sx={{textDecoration: 'none', color: 'inherit'}}>
          Адмін-Панель
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ display: { sm: 'none' }}}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {adminNavItems.map((item, index) => (
          <ListItem key={item.text + index} disablePadding component={RouterLink} to={item.path} sx={{color: 'text.primary'}}>
            <ListItemButton selected={window.location.pathname.startsWith(item.path)} sx={{py: 0.8}}>
              <ListItemIcon sx={{minWidth: 40}}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <List>
        <ListItem disablePadding component={RouterLink} to="/" sx={{color: 'text.primary'}}>
          <ListItemButton sx={{py: 0.8}}>
            <ListItemIcon sx={{minWidth: 40}}><HomeIcon /></ListItemIcon>
            <ListItemText primary="На головний сайт" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          // bgcolor: 'background.paper', // Можна залишити стандартний колір AppBar
          // color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Панель Адміністратора
          </Typography>
          {user && (
            <Tooltip title={`${user.first_name} ${user.last_name}`}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user.first_name} src={user.photo_url}>
                  {!user.photo_url && user.first_name ? user.first_name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          )}
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: '45px' }}
          >
            {/* <MenuItem component={RouterLink} to="/admin/profile" onClick={handleCloseUserMenu}>Мій профіль</MenuItem> */}
            <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Вийти
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Відступ від AppBar
          bgcolor: 'background.default', // Для контрасту з білими Paper на сторінках
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;