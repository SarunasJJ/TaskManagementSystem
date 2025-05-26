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
    Switch,
    FormControlLabel,
    Tab,
    Tabs
} from '@mui/material';
import {
    ArrowBack,
    PersonAdd as PersonAddIcon,
    Delete as DeleteIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Check as CheckIcon,
    People as PeopleIcon,
    CalendarToday as CalendarIcon,
    Warning as WarningIcon,
    Settings as SettingsIcon,
    Assignment as TaskIcon,
    Message as MessageIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import groupService from '../services/groupService';
import authService from '../services/authService';
import Navbar from './Navbar';
import TaskBoard from "./TaskBoard";
import GroupDiscussions from "./GroupDiscussions";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const TabPanel = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 0),
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

const GroupView = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // Management mode toggle
    const [managementMode, setManagementMode] = useState(false);

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
                navigate('/homepage', {
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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box>
                <Navbar user={currentUser} />
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <Box textAlign="center">
                        <CircularProgress size={60} sx={{ mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Loading group details...
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (error && !group) {
        return (
            <Box>
                <Navbar user={currentUser} />
                <Container maxWidth="md">
                    <Box textAlign="center" mt={4}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                        <Button variant="contained" onClick={() => navigate('/homepage')}>
                            Back to Homepage
                        </Button>
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <Navbar user={currentUser} />

            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tooltip title="Back to Homepage">
                        <IconButton onClick={() => navigate('/homepage')} color="primary">
                            <ArrowBack />
                        </IconButton>
                    </Tooltip>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isCreator() && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={managementMode}
                                            onChange={(e) => setManagementMode(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SettingsIcon />
                                            <Typography variant="body1">
                                                Management Mode
                                            </Typography>
                                        </Box>
                                    }
                                />
                                {managementMode && (
                                    <Tooltip title="Delete Group">
                                        <IconButton
                                            color="error"
                                            onClick={() => setDeleteGroupDialog(true)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                                                }
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>

                {success && (
                    <Fade in>
                        <Alert
                            severity="success"
                            sx={{ mb: 2 }}
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
                            sx={{ mb: 2 }}
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
                                {managementMode && (
                                    <Chip
                                        label="Managing"
                                        color="primary"
                                        size="small"
                                        sx={{ ml: 2 }}
                                    />
                                )}
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

                    {/* Tabs Navigation */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="group sections">
                            <Tab
                                icon={<TaskIcon />}
                                label="Tasks"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            />
                            <Tab
                                icon={<MessageIcon />}
                                label="Discussions"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            />
                            <Tab
                                icon={<PeopleIcon />}
                                label={`Members (${group.memberCount})`}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            />
                        </Tabs>
                    </Box>
                </StyledPaper>

                {/* Tab Content */}
                {activeTab === 0 && (
                    <TabPanel>
                        <TaskBoard
                            groupId={groupId}
                            currentUser={currentUser}
                        />
                    </TabPanel>
                )}

                {activeTab === 1 && (
                    <TabPanel>
                        <GroupDiscussions
                            groupId={groupId}
                            currentUser={currentUser}
                        />
                    </TabPanel>
                )}

                {activeTab === 2 && (
                    <TabPanel>
                        {/* Members Section */}
                        <StyledPaper>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" component="h2" fontWeight={600}>
                                    Group Members ({group.memberCount})
                                </Typography>
                                {isCreator() && managementMode && (
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => setAddMemberDialog(true)}
                                    >
                                        Add Member
                                    </Button>
                                )}
                            </Box>

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
                                            {isCreator() && managementMode && member.id !== group.creator.id && (
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

                            {!isCreator() && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Only the group creator can manage members.
                                </Alert>
                            )}
                        </StyledPaper>
                    </TabPanel>
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