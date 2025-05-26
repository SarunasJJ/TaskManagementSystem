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
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Divider,
    IconButton,
    Tooltip
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
    Delete as DeleteIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 900,
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

const ActionBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        '& > *': {
            width: '100%',
        },
    },
}));

const TaskView = ({
                      taskId,
                      currentUserId,
                      groupId,
                      onClose,
                      onTaskUpdated
                  }) => {
    const [task, setTask] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit states
    const [editingStatus, setEditingStatus] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [newAssignedUserId, setNewAssignedUserId] = useState('');

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (taskId) {
            fetchTask();
            if (groupId) {
                fetchGroupMembers();
            }
        }
    }, [taskId, groupId]);

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
                setNewStatus(taskData.status);
                setNewAssignedUserId(taskData.assignedUserId?.toString() || '');
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

    const fetchGroupMembers = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}`, {
                headers: {
                    'User-Id': currentUserId.toString()
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setGroupMembers(data.members || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch group members:', error);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}/status/${newStatus}`, {
                method: 'PUT',
                headers: {
                    'User-Id': currentUserId.toString()
                }
            });

            if (response.ok) {
                setTask(prev => ({ ...prev, status: newStatus }));
                setSuccess('Task status updated successfully!');
                setEditingStatus(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                setError('Failed to update task status');
            }
        } catch (error) {
            setError('Failed to update task status');
        }
    };

    const handleAssignmentUpdate = async () => {
        try {
            let response;

            if (newAssignedUserId) {
                // Assign to a user
                response = await fetch(`http://localhost:8080/api/tasks/${taskId}/assign/${newAssignedUserId}`, {
                    method: 'PUT',
                    headers: {
                        'User-Id': currentUserId.toString()
                    }
                });
            } else {
                // Unassign the task
                response = await fetch(`http://localhost:8080/api/tasks/${taskId}/assign`, {
                    method: 'PUT',
                    headers: {
                        'User-Id': currentUserId.toString()
                    }
                });
            }

            if (response.ok) {
                // Refresh task to get updated assignment info
                fetchTask();
                setSuccess('Task assignment updated successfully!');
                setEditingAssignment(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                setError('Failed to update task assignment');
            }
        } catch (error) {
            setError('Failed to update task assignment');
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'User-Id': currentUserId.toString()
                }
            });

            if (response.ok) {
                setSuccess('Task deleted successfully!');
                setTimeout(() => {
                    if (onTaskUpdated) onTaskUpdated();
                    if (onClose) onClose();
                }, 1000);
            } else {
                setError('Failed to delete task');
            }
        } catch (error) {
            setError('Failed to delete task');
        } finally {
            setDeleting(false);
            setDeleteDialog(false);
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

    const getAvatarColor = (username) => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getAssignedMember = () => {
        return groupMembers.find(member => member.id.toString() === newAssignedUserId);
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
                            sx={{ mt: 2 }}
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
            {success && (
                <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Delete Task">
                            <IconButton
                                color="inherit"
                                onClick={() => setDeleteDialog(true)}
                                sx={{
                                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                    <Box flex={1} minWidth={0}>
                        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 1, wordBreak: 'break-word' }}>
                            {task.title}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {editingStatus ? (
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: 'inherit',
                                        '& .MuiSelect-icon': { color: 'inherit' }
                                    }}
                                >
                                    <MenuItem value="TODO">To Do</MenuItem>
                                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                    <MenuItem value="DONE">Done</MenuItem>
                                </Select>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleStatusUpdate}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => setEditingStatus(false)}
                                        sx={{ color: 'inherit' }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </FormControl>
                        ) : (
                            <Chip
                                icon={statusConfig.icon}
                                label={statusConfig.label}
                                color={statusConfig.color}
                                size="large"
                                onClick={() => setEditingStatus(true)}
                                sx={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    px: 2,
                                    py: 1,
                                    cursor: 'pointer',
                                    '&:hover': { transform: 'scale(1.05)' }
                                }}
                            />
                        )}
                    </Box>
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
                                <Tooltip title="Edit Assignment">
                                    <IconButton
                                        size="small"
                                        onClick={() => setEditingAssignment(true)}
                                        sx={{ ml: 'auto' }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            {task.assignedUsername ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: getAvatarColor(task.assignedUsername),
                                            width: 32,
                                            height: 32
                                        }}
                                    >
                                        {task.assignedUsername.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body1" fontWeight="bold">
                                        {task.assignedUsername}
                                    </Typography>
                                </Box>
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

            {/* Assignment Edit Dialog */}
            <Dialog open={editingAssignment} onClose={() => setEditingAssignment(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Task Assignment</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Assign to Member</InputLabel>
                        <Select
                            value={newAssignedUserId}
                            onChange={(e) => setNewAssignedUserId(e.target.value)}
                            label="Assign to Member"
                            renderValue={(selected) => {
                                if (!selected) return 'Not assigned';
                                const member = getAssignedMember();
                                return member ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: getAvatarColor(member.username),
                                                width: 24,
                                                height: 24,
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {member.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        {member.username}
                                    </Box>
                                ) : 'Not assigned';
                            }}
                        >
                            <MenuItem value="">
                                <em>No assignment</em>
                            </MenuItem>
                            {groupMembers.map((member) => (
                                <MenuItem key={member.id} value={member.id.toString()}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: getAvatarColor(member.username),
                                                width: 32,
                                                height: 32,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {member.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography>{member.username}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingAssignment(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssignmentUpdate}
                        variant="contained"
                        startIcon={<SaveIcon />}
                    >
                        Save Assignment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle sx={{ color: 'error.main' }}>Delete Task</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the task "<strong>{task?.title}</strong>"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                    >
                        {deleting ? 'Deleting...' : 'Delete Task'}
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledCard>
    );
};

export default TaskView;