import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import authService from '../services/authService';
import './Homepage.css';

const Homepage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        alert('Logged out successfully!');
        navigate('/login');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <h1>Task Management System</h1>
                <div className="user-info">
                    <span>Welcome, {user.username}!</span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </header>

            <main className="homepage-main">
            </main>
        </div>
    );
};

export default Homepage;