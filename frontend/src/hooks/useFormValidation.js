import { useState } from 'react';

export const useFormValidation = (validationRules) => {
    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
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

    const clearAllErrors = () => setErrors({});

    return {
        errors,
        validateField,
        validateForm,
        clearError,
        clearAllErrors
    };
};