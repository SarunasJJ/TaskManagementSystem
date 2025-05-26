import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { PersonAdd as PersonAddIcon, Person as PersonIcon, Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import authService from '../../services/authService';
import AuthContainer from './AuthContainer';
import AuthForm from './AuthForm';
import { useApiRequest } from '../../hooks/useApiRequest';
import { validationRules } from '../../utils/validationRules';
import {Alert, Box, Button, CircularProgress, Typography} from "@mui/material";
import FormField from "../common/FormField";

const SignUp = () => {
    const navigate = useNavigate();
    const { loading, error, makeRequest, clearMessages } = useApiRequest();

    const formFields = [
        {
            name: 'username',
            label: 'Username',
            placeholder: 'Enter your username',
            required: true,
            maxLength: 20,
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
        },
        {
            name: 'confirmPassword',
            label: 'Confirm Password',
            type: 'password',
            placeholder: 'Confirm your password',
            required: true,
            startIcon: <LockOpenIcon color="action" />,
            showPasswordToggle: true
        }
    ];

    const handleSignUp = async (formData) => {
        const result = await makeRequest(
            () => authService.signUp(formData),
            'Account created successfully!'
        );

        if (result.success) {
            navigate('/login', {
                state: {
                    message: 'Account created successfully! Please sign in.',
                    severity: 'success'
                }
            });
        }
    };

    // Custom validation function that has access to current form data
    const createValidationRules = (formData) => ({
        username: validationRules.username,
        password: validationRules.password,
        confirmPassword: (value) => validationRules.confirmPassword(value, formData?.password)
    });

    return (
        <AuthContainer
            icon={PersonAddIcon}
            title="Create Account"
            subtitle="Join us and start collaborating"
        >
            <AuthFormWithDynamicValidation
                fields={formFields}
                createValidationRules={createValidationRules}
                onSubmit={handleSignUp}
                submitText="Create Account"
                loadingText="Creating Account..."
                loading={loading}
                error={error}
                onClearError={clearMessages}
                footerText="Already have an account?"
                footerLinkText="Sign in here"
                footerLinkTo="/login"
            />
        </AuthContainer>
    );
};

// Custom AuthForm component that supports dynamic validation
const AuthFormWithDynamicValidation = ({
                                           fields,
                                           createValidationRules,
                                           onSubmit,
                                           submitText,
                                           loadingText,
                                           loading = false,
                                           error = '',
                                           success = '',
                                           onClearError,
                                           onClearSuccess,
                                           footerText,
                                           footerLinkText,
                                           footerLinkTo
                                       }) => {
    const [formData, setFormData] = useState(
        fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
    );
    const [showPasswords, setShowPasswords] = useState({});
    const [errors, setErrors] = useState({});

    const validateField = (name, value, currentFormData) => {
        const validationRules = createValidationRules(currentFormData);
        if (validationRules[name]) {
            const error = validationRules[name](value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
            return !error;
        }
        return true;
    };

    const validateForm = (formData) => {
        const validationRules = createValidationRules(formData);
        const newErrors = {};
        Object.keys(validationRules).forEach(field => {
            const error = validationRules[field](formData[field]);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearError = (field) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // Clear the error for this field
        clearError(name);
        if (onClearError) onClearError();

        // If this is the password field and confirmPassword has a value, revalidate confirmPassword
        if (name === 'password' && formData.confirmPassword) {
            validateField('confirmPassword', formData.confirmPassword, newFormData);
        }

        // If this is confirmPassword, validate it against the current password
        if (name === 'confirmPassword') {
            validateField('confirmPassword', value, newFormData);
        }
    };

    const togglePasswordVisibility = (fieldName) => {
        setShowPasswords(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm(formData)) {
            onSubmit(formData);
        }
    };

    return (
        <>
            {(error || success) && (
                <Box sx={{ mb: 3 }}>
                    {error && (
                        <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" onClose={onClearSuccess}>
                            {success}
                        </Alert>
                    )}
                </Box>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fields.map((field) => (
                        <FormField
                            key={field.name}
                            {...field}
                            value={formData[field.name]}
                            onChange={handleChange}
                            error={errors[field.name]}
                            showPassword={showPasswords[field.name]}
                            onTogglePassword={() => togglePasswordVisibility(field.name)}
                        />
                    ))}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        sx={{ mt: 2, py: 1.5 }}
                    >
                        {loading ? loadingText : submitText}
                    </Button>
                </Box>
            </Box>

            {footerText && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        {footerText}{' '}
                        <Link
                            to={footerLinkTo}
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            {footerLinkText}
                        </Link>
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default SignUp;