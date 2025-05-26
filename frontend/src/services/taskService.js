// frontend/src/services/taskService.js
const API_BASE_URL = 'http://localhost:8080/api';

class TaskService {

    async createTask(taskData, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
                body: JSON.stringify(taskData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to create task' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getTask(taskId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else if (response.status === 404) {
                return { success: false, error: 'Task not found' };
            } else {
                return { success: false, error: 'Failed to fetch task' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getTasksByGroup(groupId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/group/${groupId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return { success: true, data: data.tasks || [] };
                } else {
                    return { success: false, error: data.message || 'Failed to fetch tasks' };
                }
            } else {
                return { success: false, error: 'Failed to fetch tasks' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async getTasksByGroupAndStatus(groupId, status, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/group/${groupId}/status/${status}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return { success: true, data: data.tasks || [] };
                } else {
                    return { success: false, error: data.message || 'Failed to fetch tasks' };
                }
            } else {
                return { success: false, error: 'Failed to fetch tasks' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async updateTask(taskId, updateData, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                if (data.currentVersion && data.currentData) {
                    return {
                        success: false,
                        error: data.message,
                        isOptimisticLockConflict: true,
                        currentVersion: data.currentVersion,
                        currentData: data.currentData
                    };
                } else {
                    return { success: false, error: data.message || 'Failed to update task' };
                }
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async updateTaskStatus(taskId, status, userId, version) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status/${status}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
                body: JSON.stringify({ version }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                if (data.currentVersion && data.currentData) {
                    return {
                        success: false,
                        error: data.message,
                        isOptimisticLockConflict: true,
                        currentVersion: data.currentVersion,
                        currentData: data.currentData
                    };
                } else {
                    return { success: false, error: data.message || 'Failed to update task status' };
                }
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async assignTask(taskId, assignedUserId, userId) {
        try {
            let url;
            if (assignedUserId) {
                url = `${API_BASE_URL}/tasks/${taskId}/assign/${assignedUserId}`;
            } else {
                url = `${API_BASE_URL}/tasks/${taskId}/assign`;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to update task assignment' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async deleteTask(taskId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': userId.toString()
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Failed to delete task' };
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

const taskService = new TaskService();
export default taskService;