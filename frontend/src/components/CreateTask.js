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
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Title as TitleIcon,
    Description as DescriptionIcon,
    Schedule as ScheduleIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    maxWidth: 800,
    margin: '0 auto',
    boxShadow: theme.shadows[8],
    borderRadius: theme.spacing(2),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
    color: theme.palette.primary.contrastText,
}));

const ActionBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column-reverse',
        '& > *': {
            width: '100%',
        },
    },
}));

const CreateTask = ({
                        onTaskCreated,
                        onCancel,
                        currentUserId,
                        groupId,
                        groupMembers = []
                    }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
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
            const taskData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                deadline: new Date(formData.deadline).toISOString(),
                groupId: groupId,
                userId: formData.assignedUserId || null
            };

            const response = await fetch('http://localhost:8080/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUserId.toString()
                },
                body: JSON.stringify(taskData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Task created successfully! 🎉');
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

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    const minDateTime = new Date().toISOString().slice(0, 16);

    const getAssignedMember = () => {
        return groupMembers.find(member => member.id.toString() === formData.assignedUserId);
    };

    const getAvatarColor = (username) => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <StyledCard>
            <HeaderBox>
                <AddIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="h2" fontWeight="bold">
                    Create New Task
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Add a new task to your group
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
                        inputProps={{ maxLength: 50 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <TitleIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                        helperText={`${formData.title.length}/50 characters`}
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
                        inputProps={{ maxLength: 1000 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                    <DescriptionIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                        helperText={`${formData.description.length}/1000 characters`}
                    />

                    <TextField
                        fullWidth
                        required
                        type="datetime-local"
                        label="Deadline"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: minDateTime }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <ScheduleIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />

                    <FormControl fullWidth sx={{ mb: 4 }}>
                        <InputLabel>Assign to Member (Optional)</InputLabel>
                        <Select
                            name="assignedUserId"
                            value={formData.assignedUserId}
                            onChange={handleInputChange}
                            label="Assign to Member (Optional)"
                            startAdornment={
                                <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                </InputAdornment>
                            }
                            renderValue={(selected) => {
                                if (!selected) return '';
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
                                ) : '';
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

                    <Divider sx={{ mb: 3 }} />

                    <ActionBox>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={loading}
                            size="large"
                            startIcon={<CancelIcon />}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
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
                    </ActionBox>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default CreateTask;