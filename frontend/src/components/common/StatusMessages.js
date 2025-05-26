import React from 'react';
import { Alert, Fade } from '@mui/material';

const StatusMessages = ({ error, success, onClearError, onClearSuccess }) => {
    return (
        <>
            {success && (
                <Fade in>
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        onClose={onClearSuccess}
                    >
                        {success}
                    </Alert>
                </Fade>
            )}
            {error && (
                <Fade in>
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        onClose={onClearError}
                    >
                        {error}
                    </Alert>
                </Fade>
            )}
        </>
    );
};

export default StatusMessages;
