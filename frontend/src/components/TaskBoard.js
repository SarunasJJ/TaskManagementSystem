import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Badge,
    Chip,
    Avatar,
    Tooltip,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Dialog,
    DialogContent,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as TaskIcon,
    PlayArrow as InProgressIcon,
    CheckCircle as DoneIcon,
    RadioButtonUnchecked as TodoIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import TaskView from './TaskView';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const TaskCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const KanbanColumn = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    minHeight: 400,
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(2),
}));

const ColumnHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
}));

const TaskBoard = ({ groupId, currentUser }) => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskViewDialog, setTaskViewDialog] = useState(false);
    const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);
    const [taskToManage, setTaskToManage] = useState(null);

    useEffect(() => {
        if (groupId && currentUser) {
            fetchTasks();
        }
    }, [groupId, currentUser]);

    const fetchTasks = async () => {
        if (!groupId) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:8080/api/tasks/group/${groupId}`, {
                headers: {
                    'User-Id': currentUser?.id?.toString() || '1'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTasks(data.tasks || []);
                }
            } else {
                setError('Failed to load tasks');
            }
        } catch (error) {
            setError('Failed to load tasks');
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = () => {
        navigate(`/groups/${groupId}/tasks/create`);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setTaskViewDialog(true);
    };

    const handleTaskMenuClick = (event, task) => {
        event.stopPropagation();
        setTaskMenuAnchor(event.currentTarget);
        setTaskToManage(task);
    };

    const handleTaskMenuClose = () => {
        setTaskMenuAnchor(null);
        setTaskToManage(null);
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}/status/${newStatus}`, {
                method: 'PUT',
                headers: {
                    'User-Id': currentUser?.id?.toString() || '1'
                }
            });

            if (response.ok) {
                fetchTasks(); // Refresh tasks
                setSuccess(`Task status updated to ${newStatus.replace('_', ' ').toLowerCase()}!`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to update task status');
            }
        } catch (error) {
            setError('Failed to update task status');
        }
        handleTaskMenuClose();
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const formatTaskDeadline = (deadline) => {
        const date = new Date(deadline);
        const now = new Date();
        const diffInHours = (date - now) / (1000 * 60 * 60);

        if (diffInHours < 0) {
            return { text: 'Overdue', color: 'error.main', isOverdue: true };
        } else if (diffInHours < 24) {
            return { text: `${Math.ceil(diffInHours)}h left`, color: 'warning.main', isOverdue: false };
        } else {
            const days = Math.ceil(diffInHours / 24);
            return { text: `${days}d left`, color: 'text.secondary', isOverdue: false };
        }
    };

    const handleTaskUpdated = () => {
        fetchTasks(); // Refresh tasks when task is updated/deleted
        setTaskViewDialog(false);
    };

    const renderTaskCard = (task) => {
        const deadline = formatTaskDeadline(task.deadline);
        return (
            <TaskCard key={task.id} onClick={() => handleTaskClick(task)}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flex: 1 }}>
                            {task.title}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={(e) => handleTaskMenuClick(e, task)}
                        >
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
                                color: deadline.color
                            }}
                        />
                        {task.assignedUsername && (
                            <Tooltip title={`Assigned to ${task.assignedUsername}`}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                    {task.assignedUsername.charAt(0).toUpperCase()}
                                </Avatar>
                            </Tooltip>
                        )}
                    </Box>
                </CardContent>
            </TaskCard>
        );
    };

    return (
        <StyledPaper>
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    Tasks ({tasks.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateTask}
                >
                    Create Task
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* TODO Column */}
                    <Grid item xs={12} md={4}>
                        <KanbanColumn>
                            <ColumnHeader sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TodoIcon />
                                    <Typography variant="h6" fontWeight={600}>
                                        To Do
                                    </Typography>
                                </Box>
                                <Badge badgeContent={getTasksByStatus('TODO').length} color="primary" />
                            </ColumnHeader>
                            {getTasksByStatus('TODO').map(renderTaskCard)}
                        </KanbanColumn>
                    </Grid>

                    {/* IN PROGRESS Column */}
                    <Grid item xs={12} md={4}>
                        <KanbanColumn>
                            <ColumnHeader sx={{ backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InProgressIcon />
                                    <Typography variant="h6" fontWeight={600}>
                                        In Progress
                                    </Typography>
                                </Box>
                                <Badge badgeContent={getTasksByStatus('IN_PROGRESS').length} color="primary" />
                            </ColumnHeader>
                            {getTasksByStatus('IN_PROGRESS').map(renderTaskCard)}
                        </KanbanColumn>
                    </Grid>

                    {/* DONE Column */}
                    <Grid item xs={12} md={4}>
                        <KanbanColumn>
                            <ColumnHeader sx={{ backgroundColor: 'success.light', color: 'success.contrastText' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DoneIcon />
                                    <Typography variant="h6" fontWeight={600}>
                                        Done
                                    </Typography>
                                </Box>
                                <Badge badgeContent={getTasksByStatus('DONE').length} color="primary" />
                            </ColumnHeader>
                            {getTasksByStatus('DONE').map(renderTaskCard)}
                        </KanbanColumn>
                    </Grid>
                </Grid>
            )}

            {/* Task View Dialog */}
            <Dialog open={taskViewDialog} onClose={() => setTaskViewDialog(false)} maxWidth="lg" fullWidth>
                <DialogContent sx={{ p: 0 }}>
                    {selectedTask && (
                        <TaskView
                            taskId={selectedTask.id}
                            currentUserId={currentUser?.id}
                            groupId={groupId}
                            onClose={() => setTaskViewDialog(false)}
                            onTaskUpdated={handleTaskUpdated}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Task Menu */}
            <Menu
                anchorEl={taskMenuAnchor}
                open={Boolean(taskMenuAnchor)}
                onClose={handleTaskMenuClose}
            >
                <MenuItem onClick={() => handleTaskStatusChange(taskToManage?.id, 'TODO')}>
                    <TodoIcon sx={{ mr: 1 }} />
                    Move to To Do
                </MenuItem>
                <MenuItem onClick={() => handleTaskStatusChange(taskToManage?.id, 'IN_PROGRESS')}>
                    <InProgressIcon sx={{ mr: 1 }} />
                    Move to In Progress
                </MenuItem>
                <MenuItem onClick={() => handleTaskStatusChange(taskToManage?.id, 'DONE')}>
                    <DoneIcon sx={{ mr: 1 }} />
                    Move to Done
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                    setSelectedTask(taskToManage);
                    setTaskViewDialog(true);
                    handleTaskMenuClose();
                }}>
                    <TaskIcon sx={{ mr: 1 }} />
                    View Details
                </MenuItem>
            </Menu>
        </StyledPaper>
    );
};

export default TaskBoard;