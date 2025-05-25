import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Grid,
    Paper,
    CircularProgress,
    Button,
    Avatar
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Schedule as ScheduleIcon,
    Create as CreateIcon,
    Update as UpdateIcon,
    Group as GroupIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as TodoIcon,
    Autorenew as InProgressIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 800,
    margin: '0 auto',
    boxShadow: theme.shadows[12],
    borderRadius: theme.spacing(2),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    color: theme.palette.primary.contrastText,
}));

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

const TaskView = ({ taskId, currentUserId = 1, onClose }) => {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (taskId) {
            fetchTask();
        }
    }, [taskId]);

    const fetchTask = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                headers: {
                    'User-Id': currentUserId.toString()
                }
            });

            if (response.ok) {
                const taskData = await response.json();
                setTask(taskData);
            } else if (response.status === 404) {
                setError('Task not found');
            } else {
                setError('Failed to fetch task');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error fetching task:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (date - now) / (1000 * 60 * 60);

        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const isOverdue = diffInHours < 0;
        const timeLeft = isOverdue
            ? `${Math.abs(Math.ceil(diffInHours))} hours overdue`
            : diffInHours < 24
                ? `${Math.ceil(diffInHours)} hours left`
                : `${Math.ceil(diffInHours / 24)} days left`;

        return { text: formattedDate, timeLeft, isOverdue };
    };

    const getStatusConfig = (status) => {
        const configs = {
            'TODO': {
                label: 'To Do',
                color: 'info',
                icon: <TodoIcon />,
                bgColor: '#e3f2fd'
            },
            'IN_PROGRESS': {
                label: 'In Progress',
                color: 'warning',
                icon: <InProgressIcon />,
                bgColor: '#fff3e0'
            },
            'DONE': {
                label: 'Done',
                color: 'success',
                icon: <CheckCircleIcon />,
                bgColor: '#e8f5e8'
            }
        };
        return configs[status] || configs['TODO'];
    };

    if (loading) {
        return (
            <StyledCard>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={400}
                    p={4}
                >
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading task details...
                    </Typography>
                </Box>
            </StyledCard>
        );
    }

    if (error && !task) {
        return (
            <StyledCard>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={400}
                    p={4}
                    textAlign="center"
                >
                    <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Error Loading Task
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {error}
                    </Typography>
                    {onClose && (
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={onClose}
                        >
                            Go Back
                        </Button>
                    )}
                </Box>
            </StyledCard>
        );
    }

    const deadline = formatDate(task.deadline);
    const statusConfig = getStatusConfig(task.status);

    return (
        <StyledCard>
            <HeaderBox>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    {onClose && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={onClose}
                            sx={{
                                color: 'inherit',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Back
                        </Button>
                    )}
                    <Box />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                    <Box flex={1} minWidth={0}>
                        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 1, wordBreak: 'break-word' }}>
                            {task.title}
                        </Typography>
                    </Box>
                    <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="large"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            px: 2,
                            py: 1,
                        }}
                    />
                </Box>
            </HeaderBox>

            <CardContent sx={{ p: 4 }}>
                {task.description && (
                    <Paper
                        sx={{
                            p: 3,
                            mb: 4,
                            bgcolor: 'grey.50',
                            borderLeft: 4,
                            borderLeftColor: 'primary.main'
                        }}
                    >
                        <Box display="flex" alignItems="center" mb={2}>
                            <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="bold">
                                Description
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {task.description}
                        </Typography>
                    </Paper>
                )}

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <InfoPaper>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: deadline.isOverdue ? 'error.main' : 'warning.main', mr: 2 }}>
                                    <ScheduleIcon />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Deadline
                                </Typography>
                            </Box>
                            <Typography
                                variant="body1"
                                fontWeight="bold"
                                color={deadline.isOverdue ? 'error.main' : 'text.primary'}
                                sx={{ mb: 1 }}
                            >
                                {deadline.text}
                            </Typography>
                            <Chip
                                label={deadline.timeLeft}
                                size="small"
                                color={deadline.isOverdue ? 'error' : 'default'}
                                variant={deadline.isOverdue ? 'filled' : 'outlined'}
                            />
                        </InfoPaper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <InfoPaper>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                    <GroupIcon />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Group
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                                Group ID: {task.groupId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                Group details will be available when groups are implemented
                            </Typography>
                        </InfoPaper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <InfoPaper>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                                    <AssignmentIcon />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Assignment
                                </Typography>
                            </Box>
                            {task.assignedUsername ? (
                                <Typography variant="body1">
                                    Assigned to <strong>{task.assignedUsername}</strong>
                                </Typography>
                            ) : (
                                <Typography variant="body1" color="text.secondary" fontStyle="italic">
                                    Not assigned
                                </Typography>
                            )}
                        </InfoPaper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <InfoPaper>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                                    <CreateIcon />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Created By
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                                {task.createdByUsername}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(task.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </InfoPaper>
                    </Grid>

                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <Grid item xs={12} sm={6} md={3}>
                            <InfoPaper>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: 'grey.600', mr: 2 }}>
                                        <UpdateIcon />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold">
                                        Last Updated
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(task.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </InfoPaper>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </StyledCard>
    );
};

export default TaskView;