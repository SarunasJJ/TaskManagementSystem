import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import authService from '../services/authService';
import groupService from '../services/groupService';
import Navbar from './Navbar';
import CreateTask from './CreateTask';

const CreateTaskPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchGroup();
    }, [groupId, navigate]);

    const fetchGroup = async () => {
        try {
            const result = await groupService.getGroup(groupId);
            if (result.success) {
                setGroup(result.data);
            } else {
                navigate('/homepage'); // Redirect if group not found
            }
        } catch (error) {
            navigate('/homepage');
        } finally {
            setLoading(false);
        }
    };

    const handleTaskCreated = () => {
        navigate(`/groups/${groupId}`, {
            state: {
                message: 'Task created successfully!',
                severity: 'success'
            }
        });
    };

    const handleCancel = () => {
        navigate(`/groups/${groupId}`);
    };

    if (loading) {
        return (
            <Box>
                <Navbar user={user} />
                <Container>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <Typography variant="h6" color="text.secondary">
                            Loading...
                        </Typography>
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <Navbar user={user} />
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title="Back to Group">
                        <IconButton onClick={handleCancel} color="primary">
                            <ArrowBack />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h5" color="text.secondary">
                        Create Task for "{group?.name}"
                    </Typography>
                </Box>

                <CreateTask
                    currentUserId={user?.id}
                    groupId={parseInt(groupId)}
                    groupMembers={group?.members || []}
                    onTaskCreated={handleTaskCreated}
                    onCancel={handleCancel}
                />
            </Container>
        </Box>
    );
};

export default CreateTaskPage;