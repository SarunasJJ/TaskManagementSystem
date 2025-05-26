import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthContainerBox = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing(2),
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: 450,
    animation: 'slideUp 0.5s ease-out',
    '@keyframes slideUp': {
        from: {
            opacity: 0,
            transform: 'translateY(30px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
}));

const AuthHeader = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(3),
}));

const AuthContainer = ({ icon: Icon, title, subtitle, children, maxWidth = 450 }) => {
    return (
        <AuthContainerBox>
            <AuthPaper elevation={10} sx={{ maxWidth }}>
                <AuthHeader>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon sx={{ color: 'white', fontSize: 30 }} />
                        </Box>
                    </Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                        {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {subtitle}
                    </Typography>
                </AuthHeader>
                {children}
            </AuthPaper>
        </AuthContainerBox>
    );
};

export default AuthContainer;