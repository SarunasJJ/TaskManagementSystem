import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    Tabs,
    Tab,
    Avatar,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Home as HomeIcon,
    Group as GroupIcon,
    Add as AddIcon,
    Logout as LogoutIcon,
    Dashboard as DashboardIcon,
    Assignment as TaskIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import authService from '../services/authService';
import groupService from '../services/groupService';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    marginBottom: theme.spacing(3),
}));

const StatsCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(3),
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
    },
}));

const ActionCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[8],
    },
}));

const WelcomeBox = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(3),
    textAlign: 'center',
}));

const Homepage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [groupCount, setGroupCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    // Map routes to tab indices
    const getTabValue = (pathname) => {
        if (pathname === '/homepage') return 0;
        if (pathname === '/groups') return 1;
        if (pathname === '/groups/create') return 2;
        return 0;
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
            fetchGroupCount();
        }

        // Set active tab based on current route
        setTabValue(getTabValue(location.pathname));
    }, [navigate, location.pathname]);

    const fetchGroupCount = async () => {
        try {
            const result = await groupService.getMyGroups();
            if (result.success) {
                setGroupCount(result.data.length);
            }
        } catch (error) {
            console.error('Failed to fetch group count:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const routes = ['/homepage', '/groups', '/groups/create'];
        navigate(routes[newValue]);
    };

    const quickActions = [
        {
            title: 'View My Groups',
            description: 'See all groups you\'re part of and manage your collaborations',
            icon: <GroupIcon sx={{ fontSize: 40 }} />,
            link: '/groups',
            color: 'primary'
        },
        {
            title: 'Create New Group',
            description: 'Start a new project and invite team members to collaborate',
            icon: <AddIcon sx={{ fontSize: 40 }} />,
            link: '/groups/create',
            color: 'secondary'
        }
    ];

    if (!user) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box>
            <StyledAppBar position="static">
                <Toolbar>
                    <DashboardIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Task Management System
                    </Typography>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            mr: 3,
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-selected': {
                                    color: 'white'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'white'
                            }
                        }}
                    >
                        <Tab icon={<HomeIcon />} label="Home" />
                        <Tab icon={<GroupIcon />} label="Groups" />
                        <Tab icon={<AddIcon />} label="Create" />
                    </Tabs>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                            {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body1">
                            {user.username}
                        </Typography>
                        <Tooltip title="Logout">
                            <IconButton color="inherit" onClick={handleLogout}>
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </StyledAppBar>

            <Container maxWidth="lg">
                <WelcomeBox>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
                        Welcome to Your Workspace
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Manage your groups and collaborate with team members effectively
                    </Typography>
                </WelcomeBox>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <StatsCard>
                            <PeopleIcon sx={{ fontSize: 48, mb: 1 }} />
                            <Typography variant="h3" component="div" fontWeight="bold">
                                {loading ? <CircularProgress size={24} color="inherit" /> : groupCount}
                            </Typography>
                            <Typography variant="h6">
                                My Groups
                            </Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StatsCard>
                            <TaskIcon sx={{ fontSize: 48, mb: 1 }} />
                            <Typography variant="h3" component="div" fontWeight="bold">
                                0
                            </Typography>
                            <Typography variant="h6">
                                Active Tasks
                            </Typography>
                        </StatsCard>
                    </Grid>
                </Grid>

                {/* Quick Actions */}
                <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
                    Quick Actions
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {quickActions.map((action, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <ActionCard>
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                                    <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                                        {action.icon}
                                    </Box>
                                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                                        {action.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        {action.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        component={Link}
                                        to={action.link}
                                        startIcon={action.icon}
                                        fullWidth
                                    >
                                        {action.title}
                                    </Button>
                                </CardContent>
                            </ActionCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Homepage;