import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Button,
    Box,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    Group as GroupIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import groupService from '../services/groupService';
import { useAuth } from '../hooks/useAuth';
import { useApiRequest } from '../hooks/useApiRequest';
import { useFormValidation } from '../hooks/useFormValidation';
import { validationRules } from '../utils/validationRules';
import Navbar from './Navbar';
import FormField from './common/FormField';
import StatusMessages from './common/StatusMessages';
import PageHeader from './common/PageHeader';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const CreateGroup = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { loading, error, makeRequest, clearMessages } = useApiRequest();
    const { errors, validateForm, clearError } = useFormValidation({
        name: validationRules.groupName,
        description: validationRules.groupDescription
    });

    const [formData, setFormData] = useState({ name: '', description: '' });
    const [nameAvailability, setNameAvailability] = useState({
        checking: false,
        available: null,
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearError(name);
        clearMessages();

        // Check name availability as user types
        if (name === 'name' && value.trim().length >= 3) {
            checkNameAvailability(value.trim());
        } else if (name === 'name') {
            setNameAvailability({ checking: false, available: null, message: '' });
        }
    };

    const checkNameAvailability = async (name) => {
        setNameAvailability({ checking: true, available: null, message: '' });
        try {
            const result = await groupService.checkGroupNameAvailability(name);
            if (result.success) {
                setNameAvailability({
                    checking: false,
                    available: result.available,
                    message: result.available ? 'Group name is available!' : 'Group name is already taken'
                });
            } else {
                setNameAvailability({
                    checking: false,
                    available: null,
                    message: 'Could not check availability'
                });
            }
        } catch (error) {
            setNameAvailability({
                checking: false,
                available: null,
                message: 'Error checking availability'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm(formData) || nameAvailability.available === false) {
            return;
        }

        const result = await makeRequest(() => groupService.createGroup(formData));
        if (result.success) {
            navigate('/homepage', {
                state: {
                    message: `Group "${formData.name}" created successfully!`,
                    severity: 'success'
                }
            });
        }
    };

    const getNameFieldHelperText = () => {
        if (nameAvailability.checking) return 'Checking availability...';
        if (nameAvailability.message) return nameAvailability.message;
        if (errors.name) return errors.name;
        return `${formData.name.length}/50 characters`;
    };

    const renderAvailabilityChip = () => {
        if (nameAvailability.checking) {
            return (
                <Chip
                    size="small"
                    icon={<CircularProgress size={16} />}
                    label="Checking..."
                    sx={{ mt: 1, bgcolor: 'warning.light' }}
                />
            );
        }

        if (nameAvailability.available === true) {
            return (
                <Chip
                    size="small"
                    icon={<CheckIcon />}
                    label="Available"
                    sx={{ mt: 1, bgcolor: 'success.light', color: 'success.contrastText' }}
                />
            );
        }

        if (nameAvailability.available === false) {
            return (
                <Chip
                    size="small"
                    icon={<CloseIcon />}
                    label="Taken"
                    sx={{ mt: 1, bgcolor: 'error.light', color: 'error.contrastText' }}
                />
            );
        }

        return null;
    };

    return (
        <Box>
            <Navbar user={user} />
            <Container maxWidth="md">
                <StyledPaper elevation={3}>
                    <PageHeader
                        title="Create New Group"
                        subtitle="Start collaborating with your team members"
                    />

                    <StatusMessages
                        error={error}
                        onClearError={clearMessages}
                    />

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <FormField
                                    name="name"
                                    label="Group Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name || (nameAvailability.available === false ? nameAvailability.message : '')}
                                    helperText={getNameFieldHelperText()}
                                    placeholder="Enter group name"
                                    required
                                    maxLength={50}
                                />
                                {renderAvailabilityChip()}
                            </Box>

                            <FormField
                                name="description"
                                label="Description"
                                value={formData.description}
                                onChange={handleChange}
                                error={errors.description}
                                helperText={`${formData.description.length}/500 characters (Optional)`}
                                placeholder="Describe the purpose of this group..."
                                multiline
                                rows={4}
                                maxLength={500}
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                            mt: 3,
                            '@media (max-width: 600px)': {
                                flexDirection: 'column-reverse',
                                '& > *': { width: '100%' }
                            }
                        }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/homepage')}
                                disabled={loading}
                                size="large"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={
                                    loading ||
                                    nameAvailability.available === false ||
                                    nameAvailability.checking ||
                                    !formData.name.trim()
                                }
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} /> : <GroupIcon />}
                            >
                                {loading ? 'Creating Group...' : 'Create Group'}
                            </Button>
                        </Box>
                    </Box>
                </StyledPaper>
            </Container>
        </Box>
    );
};

export default CreateGroup;