import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';

const ConfirmDialog = ({
                           open,
                           onClose,
                           onConfirm,
                           title,
                           message,
                           confirmText = 'Confirm',
                           cancelText = 'Cancel',
                           confirmColor = 'primary',
                           loading = false,
                           confirmIcon
                       }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle color={confirmColor === 'error' ? 'error.main' : 'inherit'}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    color={confirmColor}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : confirmIcon}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;