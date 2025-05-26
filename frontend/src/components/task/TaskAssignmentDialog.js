import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import MemberSelect from './MemberSelect';

const TaskAssignmentDialog = ({
                                  open,
                                  onClose,
                                  onSave,
                                  members,
                                  value,
                                  onChange
                              }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Task Assignment</DialogTitle>
            <DialogContent>
                <MemberSelect
                    members={members}
                    value={value}
                    onChange={onChange}
                    label="Assign to Member"
                    fullWidth
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={onSave}
                    variant="contained"
                    startIcon={<SaveIcon />}
                >
                    Save Assignment
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskAssignmentDialog;