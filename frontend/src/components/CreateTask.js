import React, { useState } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Box,
    CircularProgress,
    InputAdornment,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Title as TitleIcon,
    Description as DescriptionIcon,
    Schedule as ScheduleIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 600,
    margin: '0 auto',
    boxShadow: theme.shadows[8],
    borderRadius: theme.spacing(2),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    color: theme.palette.primary.contrastText,
}));

const CreateTask = ({ onTaskCreated, currentUserId = 1 }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        groupId: 1,
        assignedUserId: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? (name === 'assignedUserId' ? '' : value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }

        if (!formData.deadline) {
            setError('Deadline is required');
            setLoading(false);
            return;
        }

        // Check if deadline is in the future
        const deadlineDate = new Date(formData.deadline);
        if (deadlineDate <= new Date()) {
            setError('Deadline must be in the future');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUserId.toString()
                },
                body: JSON.stringify({
                    ...formData,
                    deadline: new Date(formData.deadline).toISOString(),
                    assignedUserId: formData.assignedUserId || null
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Task created successfully! 🎉');
                setFormData({
                    title: '',
                    description: '',
                    deadline: '',
                    groupId: 1,
                    assignedUserId: ''
                });
                if (onTaskCreated) {
                    onTaskCreated(data);
                }
            } else {
                setError(data.message || 'Failed to create task');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error creating task:', err);
        } finally {
            setLoading(false);
        }
    };

    const minDateTime = new Date().toISOString().slice(0, 16);

    return (
        <StyledCard>
            <HeaderBox>
                <AddIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="h2" fontWeight="bold">
                    Create New Task
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Add a new task to your project
                </Typography>
            </HeaderBox>

            <CardContent sx={{ p: 3 }}>
                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError('')}
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        onClose={() => setSuccess('')}
                        sx={{ mb: 2 }}
                    >
                        {success}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        required
                        label="Task Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter task title"
                        slotProps={{
                            htmlInput: { maxLength: 100 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TitleIcon color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter task description (optional)"
                        slotProps={{
                            htmlInput: { maxLength: 1000 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                        <DescriptionIcon color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        fullWidth
                        required
                        type="datetime-local"
                        label="Deadline"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        slotProps={{
                            inputLabel: { shrink: true },
                            htmlInput: { min: minDateTime },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ScheduleIcon color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        fullWidth
                        required
                        type="number"
                        label="Group ID"
                        name="groupId"
                        value={formData.groupId}
                        onChange={handleInputChange}
                        placeholder="Group ID"
                        helperText="This is temporary until group management is implemented"
                        slotProps={{
                            htmlInput: { min: 1 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <GroupIcon color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        fullWidth
                        type="number"
                        label="Assign to User (Optional)"
                        name="assignedUserId"
                        value={formData.assignedUserId}
                        onChange={handleInputChange}
                        placeholder="User ID to assign task to"
                        helperText="Leave empty if not assigning to anyone yet"
                        slotProps={{
                            htmlInput: { min: 1 },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{ mb: 4 }}
                    />

                    <Divider sx={{ mb: 3 }} />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{
                            py: 1.5,
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8, #6a419a)',
                                transform: 'translateY(-2px)',
                                boxShadow: (theme) => theme.shadows[8],
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {loading ? 'Creating Task...' : 'Create Task'}
                    </Button>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default CreateTask;