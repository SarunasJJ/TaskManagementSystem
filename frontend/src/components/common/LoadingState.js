import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingState = ({ message = 'Loading...', size = 60 }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60vh"
            p={4}
        >
            <CircularProgress size={size} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
};

export default LoadingState;