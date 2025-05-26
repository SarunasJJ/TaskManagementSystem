export const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString);
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (dateString) => {
    return formatDate(dateString, {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date - now) / (1000 * 60 * 60);

    if (diffInHours < 0) {
        return {
            text: `${Math.abs(Math.ceil(diffInHours))} hours overdue`,
            isOverdue: true
        };
    } else if (diffInHours < 24) {
        return {
            text: `${Math.ceil(diffInHours)} hours left`,
            isOverdue: false
        };
    } else {
        const days = Math.ceil(diffInHours / 24);
        return {
            text: `${days} days left`,
            isOverdue: false
        };
    }
};