import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import TaskStatusSelect from './TaskStatusSelect';

const getStatusConfig = (status) => {
    const configs = {
        'TODO': { label: 'To Do', color: 'info', bgColor: '#e3f2fd' },
        'IN_PROGRESS': { label: 'In Progress', color: 'warning', bgColor: '#fff3e0' },
        'DONE': { label: 'Done', color: 'success', bgColor: '#e8f5e8' }
    };
    return configs[status] || configs['TODO'];
};

const TaskHeader = ({
                        task,
                        onBack,
                        onDelete,
                        editingStatus,
                        newStatus,
                        onStatusEdit,
                        onStatusSave,
                        onStatusCancel
                    }) => {
    const statusConfig = getStatusConfig(task.status);

    return (
        <Box sx={{
            padding: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '0 0 0 0',
            color: 'white'
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                {onBack && (
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={onBack}
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
                            onClick={onDelete}
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <TaskStatusSelect
                                value={newStatus}
                                onChange={(e) => onStatusEdit(e.target.value)}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    color: 'inherit',
                                    '& .MuiSelect-icon': { color: 'inherit' }
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={onStatusSave}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                                >
                                    Save
                                </Button>
                                <Button
                                    size="small"
                                    onClick={onStatusCancel}
                                    sx={{ color: 'inherit' }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Chip
                            label={statusConfig.label}
                            color={statusConfig.color}
                            size="large"
                            onClick={() => onStatusEdit(task.status)}
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
        </Box>
    );
};

export default TaskHeader;