import { useState } from 'react';

export const useApiRequest = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const makeRequest = async (requestFn, successMessage = '') => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await requestFn();
            if (result.success) {
                if (successMessage) setSuccess(successMessage);
                return result;
            } else {
                setError(result.error);
                return result;
            }
        } catch (err) {
            setError('Network error. Please try again.');
            return { success: false, error: 'Network error' };
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    return {
        loading,
        error,
        success,
        makeRequest,
        clearMessages,
        setError,
        setSuccess
    };
};