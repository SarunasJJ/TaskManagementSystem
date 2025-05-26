import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const PageHeader = ({
                        title,
                        subtitle,
                        onBack,
                        backTooltip = 'Back',
                        actions
                    }) => {
    return (
        <Box sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {onBack && (
                    <Tooltip title={backTooltip}>
                        <IconButton onClick={onBack} color="primary">
                            <ArrowBack />
                        </IconButton>
                    </Tooltip>
                )}
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>
            {actions && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {actions}
                </Box>
            )}
        </Box>
    );
};

export default PageHeader;