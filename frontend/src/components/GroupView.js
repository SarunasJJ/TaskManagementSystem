import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    Card,
    CardContent,
    Tooltip,
    Fade,
    CircularProgress,
    Tabs,
    Tab,
    Alert,
    Avatar,
    Chip
} from '@mui/material';
import {
    ArrowBack,
    Group as GroupIcon,
    Home as HomeIcon,
    People as PeopleIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Message as MessageIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import groupService from '../services/groupService';
import authService from '../services/authService';
import GroupDiscussions from './GroupDiscussions';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StatsCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
    },
}));

const MemberCard = styled(Card)(({ theme }) => ({
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
    }
}));

const CreatorBadge = styled(Box)(({ theme }) => ({
    px: 1.5,
    py: 0.5,
    borderRadius: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 600,
    textAlign: 'center',
    minWidth: 'fit-content'
}));

const TabPanel = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`group-tabpanel-${index}`}
            aria-labelledby={`group-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const a11yProps = (index) => {
    return {
        id: `group-tab-${index}`,
        'aria-controls': `group-tabpanel-${index}`,
    };
};

const GroupView = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);
        fetchGroup();
    }, [groupId, navigate]);

    const fetchGroup = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await groupService.getGroup(groupId);
            if (result.success) {
                setGroup(result.data);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to load group details');
        } finally {
            setLoading(false);
        }
    };

    const isCreator = () => {
        return currentUser && group && group.creator.id === currentUser.id;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getAvatarColor = (username) => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
        const index = username ? username.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Box textAlign="center">
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading group details...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (error && !group) {
        return (
            <Container maxWidth="lg">
                <Box textAlign="center" mt={4}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button variant="contained" onClick={() => navigate('/groups')}>
                        Back to Groups
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Box>
            {/* App Bar */}
            <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Toolbar>
                    <Tooltip title="Homepage">
                        <IconButton color="inherit" onClick={() => navigate('/homepage')} sx={{ mr: 1 }}>
                            <HomeIcon />
                        </IconButton>
                    </Tooltip>
                    <IconButton color="inherit" onClick={() => navigate('/groups')} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <GroupIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {group?.name}
                    </Typography>
                    {isCreator() && (
                        <Tooltip title="Manage Group">
                            <IconButton
                                color="inherit"
                                onClick={() => navigate(`/groups/${groupId}/manage`)}
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                {/* Success/Error Alerts */}
                {success && (
                    <Fade in>
                        <Alert
                            severity="success"
                            sx={{ mt: 2 }}
                            onClose={() => setSuccess('')}
                        >
                            {success}
                        </Alert>
                    </Fade>
                )}

                {error && (
                    <Fade in>
                        <Alert
                            severity="error"
                            sx={{ mt: 2 }}
                            onClose={() => setError('')}
                        >
                            {error}
                        </Alert>
                    </Fade>
                )}

                {/* Group Header Section */}
                <StyledPaper>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <GroupIcon color="primary" sx={{ fontSize: 32 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {group.name}
                            </Typography>
                            {group.description && (
                                <Typography variant="body1" color="text.secondary">
                                    {group.description}
                                </Typography>
                            )}
                        </Box>
                        {isCreator() && (
                            <Chip
                                label="You are the creator"
                                color="primary"
                                icon={<PersonIcon />}
                                variant="outlined"
                            />
                        )}
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <StatsCard>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="h4" component="div" fontWeight="bold">
                                        {group.memberCount}
                                    </Typography>
                                    <Typography variant="body1">
                                        {group.memberCount === 1 ? 'Member' : 'Members'}
                                    </Typography>
                                </CardContent>
                            </StatsCard>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ textAlign: 'center', height: '100%' }}>
                                <CardContent>
                                    <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="h6" component="div" fontWeight="bold">
                                        Creator
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {group.creator.username}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ textAlign: 'center', height: '100%' }}>
                                <CardContent>
                                    <CalendarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="h6" component="div" fontWeight="bold">
                                        Created
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {formatDate(group.createdAt)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </StyledPaper>

                {/* Tabbed Interface */}
                <StyledPaper>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="group tabs"
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                },
                            }}
                        >
                            <Tab
                                label="Members"
                                icon={<PeopleIcon />}
                                iconPosition="start"
                                {...a11yProps(0)}
                            />
                            <Tab
                                label="Discussions"
                                icon={<MessageIcon />}
                                iconPosition="start"
                                {...a11yProps(1)}
                            />
                        </Tabs>
                    </Box>

                    {/* Members Tab Panel */}
                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 3 }}>
                            Group Members ({group.memberCount})
                        </Typography>

                        <Grid container spacing={2}>
                            {group.members.map((member) => (
                                <Grid item xs={12} sm={6} md={4} key={member.id}>
                                    <MemberCard>
                                        <CardContent sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            py: 2
                                        }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: getAvatarColor(member.username),
                                                    width: 48,
                                                    height: 48,
                                                    fontSize: '1.2rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {member.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" component="div">
                                                    {member.username}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {member.id === group.creator.id ? 'Creator' : 'Member'}
                                                </Typography>
                                            </Box>
                                            {member.id === group.creator.id && (
                                                <CreatorBadge>
                                                    CREATOR
                                                </CreatorBadge>
                                            )}
                                        </CardContent>
                                    </MemberCard>
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>

                    {/* Discussions Tab Panel */}
                    <TabPanel value={tabValue} index={1}>
                        <GroupDiscussions
                            groupId={groupId}
                            currentUser={currentUser}
                        />
                    </TabPanel>
                </StyledPaper>
            </Container>
        </Box>
    );
};

export default GroupView;