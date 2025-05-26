import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Title as TitleIcon,
    Description as DescriptionIcon,
    Schedule as ScheduleIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import taskService from '../services/taskService';
import { useApiRequest } from '../hooks/useApiRequest';
import { useFormValidation } from '../hooks/useFormValidation';
import { validationRules } from '../utils/validationRules';
import FormField from './common/FormField';
import StatusMessages from './common/StatusMessages';
import MemberSelect from './task/MemberSelect';

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
        '& > *': { width: '100%' },
    },
}));

const CreateTask = ({
                        onTaskCreated,
                        onCancel,
                        currentUserId,
                        groupId,
                        groupMembers = []
                    }) => {
    const { loading, error, success, makeRequest, clearMessages } = useApiRequest();
    const { errors, validateForm, clearError } = useFormValidation({
        title: validationRules.taskTitle,
        description: validationRules.taskDescription,
        deadline: validationRules.deadline
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        assignedUserId: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? (name === 'assignedUserId' ? '' : value) : value
        }));
        clearError(name);
        clearMessages();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm(formData)) {
            return;
        }

        const taskData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            deadline: new Date(formData.deadline).toISOString(),
            groupId: groupId,
            userId: formData.assignedUserId || null
        };

        const result = await makeRequest(
            () => taskService.createTask(taskData, currentUserId),
            'Task created successfully!'
        );

        if (result.success && onTaskCreated) {
            onTaskCreated(result);
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
                    Add a new task to your group
                </Typography>
            </HeaderBox>

            <CardContent sx={{ p: 3 }}>
                <StatusMessages
                    error={error}
                    success={success}
                    onClearError={clearMessages}
                    onClearSuccess={clearMessages}
                />

                <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormField
                            name="title"
                            label="Task Title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter task title"
                            required
                            maxLength={50}
                            startIcon={<TitleIcon color="action" />}
                            error={errors.title}
                        />

                        <FormField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter task description (optional)"
                            multiline
                            rows={4}
                            maxLength={1000}
                            startIcon={<DescriptionIcon color="action" />}
                            error={errors.description}
                        />

                        <FormField
                            name="deadline"
                            label="Deadline"
                            type="datetime-local"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: minDateTime }}
                            startIcon={<ScheduleIcon color="action" />}
                            error={errors.deadline}
                        />

                        <MemberSelect
                            members={groupMembers}
                            value={formData.assignedUserId}
                            onChange={(e) => handleInputChange({
                                target: { name: 'assignedUserId', value: e.target.value }
                            })}
                            label="Assign to Member (Optional)"
                            fullWidth
                        />
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <ActionBox>
                        <Button
                            variant="outlined"
                            onClick={onCancel}
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
                            startIcon={<SaveIcon />}
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