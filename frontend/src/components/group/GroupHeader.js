import React from 'react';
import {
    Box,
    Typography,
    Chip,
    FormControlLabel,
    Switch,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Group as GroupIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const GroupHeader = ({
                         group,
                         currentUserId,
                         managementMode,
                         onToggleManagement,
                         onDeleteGroup
                     }) => {
    const isCreator = currentUserId === group.creator.id;

    return (
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isCreator && (
                    <Chip
                        label="You are the creator"
                        color="primary"
                        icon={<PersonIcon />}
                        variant="outlined"
                    />
                )}

                {isCreator && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={managementMode}
                                    onChange={(e) => onToggleManagement(e.target.checked)}
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
                                    onClick={onDeleteGroup}
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
    );
};

export default GroupHeader;