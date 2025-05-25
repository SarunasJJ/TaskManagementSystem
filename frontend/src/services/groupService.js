const API_BASE_URL = 'http://localhost:8080/api';

class GroupService {

    async createGroup(groupData) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
                body: JSON.stringify(groupData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to create group' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getMyGroups() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/my-groups`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to fetch groups' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getGroup(groupId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to fetch group' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async addMember(groupId, username) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': currentUser.id.toString()
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to add member' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async removeMember(groupId, userId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${userId}`, {
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
                return { success: false, error: data.message || 'Failed to remove member' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async checkGroupNameAvailability(name) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/check-name/${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, available: data.available };
            } else {
                return { success: false, error: 'Failed to check name availability' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async deleteGroup(groupId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
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
                return { success: false, error: data.message || 'Failed to delete group' };
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

const groupService = new GroupService();
export default groupService;