// src/components/Layout/SpecialistLayout.jsx
import React, { useState, useContext } from 'react';
import { Outlet, Navigate, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container // Можна використовувати, якщо Toolbar не на всю ширину
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote'; // Для записів
import PersonIcon from '@mui/icons-material/Person';       // Для профілю
import SettingsIcon from '@mui/icons-material/Settings';   // Для налаштувань (приклад)
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // Якщо буде управління розкладом

// Переконайтесь, що AuthContext.jsx існує та експортує AuthContext
import { AuthContext } from '../../contexts/AuthContext.jsx'; 
import LoadingSpinner from '../Common/LoadingSpinner.jsx'; // Для isLoading

const drawerWidth = 250;

const specialistNavItems = [
  { text: 'Мій Дашборд', icon: <DashboardIcon />, path: '/specialist/dashboard' },
  { text: 'Мої Записи', icon: <EventNoteIcon />, path: '/specialist/appointments' },
  // { text: 'Мій Розклад', icon: <CalendarMonthIcon />, path: '/specialist/schedule' }, // Приклад
  { text: 'Мій Профіль', icon: <PersonIcon />, path: '/specialist/profile' },
];

const SpecialistLayout = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Обережна деструктуризація, щоб уникнути помилок, якщо auth ще не завантажений
  const isLoadingAuth = auth ? auth.isLoading : true;
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  const user = auth ? auth.user : null;
  const logout = auth ? auth.logout : () => {};


  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };
  
  if (isLoadingAuth) {
    return <LoadingSpinner sx={{ height: '100vh' }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Дозволяємо адміну доступ до кабінету спеціаліста для тестування/керування
  if (!user || (user.role !== 'specialist' && user.role !== 'admin')) {
    console.warn(`User role "${user?.role}" not allowed for SpecialistLayout. Redirecting.`);
    return <Navigate to="/" replace />; // Або на сторінку "доступ заборонено"
  }


  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [2] }}>
        <Typography variant="h6" component={RouterLink} to="/specialist/dashboard" sx={{textDecoration: 'none', color: 'inherit'}}>
          Кабінет Спеціаліста
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ display: { sm: 'none' }}}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {specialistNavItems.map((item, index) => (
          <ListItem key={item.text + index} disablePadding component={RouterLink} to={item.path} sx={{color: 'text.primary'}}>
            <ListItemButton selected={location.pathname.startsWith(item.path)} sx={{py: 0.8}}>
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
          // bgcolor: 'primary.main', // або інший колір
          // color: 'primary.contrastText',
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
            Кабінет Спеціаліста {/* Можна динамічно змінювати заголовок */}
          </Typography>
          {user && (
            <Tooltip title={`${user.first_name} ${user.last_name}`}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user.first_name || ''} src={user.photo_url}>
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
            <MenuItem component={RouterLink} to="/specialist/profile" onClick={handleCloseUserMenu}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Мій профіль
            </MenuItem>
            <Divider />
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
        aria-label="specialist navigation"
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
          mt: '64px', 
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default SpecialistLayout;