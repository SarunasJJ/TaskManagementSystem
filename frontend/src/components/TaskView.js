import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Paper,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Create as CreateIcon,
    Update as UpdateIcon,
    Group as GroupIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useApiRequest } from '../hooks/useApiRequest';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils';
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';
import StatusMessages from './common/StatusMessages';
import ConfirmDialog from './common/ConfirmDialog';
import UserAvatar from './common/UserAvatar';
import TaskHeader from './task/TaskHeader';
import TaskInfoCard from './task/TaskInfoCard';
import TaskAssignmentDialog from './task/TaskAssignmentDialog';

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 900,
    margin: '0 auto',
    boxShadow: theme.shadows[12],
    borderRadius: theme.spacing(2),
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
        const result = await makeRequest(
            () => fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                headers: { 'User-Id': currentUserId.toString() }
            }).then(res => res.json())
        );

        if (result) {
            setTask(result);
            setNewStatus(result.status);
            setNewAssignedUserId(result.assignedUserId?.toString() || '');
        }
    };

    const fetchGroupMembers = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/groups/${groupId}`, {
                headers: { 'User-Id': currentUserId.toString() }
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
                headers: { 'User-Id': currentUserId.toString() }
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
                response = await fetch(`http://localhost:8080/api/tasks/${taskId}/assign/${newAssignedUserId}`, {
                    method: 'PUT',
                    headers: { 'User-Id': currentUserId.toString() }
                });
            } else {
                response = await fetch(`http://localhost:8080/api/tasks/${taskId}/assign`, {
                    method: 'PUT',
                    headers: { 'User-Id': currentUserId.toString() }
                });
            }

            if (response.ok) {
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
        setDeleting(true);
        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'User-Id': currentUserId.toString() }
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

    const getAssignedMember = () => {
        return groupMembers.find(member => member.id.toString() === newAssignedUserId);
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
                        <TaskInfoCard
                            icon={ScheduleIcon}
                            title="Deadline"
                            iconColor={deadline.isOverdue ? 'error.main' : 'warning.main'}
                        >
                            <Typography
                                variant="body1"
                                fontWeight="bold"
                                color={deadline.isOverdue ? 'error.main' : 'text.primary'}
                                sx={{ mb: 1 }}
                            >
                                {formatDateTime(task.deadline)}
                            </Typography>
                            <Chip
                                label={deadline.text}
                                size="small"
                                color={deadline.isOverdue ? 'error' : 'default'}
                                variant={deadline.isOverdue ? 'filled' : 'outlined'}
                            />
                        </TaskInfoCard>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TaskInfoCard icon={GroupIcon} title="Group" iconColor="info.main">
                            <Typography variant="body1" fontWeight="bold">
                                Group ID: {task.groupId}
                            </Typography>
                        </TaskInfoCard>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TaskInfoCard icon={AssignmentIcon} title="Assignment" iconColor="success.main">
                            <Box display="flex" alignItems="center" justifyContent="space-between">
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
                            </Box>
                        </TaskInfoCard>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TaskInfoCard icon={CreateIcon} title="Created By" iconColor="secondary.main">
                            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                                {task.createdByUsername}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDateTime(task.createdAt)}
                            </Typography>
                        </TaskInfoCard>
                    </Grid>

                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <Grid item xs={12} sm={6} md={3}>
                            <TaskInfoCard icon={UpdateIcon} title="Last Updated" iconColor="grey.600">
                                <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(task.updatedAt)}
                                </Typography>
                            </TaskInfoCard>
                        </Grid>
                    )}
                </Grid>
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