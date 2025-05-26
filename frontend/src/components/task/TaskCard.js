import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import UserAvatar from '../common/UserAvatar';
import { formatRelativeTime } from '../../utils/dateUtils';

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const TaskCard = ({ task, onClick, onMenuClick }) => {
    const deadline = formatRelativeTime(task.deadline);

    const handleCardClick = () => {
        if (onClick) onClick(task);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        if (onMenuClick) onMenuClick(e, task);
    };

    return (
        <StyledCard onClick={handleCardClick}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flex: 1 }}>
                        {task.title}
                    </Typography>
                    <IconButton size="small" onClick={handleMenuClick}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>

                {task.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {task.description}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                        label={deadline.text}
                        size="small"
                        sx={{
                            backgroundColor: deadline.isOverdue ? 'error.light' : 'grey.100',
                            color: deadline.isOverdue ? 'error.main' : 'text.secondary'
                        }}
                    />
                    {task.assignedUsername && (
                        <Tooltip title={`Assigned to ${task.assignedUsername}`}>
                            <UserAvatar
                                username={task.assignedUsername}
                                size={24}
                                fontSize="0.7rem"
                            />
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default TaskCard;