import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Error as ErrorIcon, ArrowBack } from '@mui/icons-material';

const ErrorState = ({
                        title = 'Error',
                        message,
                        actionText = 'Go Back',
                        onAction,
                        icon: CustomIcon = ErrorIcon
                    }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60vh"
            p={4}
            textAlign="center"
        >
            <CustomIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
            </Typography>
            {onAction && (
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={onAction}
                >
                    {actionText}
                </Button>
            )}
        </Box>
    );
};

export default ErrorState;