export const validationRules = {
    username: (value) => {
        if (!value?.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be less than 20 characters';
        return '';
    },

    password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
    },

    confirmPassword: (value, originalPassword) => {
        if (!value) return 'Please confirm your password';
        if (value !== originalPassword) return 'Passwords do not match';
        return '';
    },

    groupName: (value) => {
        if (!value?.trim()) return 'Group name is required';
        if (value.length < 3) return 'Group name must be at least 3 characters';
        if (value.length > 50) return 'Group name must be less than 50 characters';
        return '';
    },

    groupDescription: (value) => {
        if (value && value.length > 500) return 'Description must be less than 500 characters';
        return '';
    },

    taskTitle: (value) => {
        if (!value?.trim()) return 'Title is required';
        if (value.length > 50) return 'Title must be less than 50 characters';
        return '';
    },

    taskDescription: (value) => {
        if (value && value.length > 1000) return 'Description must be less than 1000 characters';
        return '';
    },

    deadline: (value) => {
        if (!value) return 'Deadline is required';
        const deadlineDate = new Date(value);
        if (deadlineDate <= new Date()) return 'Deadline must be in the future';
        return '';
    },

    comment: (value) => {
        if (!value?.trim()) return 'Comment content is required';
        if (value.length > 1000) return 'Comment must be less than 1000 characters';
        return '';
    }
};