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
    Alert,
    Chip,
    CircularProgress,
    Divider,
    InputAdornment,
    Tooltip,
    Fade, IconButton
} from '@mui/material';
import {
    Send as SendIcon,
    Message as MessageIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import commentService from '../services/commentService';
import authService from '../services/authService';

const DiscussionContainer = styled(Paper)(({ theme }) => ({
    height: '75vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2.5),
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
    backgroundColor: theme.palette.grey[50],
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
    flexDirection: 'row',
    flexWrap: 'nowrap',
}));

const MessageBubble = styled(Paper)(({ theme, isOwn }) => ({
    maxWidth: '70%',
    minWidth: 'fit-content',
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.spacing(2),
    position: 'relative',
    backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.background.paper,
    color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    boxShadow: theme.shadows[2],
    display: 'inline-block',
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
    padding: theme.spacing(2.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
}));

const StatsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    fontSize: '0.875rem',
    opacity: 0.9,
}));

const GroupDiscussions = ({ groupId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const messagesEndRef = useRef(null);
    const user = currentUser || authService.getCurrentUser();

    useEffect(() => {
        fetchComments();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchComments, 30000);
        return () => clearInterval(interval);
    }, [groupId]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchComments = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
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
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchComments(true);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                <Tooltip title="Refresh">
                    <IconButton
                        color="inherit"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    </IconButton>
                </Tooltip>
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Start the conversation by posting the first message!
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ py: 0 }}>
                        {comments.map((comment, index) => {
                            const isOwn = comment.authorId === user?.id;
                            const showAvatar = index === 0 || comments[index - 1].authorId !== comment.authorId;

                            // Check if we need extra spacing (30+ minutes gap from same user)
                            const needsSpacing = index > 0 &&
                                comments[index - 1].authorId === comment.authorId &&
                                new Date(comment.createdAt).getTime() - new Date(comments[index - 1].createdAt).getTime() > 1800000; // 30 minutes

                            return (
                                <MessageItem
                                    key={comment.id}
                                    isOwn={isOwn}
                                    sx={{
                                        marginTop: needsSpacing ? 3 : 0
                                    }}
                                >
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

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isOwn ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
                                        width: 'auto'
                                    }}>
                                        {showAvatar && !isOwn && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ ml: 1, mb: 0.5, fontWeight: 600 }}
                                            >
                                                {comment.authorUsername}
                                            </Typography>
                                        )}

                                        <MessageBubble isOwn={isOwn} elevation={isOwn ? 2 : 1}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    whiteSpace: 'pre-wrap',
                                                    lineHeight: 1.4,
                                                    margin: 0
                                                }}
                                            >
                                                {comment.content}
                                            </Typography>
                                        </MessageBubble>
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
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                backgroundColor: 'background.paper',
                            }
                        }}
                        InputProps={{
                            endAdornment: newComment.trim() && (
                                <InputAdornment position="end">
                                    <Typography variant="caption" color="text.secondary">
                                        {newComment.length}/1000
                                    </Typography>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handlePostComment}
                        disabled={!newComment.trim() || posting || newComment.length > 1000}
                        startIcon={posting ? <CircularProgress size={20} /> : <SendIcon />}
                        sx={{
                            minWidth: 120,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {posting ? 'Sending...' : 'Send'}
                    </Button>
                </Box>
                {newComment.length > 900 && (
                    <Typography
                        variant="caption"
                        color={newComment.length > 1000 ? 'error' : 'warning.main'}
                        sx={{ mt: 0.5, display: 'block' }}
                    >
                        {newComment.length > 1000
                            ? `Message too long (${newComment.length}/1000 characters)`
                            : `${1000 - newComment.length} characters remaining`
                        }
                    </Typography>
                )}
            </InputContainer>
        </DiscussionContainer>
    );
};

export default GroupDiscussions;