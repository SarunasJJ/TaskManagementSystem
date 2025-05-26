const API_BASE_URL = 'http://localhost:8080/api';

class CommentService {

    async createComment(groupId, content) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to post comment' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getComments(groupId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/comments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.comments };
            } else {
                return { success: false, error: data.message || 'Failed to fetch comments' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getRecentComments(groupId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/comments/recent`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.comments };
            } else {
                return { success: false, error: data.message || 'Failed to fetch recent comments' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async updateComment(groupId, commentId, content) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to update comment' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async deleteComment(groupId, commentId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to delete comment' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getCommentCount(groupId) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/comments/count`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, count: data.count };
            } else {
                return { success: false, error: 'Failed to fetch comment count' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

const commentService = new CommentService();
export default commentService;