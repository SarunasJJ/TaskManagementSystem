import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Avatar,
    Tooltip
} from '@mui/material';
import {
    Logout as LogoutIcon,
    Dashboard as DashboardIcon, Home as HomeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import authService from '../services/authService';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

const Navbar = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <StyledAppBar position="static">
            <Toolbar>
                <Tooltip title="Homepage">
                    <IconButton color="inherit" onClick={() => navigate('/homepage')} sx={{ mr: 1 }}>
                        <HomeIcon />
                    </IconButton>
                </Tooltip>
                <DashboardIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Task Management System
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                        {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body1">
                        {user.username}
                    </Typography>
                    <Tooltip title="Logout">
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Navbar;