import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Button,
    Grid,
    IconButton,
    Tooltip, Box
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import groupService from '../services/groupService';
import { useAuth } from '../hooks/useAuth';
import { useApiRequest } from '../hooks/useApiRequest';
import Navbar from './Navbar';
import LoadingState from './common/LoadingState';
import StatusMessages from './common/StatusMessages';
import PageHeader from './common/PageHeader';
import EmptyState from './common/EmptyState';
import GroupCard from './group/GroupCard';

const Homepage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const { loading, error, success, makeRequest, setSuccess, clearMessages } = useApiRequest();

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (user) {
            fetchGroups();
        }

        // Check for navigation state message
        if (location.state?.message) {
            setSuccess(location.state.message);
            navigate(location.pathname, { replace: true });
        }
    }, [user, location]);

    const fetchGroups = async () => {
        const result = await makeRequest(() => groupService.getMyGroups());
        if (result.success) {
            setGroups(result.data);
        }
    };

    if (authLoading || loading) {
        return (
            <Box>
                <Navbar user={user} />
                <LoadingState message="Loading your groups..." />
            </Box>
        );
    }

    return (
        <Box>
            <Navbar user={user} />
            <Container sx={{ mt: 3 }}>
                <StatusMessages
                    error={error}
                    success={success}
                    onClearError={clearMessages}
                    onClearSuccess={clearMessages}
                />

                <PageHeader
                    title="My Groups"
                    subtitle="Manage your groups and collaborate with team members"
                    actions={[
                        <Tooltip key="refresh" title="Refresh">
                            <IconButton onClick={fetchGroups} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>,
                        <Button
                            key="create"
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/groups/create"
                            size="large"
                        >
                            Create Group
                        </Button>
                    ]}
                />

                {groups.length === 0 ? (
                    <EmptyState
                        icon={GroupIcon}
                        title="No Groups Yet"
                        description="Create your first group to start collaborating with team members!"
                        actionText="Create Your First Group"
                        onAction={() => navigate('/groups/create')}
                    />
                ) : (
                    <Grid container spacing={3}>
                        {groups.map((group) => (
                            <Grid item xs={12} sm={6} md={4} key={group.id}>
                                <GroupCard group={group} currentUserId={user?.id} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Homepage;