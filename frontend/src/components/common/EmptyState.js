import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const EmptyState = ({
                        icon: Icon,
                        title,
                        description,
                        actionText,
                        onAction,
                        variant = 'paper' // 'paper' or 'box'
                    }) => {
    const content = (
        <>
            <Icon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="text.secondary">
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {description}
            </Typography>
            {onAction && actionText && (
                <Button variant="contained" size="large" onClick={onAction}>
                    {actionText}
                </Button>
            )}
        </>
    );

    if (variant === 'paper') {
        return (
            <Paper
                sx={{
                    padding: 6,
                    textAlign: 'center',
                    borderRadius: 2,
                    boxShadow: 2,
                }}
            >
                {content}
            </Paper>
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            py={6}
        >
            {content}
        </Box>
    );
};

export default EmptyState;