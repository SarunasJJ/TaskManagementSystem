import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Chip,
    InputAdornment,
    Fade,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ArrowBack,
    Group as GroupIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import groupService from '../services/groupService';
import authService from '../services/authService';
import Navbar from './Navbar';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
}));

const FormBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
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

const AvailabilityChip = styled(Chip)(({ theme, available }) => ({
    marginTop: theme.spacing(1),
    '& .MuiChip-icon': {
        fontSize: '1rem',
    },
    ...(available === true && {
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.contrastText,
    }),
    ...(available === false && {
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.contrastText,
    }),
    ...(available === null && {
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.contrastText,
    }),
}));

const CreateGroup = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [nameAvailability, setNameAvailability] = useState({
        checking: false,
        available: null,
        message: ''
    });
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field-specific errors
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear general error
        if (generalError) {
            setGeneralError('');
        }

        // Check name availability as user types
        if (name === 'name' && value.trim().length >= 3) {
            checkNameAvailability(value.trim());
        } else if (name === 'name') {
            setNameAvailability({
                checking: false,
                available: null,
                message: ''
            });
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

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Group name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Group name must be at least 3 characters';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Group name must be less than 50 characters';
        } else if (nameAvailability.available === false) {
            newErrors.name = 'Group name is already taken';
        }

        // Description validation
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            const result = await groupService.createGroup(formData);

            if (result.success) {
                navigate('/homepage', {
                    state: {
                        message: `Group "${formData.name}" created successfully!`,
                        severity: 'success'
                    }
                });
            } else {
                setGeneralError(result.error);
            }
        } catch (error) {
            setGeneralError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/homepage');
    };

    const getNameFieldHelperText = () => {
        if (nameAvailability.checking) {
            return 'Checking availability...';
        }
        if (nameAvailability.message) {
            return nameAvailability.message;
        }
        if (errors.name) {
            return errors.name;
        }
        return `${formData.name.length}/50 characters`;
    };

    const getNameFieldError = () => {
        return !!(errors.name || nameAvailability.available === false);
    };

    const renderAvailabilityChip = () => {
        if (nameAvailability.checking) {
            return (
                <AvailabilityChip
                    size="small"
                    icon={<CircularProgress size={16} />}
                    label="Checking..."
                    available={null}
                />
            );
        }

        if (nameAvailability.available === true) {
            return (
                <AvailabilityChip
                    size="small"
                    icon={<CheckIcon />}
                    label="Available"
                    available={true}
                />
            );
        }

        if (nameAvailability.available === false) {
            return (
                <AvailabilityChip
                    size="small"
                    icon={<CloseIcon />}
                    label="Taken"
                    available={false}
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
                    <HeaderBox>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Create New Group
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Start collaborating with your team members
                            </Typography>
                        </Box>
                    </HeaderBox>

                    {generalError && (
                        <Fade in>
                            <Alert
                                severity="error"
                                sx={{ mb: 3 }}
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => setGeneralError('')}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                {generalError}
                            </Alert>
                        </Fade>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <FormBox>
                            <Box>
                                <TextField
                                    fullWidth
                                    label="Group Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={getNameFieldError()}
                                    helperText={getNameFieldHelperText()}
                                    required
                                    placeholder="Enter group name"
                                    inputProps={{ maxLength: 50 }}
                                    InputProps={{
                                        endAdornment: nameAvailability.checking && (
                                            <InputAdornment position="end">
                                                <CircularProgress size={20} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box sx={{ mt: 1 }}>
                                    {renderAvailabilityChip()}
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                error={!!errors.description}
                                helperText={
                                    errors.description ||
                                    `${formData.description.length}/500 characters (Optional)`
                                }
                                placeholder="Describe the purpose of this group..."
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 500 }}
                            />
                        </FormBox>

                        <ActionBox>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                disabled={isLoading}
                                size="large"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={
                                    isLoading ||
                                    nameAvailability.available === false ||
                                    nameAvailability.checking ||
                                    !formData.name.trim()
                                }
                                size="large"
                                startIcon={isLoading ? <CircularProgress size={20} /> : <GroupIcon />}
                            >
                                {isLoading ? 'Creating Group...' : 'Create Group'}
                            </Button>
                        </ActionBox>
                    </Box>
                </StyledPaper>
            </Container>
        </Box>
    );
};

export default CreateGroup;