import type { FC } from 'react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import RefreshIcon from '@mui/icons-material/Refresh';

import { useApiStore } from '@/stores/api-store';

const layout = {
    headerHeight: 36,
    footerHeight: 60,
};

const Footer = styled('footer')(({ theme }) => ({
    width: '100%',
    height: layout.footerHeight,
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const RootLayout: FC = () => {
    const location = useLocation();

    const isCalendar = location.pathname === '/calendar';

    const user = useApiStore(state => state.user);
    const appInfo = useApiStore(state => state.info);

    const logout = useApiStore(state => state.logout);
    const refreshSchedule = useApiStore(state => state.refreshSchedule);

    const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);

    const handleRefreshSchedule = async (): Promise<void> => {
        setScheduleLoading(true);
        await refreshSchedule();
        setScheduleLoading(false);
    };

    return (
        <>
            <AppBar position="sticky" color="primary" component="header">
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            height: layout.headerHeight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography>r3voc Management UI</Typography>
                        {user ? (
                            <Box>
                                <Button
                                    color="secondary"
                                    variant="contained"
                                    size="small"
                                    onClick={handleRefreshSchedule}
                                    loading={scheduleLoading}
                                    startIcon={<RefreshIcon />}
                                >
                                    Refresh schedule.xml from c3voc import tool
                                </Button>
                                <NavLink to="/">
                                    {props => (
                                        <Button
                                            color="info"
                                            variant="contained"
                                            size="small"
                                            disabled={props.isActive}
                                            sx={{ ml: 1 }}
                                        >
                                            Home
                                        </Button>
                                    )}
                                </NavLink>
                                <NavLink to="/calendar">
                                    {props => (
                                        <Button
                                            color="info"
                                            variant="contained"
                                            size="small"
                                            disabled={props.isActive}
                                            sx={{ ml: 1 }}
                                        >
                                            Calendar
                                        </Button>
                                    )}
                                </NavLink>
                            </Box>
                        ) : null}
                        <Box>
                            {user ? (
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    gap={1}
                                    alignItems="center"
                                >
                                    <Typography>
                                        Logged in as {user.username}
                                    </Typography>
                                    <Button
                                        onClick={logout}
                                        size="small"
                                        variant="contained"
                                        color="secondary"
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            ) : (
                                <Link to="/login">Login</Link>
                            )}
                        </Box>
                    </Box>
                </Container>
            </AppBar>
            <Box
                sx={{
                    overflowY: 'auto',
                    height: `calc(100vh - ${layout.headerHeight}px - ${layout.footerHeight}px)`,
                }}
            >
                <Container
                    maxWidth={isCalendar ? false : 'lg'}
                    sx={{
                        pt: 4,
                    }}
                    component="main"
                >
                    <Outlet />
                </Container>
            </Box>
            <Footer>
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box>
                            <a
                                href="https://github.com/realraum/r3voc"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Typography>r3voc management UI</Typography>
                            </a>
                        </Box>
                        <Box>
                            {appInfo?.ciRunId ? (
                                <a
                                    href={`https://github.com/realraum/r3voc/actions/runs/${appInfo.ciRunId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Build{' '}
                                    {appInfo.commitSha?.slice(0, 7) || 'N/A'}
                                </a>
                            ) : (
                                <>
                                    Build{' '}
                                    {appInfo?.commitSha?.slice(0, 7) || 'N/A'}
                                </>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Footer>
        </>
    );
};

export default RootLayout;
