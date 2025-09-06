import type { FC } from 'react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';

import PasswordInput from '@/components/PasswordInput';
import { useApiStore } from '@/stores/api-store';

const LoginPage: FC = () => {
    const login = useApiStore(state => state.login);

    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        if (loading) {
            return;
        }

        setLoading(true);
        setError(null);

        const data = new FormData(event.currentTarget);
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        const response = await login(username, password);

        setLoading(false);

        if (response.success) {
            // Redirect to the dashboard or another page
            navigate('/');
        } else {
            setError(
                `Login failed: ${response?.error || 'Unknown error occurred'}`,
            );
        }
    };

    return (
        <Container maxWidth="xs">
            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : null}
            <form onSubmit={handleSubmit}>
                <FormControl component="fieldset" variant="filled" fullWidth>
                    <FormLabel component="legend">Login</FormLabel>
                    <FormGroup>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            disabled={loading}
                        />
                        <PasswordInput
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            id="password"
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </FormGroup>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        loading={loading}
                    >
                        Sign In
                    </Button>
                </FormControl>
            </form>
        </Container>
    );
};

export default LoginPage;
