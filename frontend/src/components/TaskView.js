import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    Chip,
    IconButton,
    Tooltip, Button, DialogActions, Dialog, DialogTitle, DialogContent, Alert
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
    const [taskVersion, setTaskVersion] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [conflictDialog, setConflictDialog] = useState(false);
    const [conflictData, setConflictData] = useState(null);
    const [editingData, setEditingData] = useState(null);

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
            setTaskVersion(result.data.version);
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
            const updateData = {
                version: taskVersion,
                status: newStatus
            };

            const result = await taskService.updateTask(taskId, updateData, currentUserId);

            if (result.success) {
                setTask(prev => ({ ...prev, status: newStatus }));
                setTaskVersion(prev => prev + 1); // ✅ Increment version optimistically
                setSuccess('Task status updated successfully!');
                setEditingStatus(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                if (result.currentVersion && result.currentData) {
                    handleOptimisticLockConflict(result, { status: newStatus });
                } else {
                    setError(result.error);
                }
            }
        } catch (error) {
            setError('Failed to update task status');
        }
    };

    const handleOptimisticLockConflict = (conflictResult, userChanges) => {
        setConflictData({
            message: conflictResult.message,
            currentVersion: conflictResult.currentVersion,
            currentData: conflictResult.currentData,
            userChanges: userChanges
        });
        setEditingData(userChanges);
        setConflictDialog(true);
    };

    const handleForceUpdate = async () => {
        try {
            const updateData = {
                version: conflictData.currentVersion,
                ...editingData
            };

            const result = await taskService.updateTask(taskId, updateData, currentUserId);

            if (result.success) {
                await fetchTask(); // Refresh with latest data
                setSuccess('Task updated successfully!');
                setConflictDialog(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                setError('Failed to force update: ' + result.error);
            }
        } catch (error) {
            setError('Failed to force update');
        }
    };

    const handleRefreshAndRetry = () => {
        fetchTask();
        setTask(conflictData.currentData);
        setTaskVersion(conflictData.currentVersion);
        setConflictDialog(false);
        setSuccess('Task refreshed with latest data. Please make your changes again.');
    };

    const handleMergeChanges = () => {
        setTask(conflictData.currentData);
        setTaskVersion(conflictData.currentVersion);
        setConflictDialog(false);

        setError(`Task was updated by another user. Current data loaded. Your changes: ${JSON.stringify(editingData)}`);
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
            <Dialog open={conflictDialog} onClose={() => setConflictDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ color: 'warning.main' }}>
                    Data Conflict Detected
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        What would you like to do?
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Your Changes:</strong>
                        </Typography>
                        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1, mb: 2 }}>
                            <pre>{JSON.stringify(editingData, null, 2)}</pre>
                        </Box>

                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Current Data (from another user):</strong>
                        </Typography>
                        <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1 }}>
                            <Typography><strong>Title:</strong> {conflictData?.currentData?.title}</Typography>
                            <Typography><strong>Status:</strong> {conflictData?.currentData?.status}</Typography>
                            <Typography><strong>Description:</strong> {conflictData?.currentData?.description}</Typography>
                            {/* Show other relevant fields */}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Button
                            variant="outlined"
                            onClick={handleRefreshAndRetry}
                            sx={{ flex: 1 }}
                        >
                            Refresh & Retry
                            <Typography variant="caption" display="block">
                                Load latest data, lose my changes
                            </Typography>
                        </Button>

                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleMergeChanges}
                            sx={{ flex: 1 }}
                        >
                            Manual Merge
                            <Typography variant="caption" display="block">
                                Load latest data, keep editing
                            </Typography>
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleForceUpdate}
                            sx={{ flex: 1 }}
                        >
                            Force Overwrite
                            <Typography variant="caption" display="block">
                                Overwrite with my changes
                            </Typography>
                        </Button>
                    </Box>

                    <Button onClick={() => setConflictDialog(false)} sx={{ mt: 1 }}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledCard>
    );
};

export default TaskView;