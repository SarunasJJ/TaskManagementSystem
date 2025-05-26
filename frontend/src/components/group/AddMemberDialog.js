import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import FormField from '../common/FormField';

const AddMemberDialog = ({ open, onClose, onAddMember, loading = false }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = () => {
        if (username.trim()) {
            onAddMember(username.trim());
        }
    };

    const handleClose = () => {
        setUsername('');
        onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && username.trim()) {
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonAddIcon />
                    Add New Member
                </Box>
            </DialogTitle>
            <DialogContent>
                <FormField
                    autoFocus
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username to add"
                    onKeyPress={handleKeyPress}
                    sx={{ mt: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Enter the exact username of the person you want to add to this group.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!username.trim() || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                >
                    {loading ? 'Adding...' : 'Add Member'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMemberDialog;