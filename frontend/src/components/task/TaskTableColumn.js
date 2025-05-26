import React from 'react';
import {
    Paper,
    Box,
    Typography,
    Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TaskCard from './TaskCard';

const ColumnContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    minHeight: 400,
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(2),
}));

const ColumnHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
}));

const TaskTableColumn = ({
                          title,
                          icon: Icon,
                          tasks,
                          headerColor,
                          onTaskClick,
                          onTaskMenuClick
                      }) => {
    return (
        <ColumnContainer>
            <ColumnHeader sx={{ backgroundColor: headerColor, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon />
                    <Typography variant="h6" fontWeight={600}>
                        {title}
                    </Typography>
                </Box>
            </ColumnHeader>
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                    onMenuClick={onTaskMenuClick}
                />
            ))}
        </ColumnContainer>
    );
};

export default TaskTableColumn;