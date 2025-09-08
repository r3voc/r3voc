import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import ApiFetchWrapper from '@/components/ApiFetchWrapper';
import RestrictedRoute from '@/components/RestrictedRoute';
import RootLayout from '@/layout/RootLayout';
import CalendarPage from '@/pages/CalendarPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import theme from '@/theme';

import '@/index.css';

createRoot(document.querySelector('#root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <ApiFetchWrapper>
                    <Routes>
                        <Route element={<RootLayout />}>
                            <Route
                                element={
                                    <RestrictedRoute type="loginRequired" />
                                }
                            >
                                <Route index element={<HomePage />} />
                                <Route
                                    path="calendar"
                                    element={<CalendarPage />}
                                />
                            </Route>
                            <Route
                                element={
                                    <RestrictedRoute type="loginProhibited" />
                                }
                            >
                                <Route path="login" element={<LoginPage />} />
                            </Route>
                        </Route>
                    </Routes>
                </ApiFetchWrapper>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
