import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import FormField from '../common/FormField';
import StatusMessages from '../common/StatusMessages';
import { useFormValidation } from '../../hooks/useFormValidation';

const FormContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const AuthForm = ({
                      fields,
                      validationRules,
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

    const { errors, validateForm, clearError } = useFormValidation(validationRules);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearError(name);
        if (onClearError) onClearError();
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
            <StatusMessages
                error={error}
                success={success}
                onClearError={onClearError}
                onClearSuccess={onClearSuccess}
            />

            <Box component="form" onSubmit={handleSubmit}>
                <FormContainer>
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
                </FormContainer>
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

export default AuthForm;