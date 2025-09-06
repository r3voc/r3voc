import { createTheme } from '@mui/material';

import '@fontsource/geist/300.css';
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/700.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#243538',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#5da5b2',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#F5F5F5',
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: '"Geist", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                },
            },
        },
    },
});

export default theme;
