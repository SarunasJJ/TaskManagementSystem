import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Box,
    Card,
    CardContent,
    CardActions,
    Grid,
    Chip,
    Avatar,
    AppBar,
    Toolbar,
    IconButton,
    Alert,
    Fade,
    CircularProgress,
    Paper,
    Tooltip,
    AvatarGroup,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    CalendarToday as CalendarIcon,
    People as PeopleIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import groupService from '../services/groupService';
import authService from '../services/authService';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    marginBottom: theme.spacing(3),
}));

const GroupCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const StatsBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1),
    margin: theme.spacing(2, 0),
}));

const StatItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const EmptyStateBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6),
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
}));

const CreatorChip = styled(Chip)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    '& .MuiChip-icon': {
        color: 'white',
    },
}));

const GroupsList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messageSeverity, setMessageSeverity] = useState('success');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchGroups();

        // Check for navigation state message
        if (location.state?.message) {
            setMessage(location.state.message);
            setMessageSeverity(location.state.severity || 'success');
            // Clear the message from location state
            navigate(location.pathname, { replace: true });
        }
    }, [navigate, location]);

    const fetchGroups = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await groupService.getMyGroups();
            if (result.success) {
                setGroups(result.data);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isCreator = (group) => {
        return user && group.creator.id === user.id;
    };

    const getAvatarColor = (username) => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (loading) {
        return (
            <Box>
                <StyledAppBar position="static">
                    <Toolbar>
                        <GroupIcon sx={{ mr: 2 }} />
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            My Groups
                        </Typography>
                    </Toolbar>
                </StyledAppBar>
                <Container>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <Box textAlign="center">
                            <CircularProgress size={60} sx={{ mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                Loading your groups...
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <StyledAppBar position="static">
                <Toolbar>
                    <Tooltip title="Homepage">
                        <IconButton color="inherit" onClick={() => navigate('/homepage')} sx={{ mr: 1 }}>
                            <HomeIcon />
                        </IconButton>
                    </Tooltip>
                    <GroupIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        My Groups
                    </Typography>
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1">
                                Welcome, {user.username}!
                            </Typography>
                            <Tooltip title="Logout">
                                <IconButton color="inherit" onClick={handleLogout}>
                                    <LogoutIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Toolbar>
            </StyledAppBar>

            <Container>
                {message && (
                    <Fade in>
                        <Alert
                            severity={messageSeverity}
                            sx={{ mb: 3 }}
                            onClose={() => setMessage('')}
                        >
                            {message}
                        </Alert>
                    </Fade>
                )}

                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Groups Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your groups and collaborate with team members
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Refresh">
                            <IconButton onClick={fetchGroups} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/groups/create"
                            size="large"
                        >
                            Create Group
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} action={
                        <Button color="inherit" size="small" onClick={fetchGroups}>
                            Try Again
                        </Button>
                    }>
                        {error}
                    </Alert>
                )}

                {groups.length === 0 && !error ? (
                    <EmptyStateBox>
                        <GroupIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h4" gutterBottom color="text.secondary">
                            No Groups Yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first group to start collaborating with team members!
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/groups/create"
                        >
                            Create Your First Group
                        </Button>
                    </EmptyStateBox>
                ) : (
                    <Grid container spacing={3}>
                        {groups.map((group) => (
                            <Grid item xs={12} sm={6} md={4} key={group.id}>
                                <GroupCard>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" component="h2" noWrap sx={{ flex: 1, mr: 1 }}>
                                                {group.name}
                                            </Typography>
                                            {isCreator(group) && (
                                                <CreatorChip
                                                    icon={<PersonIcon />}
                                                    label="Creator"
                                                    size="small"
                                                />
                                            )}
                                        </Box>

                                        {group.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {group.description}
                                            </Typography>
                                        )}

                                        <StatsBox>
                                            <StatItem>
                                                <PeopleIcon color="primary" />
                                                <Typography variant="h6" color="primary">
                                                    {group.memberCount}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {group.memberCount === 1 ? 'Member' : 'Members'}
                                                </Typography>
                                            </StatItem>
                                            <StatItem>
                                                <CalendarIcon color="primary" />
                                                <Typography variant="body2" color="primary">
                                                    {formatDate(group.createdAt)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Created
                                                </Typography>
                                            </StatItem>
                                        </StatsBox>

                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Members:
                                            </Typography>
                                            <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                                                {group.members.map((member) => (
                                                    <Tooltip key={member.id} title={`${member.username}${member.id === group.creator.id ? ' (Creator)' : ''}`}>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: getAvatarColor(member.username),
                                                                width: 32,
                                                                height: 32,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {member.username.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    </Tooltip>
                                                ))}
                                            </AvatarGroup>
                                        </Box>
                                    </CardContent>

                                    <Divider />

                                    <CardActions sx={{ p: 2 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<VisibilityIcon />}
                                            component={Link}
                                            to={`/groups/${group.id}`}
                                        >
                                            View Group
                                        </Button>
                                    </CardActions>
                                </GroupCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default GroupsList;