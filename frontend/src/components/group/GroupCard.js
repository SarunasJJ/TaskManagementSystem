import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
    AvatarGroup
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Person as PersonIcon,
    People as PeopleIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import UserAvatar from '../common/UserAvatar';
import { formatDate } from '../../utils/dateUtils';

const StyledCard = styled(Card)(({ theme }) => ({
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

const CreatorChip = styled(Chip)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    '& .MuiChip-icon': {
        color: 'white',
    },
}));

const GroupCard = ({ group, currentUserId }) => {
    const isCreator = currentUserId === group.creator.id;

    return (
        <StyledCard>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" noWrap sx={{ flex: 1, mr: 1 }}>
                        {group.name}
                    </Typography>
                    {isCreator && (
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
                            {formatDate(group.createdAt, { month: 'short' })}
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
                            <UserAvatar
                                key={member.id}
                                username={member.username}
                                size={32}
                                fontSize="0.8rem"
                                showTooltip
                                tooltipText={`${member.username}${member.id === group.creator.id ? ' (Creator)' : ''}`}
                            />
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
        </StyledCard>
    );
};

export default GroupCard;