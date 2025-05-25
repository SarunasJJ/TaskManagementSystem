import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Fade
} from '@mui/material';
import {
    Login as LoginIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import authService from '../services/authService';

const LoginContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing(2),
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: 400,
    animation: 'slideUp 0.5s ease-out',
    '@keyframes slideUp': {
        from: {
            opacity: 0,
            transform: 'translateY(30px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(3),
}));

const FormBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (errors.general) {
            setErrors(prev => ({
                ...prev,
                general: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const result = await authService.login(formData);

            if (result.success) {
                navigate('/homepage');
            } else {
                setErrors({ general: result.error });
            }
        } catch (error) {
            setErrors({ general: 'Something went wrong. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <LoginContainer>
            <LoginPaper elevation={10}>
                <HeaderBox>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <LoginIcon sx={{ color: 'white', fontSize: 30 }} />
                        </Box>
                    </Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sign in to your account
                    </Typography>
                </HeaderBox>

                {errors.general && (
                    <Fade in>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {errors.general}
                        </Alert>
                    </Fade>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <FormBox>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            placeholder="Enter your username"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color={errors.username ? 'error' : 'action'} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            placeholder="Enter your password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color={errors.password ? 'error' : 'action'} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                            sx={{ mt: 2, py: 1.5 }}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </FormBox>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            Sign up here
                        </Link>
                    </Typography>
                </Box>
            </LoginPaper>
        </LoginContainer>
    );
};

export default Login;