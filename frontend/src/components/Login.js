import React, { useState } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Box,
    CircularProgress,
    InputAdornment,
    Divider,
    Link
} from '@mui/material';
import {
    Login as LoginIcon,
    Person as PersonIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AuthService from '../services/AuthService';

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 400,
    margin: '0 auto',
    marginTop: theme.spacing(8),
    boxShadow: theme.shadows[8],
    borderRadius: theme.spacing(2),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    color: theme.palette.primary.contrastText,
}));

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await AuthService.login(formData);

        if (result.success) {
            if (onLoginSuccess) {
                onLoginSuccess(result.data);
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <StyledCard>
            <HeaderBox>
                <LoginIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Login
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Sign in to your account
                </Typography>
            </HeaderBox>

            <CardContent sx={{ p: 3 }}>
                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError('')}
                        sx={{ mb: 3 }}
                    >
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        required
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        fullWidth
                        required
                        type="password"
                        label="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                        sx={{
                            py: 1.5,
                            mb: 3,
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8, #6a419a)',
                                transform: 'translateY(-2px)',
                                boxShadow: (theme) => theme.shadows[8],
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>

                    <Divider sx={{ mb: 3 }} />

                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link
                                component="button"
                                type="button"
                                variant="body2"
                                onClick={onSwitchToSignup}
                                sx={{
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    color: 'primary.main',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default Login;