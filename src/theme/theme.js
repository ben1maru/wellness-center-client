// src/theme/theme.js
import { createTheme } from '@mui/material/styles';
import { ukUA } from '@mui/material/locale';

const PRIMARY_COLOR = '#00695c';
const SECONDARY_COLOR = '#ffab00';
const ERROR_COLOR = '#d32f2f';
const WARNING_COLOR = '#ffa000';
const INFO_COLOR = '#1976d2';
const SUCCESS_COLOR = '#388e3c';

const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR,
    },
    secondary: {
      main: SECONDARY_COLOR,
    },
    error: {
      main: ERROR_COLOR,
    },
    warning: {
      main: WARNING_COLOR,
    },
    info: {
      main: INFO_COLOR,
    },
    success: {
      main: SUCCESS_COLOR,
    },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.8rem', fontWeight: 600, lineHeight: 1.2, },
    h2: { fontSize: '2.2rem', fontWeight: 600, lineHeight: 1.25, },
    h3: { fontSize: '1.8rem', fontWeight: 500, lineHeight: 1.3, },
    h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.35, },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4, },
    h6: { fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.45, },
    subtitle1: { fontSize: '1rem', fontWeight: 500, },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, },
    body1: { fontSize: '1rem', lineHeight: 1.6, },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, },
    button: { textTransform: 'none', fontWeight: 500, },
    caption: { fontSize: '0.75rem', },
    overline: { fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 500, },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536, },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {},
        containedPrimary: {},
      },
      defaultProps: {}
    },
    MuiAppBar: {
      styleOverrides: { root: {} },
      defaultProps: { elevation: 1, }
    },
    MuiCard: {
      defaultProps: { elevation: 2, }
    },
  }
}, ukUA);

export default theme;