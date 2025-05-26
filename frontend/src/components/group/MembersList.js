import React from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Chip,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import UserAvatar from '../common/UserAvatar';
import { formatDate } from '../../utils/dateUtils';

const MembersList = ({
                         members,
                         creatorId,
                         currentUserId,
                         groupCreatedAt,
                         canManage = false,
                         onRemoveMember
                     }) => {
    const isCreator = (memberId) => memberId === creatorId;
    const canRemoveMember = (member) => canManage && !isCreator(member.id);

    return (
        <List>
            {members.map((member, index) => (
                <React.Fragment key={member.id}>
                    <ListItem sx={{ py: 2 }}>
                        <ListItemAvatar>
                            <UserAvatar
                                username={member.username}
                                size={48}
                                fontSize="1.2rem"
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h6">
                                        {member.username}
                                    </Typography>
                                    {isCreator(member.id) && (
                                        <Chip
                                            label="Creator"
                                            size="small"
                                            color="primary"
                                            icon={<PersonIcon />}
                                        />
                                    )}
                                </Box>
                            }
                            secondary={`Member since ${formatDate(groupCreatedAt)}`}
                        />
                        {canRemoveMember(member) && (
                            <ListItemSecondaryAction>
                                <Tooltip title="Remove Member">
                                    <IconButton
                                        color="error"
                                        onClick={() => onRemoveMember(member)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        )}
                    </ListItem>
                    {index < members.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </List>
    );
};

export default MembersList;