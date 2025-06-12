// src/components/Layout/Header.jsx
import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  Container,
  Tooltip, // Додано Tooltip
  Divider // Додано Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout'; // Змінено з Logout
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings'; // Приклад для налаштувань профілю

import { AuthContext } from '../../contexts/AuthContext.jsx'; // Перевірте розширення

const navItemsPublic = [
  { label: 'Головна', path: '/' },
  { label: 'Послуги', path: '/services' },
  { label: 'Спеціалісти', path: '/specialists' },
  { label: 'Блог', path: '/posts' },
  { label: 'Контакти', path: '/contact' },
];

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const getUserDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'specialist': return '/specialist/dashboard';
      case 'client': return '/client/dashboard';
      default: return '/';
    }
  };

  const getUserProfilePath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/profile'; // Якщо є сторінка профілю адміна
      case 'specialist': return '/specialist/profile';
      case 'client': return '/client/profile';
      default: return '/';
    }
  };

  return (
    <AppBar 
        position="sticky" 
        // sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: (theme) => theme.shadows[1] }}
        // Або якщо хочете стандартний колір AppBar:
        color="primary" 
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit', // Буде білим, якщо AppBar primary
              textDecoration: 'none',
            }}
          >
            ЛОГОЦЕНТР {/* Замініть на ваш логотип */}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar-nav"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar-nav"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {navItemsPublic.map((item) => (
                <MenuItem key={item.label} onClick={handleCloseNavMenu} component={RouterLink} to={item.path}>
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
           <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              justifyContent: 'center',
            }}
          >
            ЛОГО {/* Мобільний логотип */}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {navItemsPublic.map((item) => (
              <Button
                key={item.label}
                component={RouterLink}
                to={item.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'inherit', display: 'block', mx: 1 }} // color: 'inherit' для тексту кнопки
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated && user ? (
              <>
                <Tooltip title="Меню користувача">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.first_name || user.email} src={user.photo_url /* якщо є */}>
                        {!user.photo_url && user.first_name ? user.first_name.charAt(0).toUpperCase() : <AccountCircle />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar-user"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem component={RouterLink} to={getUserDashboardPath()} onClick={handleCloseUserMenu}>
                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                    Мій кабінет
                  </MenuItem>
                  <MenuItem component={RouterLink} to={getUserProfilePath()} onClick={handleCloseUserMenu}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    Мій профіль
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    Вийти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" variant="outlined" component={RouterLink} to="/login">
                Увійти
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;