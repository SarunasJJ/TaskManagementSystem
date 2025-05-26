import React from 'react';
import { Avatar, Tooltip } from '@mui/material';

const getAvatarColor = (username) => {
    const colors = [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
        '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
};

const UserAvatar = ({
                        username,
                        size = 40,
                        fontSize = '1rem',
                        showTooltip = false,
                        tooltipText,
                        ...props
                    }) => {
    const avatar = (
        <Avatar
            sx={{
                bgcolor: getAvatarColor(username),
                width: size,
                height: size,
                fontSize,
                fontWeight: 600,
                ...props.sx
            }}
            {...props}
        >
            {username?.charAt(0).toUpperCase()}
        </Avatar>
    );

    if (showTooltip) {
        return (
            <Tooltip title={tooltipText || username}>
                {avatar}
            </Tooltip>
        );
    }

    return avatar;
};

export default UserAvatar;