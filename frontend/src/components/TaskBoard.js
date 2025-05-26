import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    Grid,
    Menu,
    MenuItem,
    Divider,
    Dialog,
    DialogContent
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as TaskIcon,
    RadioButtonUnchecked as TodoIcon,
    Autorenew as InProgressIcon,
    CheckCircle as DoneIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';
import { useApiRequest } from '../hooks/useApiRequest';
import LoadingState from './common/LoadingState';
import StatusMessages from './common/StatusMessages';
import TaskView from './TaskView';
import TaskTableColumn from "./task/TaskTableColumn";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const columnConfig = {
    'TODO': {
        title: 'To Do',
        icon: TodoIcon,
        headerColor: 'info.light'
    },
    'IN_PROGRESS': {
        title: 'In Progress',
        icon: InProgressIcon,
        headerColor: 'warning.light'
    },
    'DONE': {
        title: 'Done',
        icon: DoneIcon,
        headerColor: 'success.light'
    }
};

const TaskBoard = ({ groupId, currentUser }) => {
    const navigate = useNavigate();
    const { loading, error, success, makeRequest, setSuccess, clearMessages } = useApiRequest();

    const [tasks, setTasks] = useState([]);
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
        const result = await makeRequest(() => taskService.getTasksByGroup(groupId, currentUser?.id));
        if (result.success) {
            setTasks(result.data);
        }
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            const result = await taskService.updateTaskStatus(taskId, newStatus, currentUser?.id);
            if (result.success) {
                fetchTasks();
                setSuccess(`Task status updated to ${newStatus.replace('_', ' ').toLowerCase()}!`);
            } else {
                console.error('Failed to update task status:', result.error);
            }
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
        setTaskMenuAnchor(null);
        setTaskToManage(null);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setTaskViewDialog(true);
    };

    const handleTaskMenuClick = (event, task) => {
        setTaskMenuAnchor(event.currentTarget);
        setTaskToManage(task);
    };

    const handleTaskMenuClose = () => {
        setTaskMenuAnchor(null);
        setTaskToManage(null);
    };

    const handleTaskUpdated = () => {
        fetchTasks();
        setTaskViewDialog(false);
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    if (loading) {
        return <LoadingState message="Loading tasks..." />;
    }

    return (
        <StyledPaper>
            <StatusMessages
                error={error}
                success={success}
                onClearError={clearMessages}
                onClearSuccess={clearMessages}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                    Tasks ({tasks.length})
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/groups/${groupId}/tasks/create`)}
                >
                    Create Task
                </Button>
            </Box>

            <Grid container spacing={3}>
                {Object.entries(columnConfig).map(([status, config]) => (
                    <Grid item xs={12} md={4} key={status}>
                        <TaskTableColumn
                            title={config.title}
                            icon={config.icon}
                            tasks={getTasksByStatus(status)}
                            headerColor={config.headerColor}
                            onTaskClick={handleTaskClick}
                            onTaskMenuClick={handleTaskMenuClick}
                        />
                    </Grid>
                ))}
            </Grid>

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