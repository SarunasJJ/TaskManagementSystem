import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    CircularProgress,
    InputAdornment,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Send as SendIcon,
    Message as MessageIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import commentService from '../services/commentService';
import { useApiRequest } from '../hooks/useApiRequest';
import UserAvatar from './common/UserAvatar';
import LoadingState from './common/LoadingState';
import StatusMessages from './common/StatusMessages';
import EmptyState from './common/EmptyState';

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

const MessageBubble = styled(Paper)(({ theme, isOwn }) => ({
    maxWidth: '70%',
    minWidth: 'fit-content',
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.spacing(2),
    backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.background.paper,
    color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    boxShadow: theme.shadows[2],
    ...(isOwn && { borderBottomRightRadius: theme.spacing(0.5) }),
    ...(!isOwn && { borderBottomLeftRadius: theme.spacing(0.5) }),
}));

const InputContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
}));

const GroupDiscussions = ({ groupId, currentUser }) => {
    const { loading, error, success, makeRequest, clearMessages } = useApiRequest();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (groupId && currentUser) {
            fetchComments();
            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchComments, 30000);
            return () => clearInterval(interval);
        }
    }, [groupId, currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchComments = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) {
            setRefreshing(true);
        }

        const result = await makeRequest(() => commentService.getComments(groupId));
        if (result.success) {
            setComments(result.data || []);
        }

        if (showRefreshIndicator) {
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchComments(true);
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || posting) return;

        setPosting(true);
        try {
            const result = await commentService.createComment(groupId, newComment.trim());
            if (result.success) {
                setNewComment('');
                await fetchComments(); // Refresh comments after posting
            } else {
                // Error will be handled by the StatusMessages component
                console.error('Failed to post comment:', result.error);
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
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

    const renderMessage = (comment, index) => {
        const isOwn = comment.authorId === currentUser?.id;
        const showAvatar = index === 0 || comments[index - 1].authorId !== comment.authorId;

        // Check if we need extra spacing (30+ minutes gap from same user)
        const needsSpacing = index > 0 &&
            comments[index - 1].authorId === comment.authorId &&
            new Date(comment.createdAt).getTime() - new Date(comments[index - 1].createdAt).getTime() > 1800000;

        return (
            <ListItem
                key={comment.id}
                sx={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    padding: 1,
                    marginTop: needsSpacing ? 3 : 0
                }}
            >
                {!isOwn && (
                    <UserAvatar
                        username={comment.authorUsername}
                        size={36}
                        fontSize="0.9rem"
                        sx={{
                            mr: 1,
                            visibility: showAvatar ? 'visible' : 'hidden'
                        }}
                    />
                )}

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
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

                    <MessageBubble isOwn={isOwn}>
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
                    <UserAvatar
                        username={comment.authorUsername}
                        size={36}
                        fontSize="0.9rem"
                        sx={{
                            ml: 1,
                            visibility: showAvatar ? 'visible' : 'hidden'
                        }}
                    />
                )}
            </ListItem>
        );
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
                <LoadingState message="Loading discussions..." />
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

            <StatusMessages
                error={error}
                success={success}
                onClearError={clearMessages}
                onClearSuccess={clearMessages}
            />

            <MessagesContainer>
                {comments.length === 0 ? (
                    <EmptyState
                        icon={MessageIcon}
                        title="No messages yet"
                        description="Start the conversation by posting the first message!"
                        variant="box"
                    />
                ) : (
                    <List sx={{ py: 0 }}>
                        {comments.map(renderMessage)}
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