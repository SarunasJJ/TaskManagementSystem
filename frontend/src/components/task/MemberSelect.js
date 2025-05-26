import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import UserAvatar from '../common/UserAvatar';

const MemberSelect = ({
                          members,
                          value,
                          onChange,
                          label = "Assign to Member",
                          allowEmpty = true,
                          emptyLabel = "No assignment",
                          size = "medium",
                          ...props
                      }) => {
    const getSelectedMember = () => {
        return members.find(member => member.id.toString() === value);
    };

    return (
        <FormControl size={size} {...props}>
            <InputLabel>{label}</InputLabel>
            <Select
                variant="standard"
                value={value}
                onChange={onChange}
                label={label}
                renderValue={(selected) => {
                    if (!selected && allowEmpty) return emptyLabel;
                    const member = getSelectedMember();
                    return member ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <UserAvatar
                                username={member.username}
                                size={24}
                                fontSize="0.8rem"
                            />
                            {member.username}
                        </Box>
                    ) : emptyLabel;
                }}
            >
                {allowEmpty && (
                    <MenuItem value="">
                        <em>{emptyLabel}</em>
                    </MenuItem>
                )}
                {members.map((member) => (
                    <MenuItem key={member.id} value={member.id.toString()}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <UserAvatar
                                username={member.username}
                                size={32}
                                fontSize="0.9rem"
                            />
                            <Typography>{member.username}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default MemberSelect;