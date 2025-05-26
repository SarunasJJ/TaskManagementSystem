import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Login as LoginIcon, Person as PersonIcon, Lock as LockIcon } from '@mui/icons-material';
import authService from '../../services/authService';
import AuthContainer from './AuthContainer';
import AuthForm from './AuthForm';
import { useApiRequest } from '../../hooks/useApiRequest';
import { validationRules } from '../../utils/validationRules';

const Login = () => {
    const navigate = useNavigate();
    const { loading, error, makeRequest, clearMessages } = useApiRequest();

    const formFields = [
        {
            name: 'username',
            label: 'Username',
            placeholder: 'Enter your username',
            required: true,
            startIcon: <PersonIcon color="action" />
        },
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Enter your password',
            required: true,
            startIcon: <LockIcon color="action" />,
            showPasswordToggle: true
        }
    ];

    const handleLogin = async (formData) => {
        const result = await makeRequest(
            () => authService.login(formData),
            'Login successful!'
        );

        if (result.success) {
            navigate('/homepage');
        }
    };

    return (
        <AuthContainer
            icon={LoginIcon}
            title="Welcome Back"
            subtitle="Sign in to your account"
        >
            <AuthForm
                fields={formFields}
                validationRules={{
                    username: validationRules.username,
                    password: validationRules.password
                }}
                onSubmit={handleLogin}
                submitText="Sign In"
                loadingText="Signing In..."
                loading={loading}
                error={error}
                onClearError={clearMessages}
                footerText="Don't have an account?"
                footerLinkText="Sign up here"
                footerLinkTo="/signup"
            />
        </AuthContainer>
    );
};

export default Login;