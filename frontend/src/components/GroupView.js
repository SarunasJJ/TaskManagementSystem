import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Divider,
    Card,
    CardContent,
    Grid,
    Tooltip,
    Fade,
    CircularProgress,
    AppBar,
    Toolbar,
    Fab,
    Collapse
} from '@mui/material';
import {
    ArrowBack,
    PersonAdd as PersonAddIcon,
    Delete as DeleteIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Close as CloseIcon,
    Check as CheckIcon,
    Settings as SettingsIcon,
    People as PeopleIcon,
    CalendarToday as CalendarIcon,
    Edit as EditIcon,
    Warning as WarningIcon,
    Home as HomeIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import groupService from '../services/groupService';
import authService from '../services/authService';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StatsCard = styled(Card)(({ theme }) => ({
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
}));

const MemberAvatar = styled(Avatar)(({ theme, username }) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return {
        backgroundColor: colors[index],
        width: 48,
        height: 48,
        fontSize: '1.2rem',
        fontWeight: 600,
    };
});

const ManagementFab = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    },
}));

const GroupView = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [showManagement, setShowManagement] = useState(false);

    // Add Member Dialog State
    const [addMemberDialog, setAddMemberDialog] = useState(false);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    // Remove Member Dialog State
    const [removeMemberDialog, setRemoveMemberDialog] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [removingMember, setRemovingMember] = useState(false);

    // Delete Group Dialog State
    const [deleteGroupDialog, setDeleteGroupDialog] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

    const handleAddMember = async () => {
        if (!newMemberUsername.trim()) return;

        setAddingMember(true);
        setError('');
        setSuccess('');

        try {
            const result = await groupService.addMember(groupId, newMemberUsername.trim());
            if (result.success) {
                setGroup(result.data);
                setSuccess(`${newMemberUsername} has been added to the group!`);
                setNewMemberUsername('');
                setAddMemberDialog(false);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;

        setRemovingMember(true);
        setError('');
        setSuccess('');

        try {
            const result = await groupService.removeMember(groupId, memberToRemove.id);
            if (result.success) {
                setGroup(result.data);
                setSuccess(`${memberToRemove.username} has been removed from the group!`);
                setRemoveMemberDialog(false);
                setMemberToRemove(null);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to remove member');
        } finally {
            setRemovingMember(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (deleteConfirmText !== group.name) return;

        setDeletingGroup(true);
        setError('');

        try {
            const result = await groupService.deleteGroup(groupId);
            if (result.success) {
                navigate('/groups', {
                    state: {
                        message: `Group "${group.name}" has been deleted successfully.`,
                        severity: 'success'
                    }
                });
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to delete group');
        } finally {
            setDeletingGroup(false);
        }
    };

    const openRemoveMemberDialog = (member) => {
        setMemberToRemove(member);
        setRemoveMemberDialog(true);
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
            <Container maxWidth="md">
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
                </Toolbar>
            </AppBar>

            <Container maxWidth="md">
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

                {/* Group Info Section */}
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

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <StatsCard>
                                <CardContent>
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
                            <Card sx={{ textAlign: 'center' }}>
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
                            <Card sx={{ textAlign: 'center' }}>
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

                {/* Members Section */}
                <StyledPaper>
                    <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 3 }}>
                        Group Members ({group.memberCount})
                    </Typography>

                    <List>
                        {group.members.map((member, index) => (
                            <React.Fragment key={member.id}>
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemAvatar>
                                        <MemberAvatar username={member.username}>
                                            {member.username.charAt(0).toUpperCase()}
                                        </MemberAvatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="h6">
                                                    {member.username}
                                                </Typography>
                                                {member.id === group.creator.id && (
                                                    <Chip
                                                        label="Creator"
                                                        size="small"
                                                        color="primary"
                                                        icon={<PersonIcon />}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={`Member since ${formatDate(group.createdAt)}`}
                                    />
                                    {isCreator() && member.id !== group.creator.id && showManagement && (
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Remove Member">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openRemoveMemberDialog(member)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    )}
                                </ListItem>
                                {index < group.members.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </StyledPaper>

                {/* Management Section - Only visible to creators */}
                {isCreator() && (
                    <StyledPaper>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h2" fontWeight={600}>
                                Group Management
                            </Typography>
                            <Button
                                startIcon={showManagement ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                onClick={() => setShowManagement(!showManagement)}
                                variant="outlined"
                            >
                                {showManagement ? 'Hide' : 'Show'} Management
                            </Button>
                        </Box>

                        <Collapse in={showManagement}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<PersonAddIcon />}
                                    onClick={() => setAddMemberDialog(true)}
                                >
                                    Add Member
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setDeleteGroupDialog(true)}
                                >
                                    Delete Group
                                </Button>
                            </Box>
                        </Collapse>
                    </StyledPaper>
                )}

                {/* Floating Action Button for Creators */}
                {isCreator() && (
                    <ManagementFab
                        onClick={() => setShowManagement(!showManagement)}
                        aria-label="toggle management"
                    >
                        <SettingsIcon />
                    </ManagementFab>
                )}

                {/* Add Member Dialog */}
                <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonAddIcon />
                            Add New Member
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Username"
                            value={newMemberUsername}
                            onChange={(e) => setNewMemberUsername(e.target.value)}
                            placeholder="Enter username to add"
                            sx={{ mt: 2 }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && newMemberUsername.trim()) {
                                    handleAddMember();
                                }
                            }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Enter the exact username of the person you want to add to this group.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddMemberDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddMember}
                            variant="contained"
                            disabled={!newMemberUsername.trim() || addingMember}
                            startIcon={addingMember ? <CircularProgress size={20} /> : <CheckIcon />}
                        >
                            {addingMember ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Remove Member Dialog */}
                <Dialog open={removeMemberDialog} onClose={() => setRemoveMemberDialog(false)}>
                    <DialogTitle color="error">Remove Member</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to remove <strong>{memberToRemove?.username}</strong> from this group?
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRemoveMemberDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRemoveMember}
                            color="error"
                            variant="contained"
                            disabled={removingMember}
                            startIcon={removingMember ? <CircularProgress size={20} /> : <DeleteIcon />}
                        >
                            {removingMember ? 'Removing...' : 'Remove'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Group Dialog */}
                <Dialog
                    open={deleteGroupDialog}
                    onClose={() => setDeleteGroupDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon />
                        Delete Group
                    </DialogTitle>
                    <DialogContent>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <Typography variant="body1" fontWeight={600}>
                                This action cannot be undone!
                            </Typography>
                        </Alert>

                        <Typography variant="body1" gutterBottom>
                            You are about to permanently delete the group <strong>"{group?.name}"</strong>.
                        </Typography>

                        <Typography variant="body1" gutterBottom>
                            To confirm deletion, please type the group name exactly:
                        </Typography>

                        <TextField
                            fullWidth
                            label={`Type "${group?.name}" to confirm`}
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={group?.name}
                            sx={{ mt: 2 }}
                            error={deleteConfirmText !== '' && deleteConfirmText !== group?.name}
                            helperText={
                                deleteConfirmText !== '' && deleteConfirmText !== group?.name
                                    ? 'Group name does not match'
                                    : ''
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setDeleteGroupDialog(false);
                                setDeleteConfirmText('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteGroup}
                            color="error"
                            variant="contained"
                            disabled={deleteConfirmText !== group?.name || deletingGroup}
                            startIcon={deletingGroup ? <CircularProgress size={20} /> : <DeleteIcon />}
                        >
                            {deletingGroup ? 'Deleting...' : 'Delete Group Forever'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default GroupView;