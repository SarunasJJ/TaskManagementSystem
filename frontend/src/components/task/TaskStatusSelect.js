import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box
} from '@mui/material';
import {
    RadioButtonUnchecked as TodoIcon,
    Autorenew as InProgressIcon,
    CheckCircle as DoneIcon
} from '@mui/icons-material';

const statusConfig = {
    'TODO': { label: 'To Do', icon: <TodoIcon />, color: 'info' },
    'IN_PROGRESS': { label: 'In Progress', icon: <InProgressIcon />, color: 'warning' },
    'DONE': { label: 'Done', icon: <DoneIcon />, color: 'success' }
};

const TaskStatusSelect = ({
                              value,
                              onChange,
                              label = "Status",
                              size = "medium",
                              variant = "outlined",
                              ...props
                          }) => {
    return (
        <FormControl size={size} variant={variant} {...props}>
            <InputLabel>{label}</InputLabel>
            <Select
                variant="outlined"
                value={value}
                onChange={onChange}
                label={label}
                renderValue={(selected) => {
                    const config = statusConfig[selected];
                    return config ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {config.icon}
                            {config.label}
                        </Box>
                    ) : '';
                }}
            >
                {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {config.icon}
                            {config.label}
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default TaskStatusSelect;