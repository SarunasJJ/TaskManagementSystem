import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    CircularProgress,
    Divider,
    InputAdornment,
    Tooltip,
    Fade,
    Collapse
} from '@mui/material';
import {
    Send as SendIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Message as MessageIcon,
    Check as CheckIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import commentService from '../services/commentService';
import authService from '../services/authService';

const DiscussionContainer = styled(Paper)(({ theme }) => ({
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(1),
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: theme.palette.grey[100],
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.grey[300],
        borderRadius: '4px',
        '&:hover': {
            background: theme.palette.grey[400],
        },
    },
}));

const MessageItem = styled(ListItem)(({ theme, isOwn }) => ({
    display: 'flex',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
    '&:hover .message-actions': {
        opacity: 1,
    },
}));

const MessageBubble = styled(Paper)(({ theme, isOwn }) => ({
    maxWidth: '70%',
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.spacing(2),
    position: 'relative',
    backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.grey[100],
    color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
    wordWrap: 'break-word',
    ...(isOwn && {
        borderBottomRightRadius: theme.spacing(0.5),
    }),
    ...(!isOwn && {
        borderBottomLeftRadius: theme.spacing(0.5),
    }),
}));

const MessageActions = styled(Box)(({ theme }) => ({
    opacity: 0,
    transition: 'opacity 0.2s ease',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
}));

const InputContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
}));

const GroupDiscussions = ({ groupId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');

    // Menu and dialog states
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editContent, setEditContent] = useState('');

    const messagesEndRef = useRef(null);
    const user = currentUser || authService.getCurrentUser();

    useEffect(() => {
        fetchComments();
    }, [groupId]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchComments = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await commentService.getComments(groupId);
            if (result.success) {
                setComments(result.data);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        setPosting(true);
        setError('');

        try {
            const result = await commentService.createComment(groupId, newComment.trim());
            if (result.success) {
                setNewComment('');
                await fetchComments(); // Refresh comments
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to post comment');
        } finally {
            setPosting(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePostComment();
        }
    };

    const handleMenuOpen = (event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    const handleEditComment = () => {
        setEditContent(selectedComment.content);
        setEditDialog(true);
        handleMenuClose();
    };

    const handleDeleteComment = () => {
        setDeleteDialog(true);
        handleMenuClose();
    };

    const confirmEdit = async () => {
        if (!editContent.trim()) return;

        try {
            const result = await commentService.updateComment(groupId, selectedComment.id, editContent.trim());
            if (result.success) {
                setEditDialog(false);
                setEditContent('');
                await fetchComments();
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to update comment');
        }
    };

    const confirmDelete = async () => {
        try {
            const result = await commentService.deleteComment(groupId, selectedComment.id);
            if (result.success) {
                setDeleteDialog(false);
                await fetchComments();
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to delete comment');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const getAvatarColor = (username) => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
        const index = username ? username.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    if (loading) {
        return (
            <DiscussionContainer>
                <HeaderBox>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MessageIcon />
                        <Typography variant="h6">Group Discussions</Typography>
                    </Box>
                </HeaderBox>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flex={1}
                >
                    <Box textAlign="center">
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            Loading discussions...
                        </Typography>
                    </Box>
                </Box>
            </DiscussionContainer>
        );
    }

    return (
        <DiscussionContainer>
            <HeaderBox>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageIcon />
                    <Typography variant="h6">Group Discussions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Refresh">
                        <IconButton color="inherit" onClick={fetchComments}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </HeaderBox>

            {error && (
                <Fade in>
                    <Alert
                        severity="error"
                        sx={{ m: 2 }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                </Fade>
            )}

            <MessagesContainer>
                {comments.length === 0 ? (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        textAlign="center"
                        p={3}
                    >
                        <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No messages yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Start the conversation by posting the first message!
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ py: 0 }}>
                        {comments.map((comment, index) => {
                            const isOwn = comment.authorId === user?.id;
                            const showAvatar = index === 0 || comments[index - 1].authorId !== comment.authorId;

                            return (
                                <MessageItem key={comment.id} isOwn={isOwn}>
                                    {!isOwn && (
                                        <Avatar
                                            sx={{
                                                bgcolor: getAvatarColor(comment.authorUsername),
                                                width: 36,
                                                height: 36,
                                                fontSize: '0.9rem',
                                                mr: 1,
                                                visibility: showAvatar ? 'visible' : 'hidden'
                                            }}
                                        >
                                            {comment.authorUsername?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    )}

                                    <Box sx={{ maxWidth: '70%' }}>
                                        {showAvatar && !isOwn && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ ml: 1, mb: 0.5, display: 'block' }}
                                            >
                                                {comment.authorUsername}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                            {isOwn && (comment.canEdit || comment.canDelete) && (
                                                <MessageActions className="message-actions">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, comment)}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </MessageActions>
                                            )}

                                            <MessageBubble isOwn={isOwn} elevation={1}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ whiteSpace: 'pre-wrap' }}
                                                >
                                                    {comment.content}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5, gap: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            opacity: 0.7,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        {formatDate(comment.createdAt)}
                                                    </Typography>
                                                    {comment.isEdited && (
                                                        <Tooltip title="Edited">
                                                            <EditIcon sx={{ fontSize: 12, opacity: 0.7 }} />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </MessageBubble>

                                            {!isOwn && (comment.canEdit || comment.canDelete) && (
                                                <MessageActions className="message-actions">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, comment)}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </MessageActions>
                                            )}
                                        </Box>
                                    </Box>

                                    {isOwn && (
                                        <Avatar
                                            sx={{
                                                bgcolor: getAvatarColor(comment.authorUsername),
                                                width: 36,
                                                height: 36,
                                                fontSize: '0.9rem',
                                                ml: 1,
                                                visibility: showAvatar ? 'visible' : 'hidden'
                                            }}
                                        >
                                            {comment.authorUsername?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    )}
                                </MessageItem>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </List>
                )}
            </MessagesContainer>

            <InputContainer>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type your message..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={posting}
                        variant="outlined"
                        size="small"
                    />
                    <Button
                        variant="contained"
                        onClick={handlePostComment}
                        disabled={!newComment.trim() || posting}
                        startIcon={posting ? <CircularProgress size={20} /> : <SendIcon />}
                        sx={{ minWidth: 120 }}
                    >
                        {posting ? 'Sending...' : 'Send'}
                    </Button>
                </Box>
            </InputContainer>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {selectedComment?.canEdit && (
                    <MenuItem onClick={handleEditComment}>
                        <EditIcon sx={{ mr: 1 }} fontSize="small" />
                        Edit
                    </MenuItem>
                )}
                {selectedComment?.canDelete && (
                    <MenuItem onClick={handleDeleteComment} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                        Delete
                    </MenuItem>
                )}
            </Menu>

            {/* Edit Dialog */}
            <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Message</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Edit your message..."
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={confirmEdit}
                        variant="contained"
                        disabled={!editContent.trim()}
                        startIcon={<CheckIcon />}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete Message</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this message? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </DiscussionContainer>
    );
};

export default GroupDiscussions;