import React from 'react';
import {
    Paper,
    Box,
    Typography,
    Avatar,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

const InfoPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const TaskInfoCard = ({ icon: Icon, title, children, iconColor = 'primary.main' }) => {
    return (
        <InfoPaper>
            <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: iconColor, mr: 2 }}>
                    <Icon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
            </Box>
            {children}
        </InfoPaper>
    );
};

export default TaskInfoCard;