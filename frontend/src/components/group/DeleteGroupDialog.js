import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Typography,
    CircularProgress
} from '@mui/material';
import {
    Warning as WarningIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import FormField from '../common/FormField';

const DeleteGroupDialog = ({
                               open,
                               onClose,
                               onConfirm,
                               groupName,
                               loading = false
                           }) => {
    const [confirmText, setConfirmText] = useState('');

    const handleClose = () => {
        setConfirmText('');
        onClose();
    };

    const handleConfirm = () => {
        if (confirmText === groupName) {
            onConfirm();
        }
    };

    const isValid = confirmText === groupName;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                Delete Group
            </DialogTitle>
            <DialogContent>
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight={600}>
                        This action cannot be undone!
                    </Typography>
                </Alert>

                <Typography variant="body1" gutterBottom>
                    You are about to permanently delete the group <strong>"{groupName}"</strong>.
                </Typography>

                <Typography variant="body1" gutterBottom>
                    To confirm deletion, please type the group name exactly:
                </Typography>

                <FormField
                    label={`Type "${groupName}" to confirm`}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={groupName}
                    error={confirmText !== '' && !isValid ? 'Group name does not match' : ''}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    color="error"
                    variant="contained"
                    disabled={!isValid || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
                >
                    {loading ? 'Deleting...' : 'Delete Group Forever'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteGroupDialog;