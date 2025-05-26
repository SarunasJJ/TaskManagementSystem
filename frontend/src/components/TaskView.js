import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Create as CreateIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import taskService from '../services/taskService';
import groupService from '../services/groupService';
import { useApiRequest } from '../hooks/useApiRequest';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils';
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';
import StatusMessages from './common/StatusMessages';
import ConfirmDialog from './common/ConfirmDialog';
import UserAvatar from './common/UserAvatar';
import TaskHeader from './task/TaskHeader';
import TaskAssignmentDialog from './task/TaskAssignmentDialog';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.spacing(2),
}));

const InfoRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
    minWidth: 120,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const InfoContent = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const TaskView = ({
                      taskId,
                      currentUserId,
                      groupId,
                      onClose,
                      onTaskUpdated
                  }) => {
    const { loading, error, success, makeRequest, setSuccess, setError, clearMessages } = useApiRequest();

    const [task, setTask] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);

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
        const result = await makeRequest(() => taskService.getTask(taskId, currentUserId));
        if (result.success) {
            setTask(result.data);
            setNewStatus(result.data.status);
            setNewAssignedUserId(result.data.assignedUserId?.toString() || '');
        }
    };

    const fetchGroupMembers = async () => {
        try {
            const result = await groupService.getGroup(groupId);
            if (result.success) {
                setGroupMembers(result.data.members || []);
            }
        } catch (error) {
            console.error('Failed to fetch group members:', error);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const result = await taskService.updateTaskStatus(taskId, newStatus, currentUserId);
            if (result.success) {
                setTask(prev => ({ ...prev, status: newStatus }));
                setSuccess('Task status updated successfully!');
                setEditingStatus(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to update task status');
        }
    };

    const handleAssignmentUpdate = async () => {
        try {
            const result = await taskService.assignTask(taskId, newAssignedUserId || null, currentUserId);
            if (result.success) {
                // Refresh task to get updated assignment info
                await fetchTask();
                setSuccess('Task assignment updated successfully!');
                setEditingAssignment(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to update task assignment');
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const result = await taskService.deleteTask(taskId, currentUserId);
            if (result.success) {
                setSuccess('Task deleted successfully!');
                setTimeout(() => {
                    if (onTaskUpdated) onTaskUpdated();
                    if (onClose) onClose();
                }, 1000);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to delete task');
        } finally {
            setDeleting(false);
            setDeleteDialog(false);
        }
    };

    if (loading) {
        return (
            <StyledCard>
                <LoadingState message="Loading task details..." />
            </StyledCard>
        );
    }

    if (error && !task) {
        return (
            <StyledCard>
                <ErrorState
                    title="Error Loading Task"
                    message={error}
                    onAction={onClose}
                    actionText="Go Back"
                />
            </StyledCard>
        );
    }

    if (!task) return null;

    const deadline = formatRelativeTime(task.deadline);

    return (
        <StyledCard>
            <StatusMessages
                error={error}
                success={success}
                onClearError={clearMessages}
                onClearSuccess={clearMessages}
            />

            <TaskHeader
                task={task}
                onBack={onClose}
                onDelete={() => setDeleteDialog(true)}
                editingStatus={editingStatus}
                newStatus={newStatus}
                onStatusEdit={(status) => {
                    setNewStatus(status);
                    setEditingStatus(true);
                }}
                onStatusSave={handleStatusUpdate}
                onStatusCancel={() => setEditingStatus(false)}
            />

            <CardContent sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                {task.description && (
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
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

                {/* Task Information Rows */}
                <Box sx={{ mt: 3 }}>
                    {/* Deadline Row */}
                    <InfoRow>
                        <InfoLabel>
                            <ScheduleIcon />
                            Deadline
                        </InfoLabel>
                        <InfoContent>
                            <Box>
                                <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    color={deadline.isOverdue ? 'error.main' : 'text.primary'}
                                >
                                    {formatDateTime(task.deadline)}
                                </Typography>
                                <Chip
                                    label={deadline.text}
                                    size="small"
                                    color={deadline.isOverdue ? 'error' : 'default'}
                                    variant={deadline.isOverdue ? 'filled' : 'outlined'}
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                        </InfoContent>
                    </InfoRow>

                    {/* Assignee Row */}
                    <InfoRow>
                        <InfoLabel>
                            <AssignmentIcon />
                            Assigned to
                        </InfoLabel>
                        <InfoContent>
                            <Box>
                                {task.assignedUsername ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UserAvatar
                                            username={task.assignedUsername}
                                            size={32}
                                        />
                                        <Typography variant="body1" fontWeight="bold">
                                            {task.assignedUsername}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body1" color="text.secondary" fontStyle="italic">
                                        Not assigned
                                    </Typography>
                                )}
                            </Box>
                            <Tooltip title="Edit Assignment">
                                <IconButton
                                    size="small"
                                    onClick={() => setEditingAssignment(true)}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </InfoContent>
                    </InfoRow>

                    {/* Created By Row */}
                    <InfoRow>
                        <InfoLabel>
                            <CreateIcon />
                            Created by
                        </InfoLabel>
                        <InfoContent>
                            <Box>
                                <Typography variant="body1" fontWeight="bold">
                                    {task.createdByUsername}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(task.createdAt)}
                                </Typography>
                            </Box>
                        </InfoContent>
                    </InfoRow>
                </Box>
            </CardContent>

            {/* Assignment Edit Dialog */}
            <TaskAssignmentDialog
                open={editingAssignment}
                onClose={() => setEditingAssignment(false)}
                onSave={handleAssignmentUpdate}
                members={groupMembers}
                value={newAssignedUserId}
                onChange={(e) => setNewAssignedUserId(e.target.value)}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message={`Are you sure you want to delete the task "${task?.title}"? This action cannot be undone.`}
                confirmText="Delete Task"
                confirmColor="error"
                loading={deleting}
            />
        </StyledCard>
    );
};

export default TaskView;