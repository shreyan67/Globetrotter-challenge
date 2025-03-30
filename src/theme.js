import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6F3C',  // Vibrant orange for buttons and highlights
    },
    secondary: {
      main: '#3C91E6',  // Deep blue for contrast
    },
    background: {
      default: '#FAF3E0',  // Light sandy color for the background
    },
    text: {
      primary: '#2D2D2D',  // Darker text for readability
      secondary: '#FF6F3C',  // Highlighted text
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      color: '#3C91E6',  // Title text color
    },
    h5: {
      fontWeight: 600,
      color: '#FF6F3C',  // Subheading color
    },
    h6: {
      fontWeight: 500,
      color: '#2D2D2D',  // Normal text color
    },
    subtitle1: {
      fontStyle: 'italic',
      color: '#888888',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
          padding: '10px 20px',
          margin: '5px',
        },
      },
    },
  },
});

export default theme;
