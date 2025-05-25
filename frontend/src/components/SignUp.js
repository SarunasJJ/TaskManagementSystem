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
    PersonAdd as PersonAddIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    LockOutlined as LockOutlinedIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AuthService from '../services/AuthService'; // Adjust path as needed

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 400,
    margin: '0 auto',
    marginTop: theme.spacing(6),
    boxShadow: theme.shadows[8],
    borderRadius: theme.spacing(2),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    color: theme.palette.primary.contrastText,
}));

const SignUp = ({ onSignUpSuccess, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        setSuccess('');

        const result = await AuthService.signUp(formData);

        if (result.success) {
            setSuccess('Account created successfully!');
            setFormData({
                username: '',
                password: '',
                confirmPassword: ''
            });

            if (onSignUpSuccess) {
                onSignUpSuccess(result.data);
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <StyledCard>
            <HeaderBox>
                <PersonAddIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Sign Up
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Create your account
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

                {success && (
                    <Alert
                        severity="success"
                        onClose={() => setSuccess('')}
                        sx={{ mb: 3 }}
                    >
                        {success}
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

                    <TextField
                        fullWidth
                        required
                        type="password"
                        label="Confirm Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon color="action" />
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
                        fullWidthgit
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                        sx={{
                            py: 1.5,
                            mb: 3,
                            background: 'linear-gradient(135deg, #764ba2, #667eea)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #6a419a, #5a6fd8)',
                                transform: 'translateY(-2px)',
                                boxShadow: (theme) => theme.shadows[8],
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>

                    <Divider sx={{ mb: 3 }} />

                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Link
                                component="button"
                                type="button"
                                variant="body2"
                                onClick={onSwitchToLogin}
                                sx={{
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    color: 'primary.main',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default SignUp;