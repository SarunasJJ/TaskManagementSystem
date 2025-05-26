import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import groupService from '../services/groupService';
import { useAuth } from '../hooks/useAuth';
import { useApiRequest } from '../hooks/useApiRequest';
import Navbar from './Navbar';
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';
import PageHeader from './common/PageHeader';
import CreateTask from './CreateTask';

const CreateTaskPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { loading, error, makeRequest } = useApiRequest();

    const [group, setGroup] = useState(null);

    useEffect(() => {
        if (user && groupId) {
            fetchGroup();
        }
    }, [groupId, user]);

    const fetchGroup = async () => {
        const result = await makeRequest(() => groupService.getGroup(groupId));
        if (result.success) {
            setGroup(result.data);
        } else {
            // Don't navigate immediately, let error state handle it
            console.error('Failed to load group:', result.error);
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

    const handleBackToHomepage = () => {
        navigate('/homepage');
    };

    // Show loading while authenticating or fetching group
    if (authLoading || loading) {
        return (
            <Box>
                <Navbar user={user} />
                <LoadingState message={authLoading ? "Authenticating..." : "Loading group details..."} />
            </Box>
        );
    }

    // Show error if group couldn't be loaded
    if (error && !group) {
        return (
            <Box>
                <Navbar user={user} />
                <Container maxWidth="md">
                    <ErrorState
                        title="Unable to Load Group"
                        message={error || "Group not found or you don't have access to create tasks in this group"}
                        onAction={handleBackToHomepage}
                        actionText="Back to Homepage"
                    />
                </Container>
            </Box>
        );
    }

    // Don't render CreateTask until we have group data
    if (!group) {
        return (
            <Box>
                <Navbar user={user} />
                <LoadingState message="Loading group details..." />
            </Box>
        );
    }

    return (
        <Box>
            <Navbar user={user} />
            <Container maxWidth="md" sx={{ mt: 2 }}>
                <PageHeader
                    title={`Create Task for "${group.name}"`}
                    onBack={handleCancel}
                    backTooltip="Back to Group"
                />

                <CreateTask
                    currentUserId={user?.id}
                    groupId={parseInt(groupId)}
                    groupMembers={group.members || []}
                    onTaskCreated={handleTaskCreated}
                    onCancel={handleCancel}
                />
            </Container>
        </Box>
    );
};

export default CreateTaskPage;