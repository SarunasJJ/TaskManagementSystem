import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Tabs,
    Tab,
    Button,
    Typography,
    Alert
} from '@mui/material';
import {
    Assignment as TaskIcon,
    Message as MessageIcon,
    People as PeopleIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import groupService from '../services/groupService';
import { useAuth } from '../hooks/useAuth';
import { useApiRequest } from '../hooks/useApiRequest';
import Navbar from './Navbar';
import LoadingState from './common/LoadingState';
import ErrorState from './common/ErrorState';
import StatusMessages from './common/StatusMessages';
import PageHeader from './common/PageHeader';
import GroupHeader from './group/GroupHeader';
import MembersList from './group/MembersList';
import AddMemberDialog from './group/AddMemberDialog';
import DeleteGroupDialog from './group/DeleteGroupDialog';
import ConfirmDialog from './common/ConfirmDialog';
import TaskBoard from './TaskBoard';
import GroupDiscussions from './GroupDiscussions';

const StyledPaper = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.background.paper,
}));

const TabPanel = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 0),
}));

const GroupView = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { loading, error, success, makeRequest, clearMessages, setSuccess, setError } = useApiRequest();

    const [group, setGroup] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [managementMode, setManagementMode] = useState(false);

    // Dialog states
    const [addMemberDialog, setAddMemberDialog] = useState(false);
    const [removeMemberDialog, setRemoveMemberDialog] = useState(false);
    const [deleteGroupDialog, setDeleteGroupDialog] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    // Loading states for individual actions
    const [addingMember, setAddingMember] = useState(false);
    const [removingMember, setRemovingMember] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState(false);

    useEffect(() => {
        if (user && groupId) {
            fetchGroup();
        }
    }, [groupId, user]);

    const fetchGroup = async () => {
        const result = await makeRequest(() => groupService.getGroup(groupId));
        if (result.success) {
            setGroup(result.data);
        }
    };

    const handleAddMember = async (username) => {
        setAddingMember(true);
        try {
            const result = await groupService.addMember(groupId, username);
            if (result.success) {
                setGroup(result.data);
                setSuccess(`${username} has been added to the group!`);
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
        setDeletingGroup(true);
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

    const isCreator = () => user && group && group.creator && group.creator.id === user.id;
    const canManageMembers = () => isCreator() && managementMode;

    // Show loading while authenticating, fetching group, or if group is null
    if (authLoading || loading || !group) {
        return (
            <Box>
                <Navbar user={user} />
                <LoadingState message="Loading group details..." />
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
                        message={error}
                        onAction={() => navigate('/homepage')}
                        actionText="Back to Homepage"
                    />
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <Navbar user={user} />
            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <PageHeader
                    title=""
                    onBack={() => navigate('/homepage')}
                    backTooltip="Back to Homepage"
                />

                <StatusMessages
                    error={error}
                    success={success}
                    onClearError={clearMessages}
                    onClearSuccess={clearMessages}
                />

                {/* Group Info Section - Only render if group exists */}
                {group && (
                    <StyledPaper>
                        <GroupHeader
                            group={group}
                            currentUserId={user?.id}
                            managementMode={managementMode}
                            onToggleManagement={setManagementMode}
                            onDeleteGroup={() => setDeleteGroupDialog(true)}
                        />

                        {/* Tabs Navigation */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
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
                                    label={`Members (${group?.memberCount || 0})`}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                />
                            </Tabs>
                        </Box>
                    </StyledPaper>
                )}

                {/* Tab Content */}
                {activeTab === 0 && (
                    <TabPanel>
                        <TaskBoard groupId={groupId} currentUser={user} />
                    </TabPanel>
                )}

                {activeTab === 1 && (
                    <TabPanel>
                        <GroupDiscussions groupId={groupId} currentUser={user} />
                    </TabPanel>
                )}

                {activeTab === 2 && group && (
                    <TabPanel>
                        <StyledPaper>
                            <PageHeader
                                title={`Group Members (${group.memberCount})`}
                                actions={canManageMembers() && (
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => setAddMemberDialog(true)}
                                    >
                                        Add Member
                                    </Button>
                                )}
                            />

                            <MembersList
                                members={group.members}
                                creatorId={group.creator.id}
                                currentUserId={user?.id}
                                groupCreatedAt={group.createdAt}
                                canManage={canManageMembers()}
                                onRemoveMember={openRemoveMemberDialog}
                            />

                            {!canManageMembers() && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Only the group creator can manage members.
                                </Alert>
                            )}
                        </StyledPaper>
                    </TabPanel>
                )}

                {/* Dialogs */}
                <AddMemberDialog
                    open={addMemberDialog}
                    onClose={() => setAddMemberDialog(false)}
                    onAddMember={handleAddMember}
                    loading={addingMember}
                />

                <ConfirmDialog
                    open={removeMemberDialog}
                    onClose={() => setRemoveMemberDialog(false)}
                    onConfirm={handleRemoveMember}
                    title="Remove Member"
                    message={`Are you sure you want to remove ${memberToRemove?.username} from this group? This action cannot be undone.`}
                    confirmText="Remove"
                    confirmColor="error"
                    loading={removingMember}
                />

                <DeleteGroupDialog
                    open={deleteGroupDialog}
                    onClose={() => setDeleteGroupDialog(false)}
                    onConfirm={handleDeleteGroup}
                    groupName={group?.name}
                    loading={deletingGroup}
                />
            </Container>
        </Box>
    );
};

export default GroupView;