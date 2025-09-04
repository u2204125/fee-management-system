// Activity Service
class ActivityService {
    async getActivities() {
        const response = await fetch('/api/activities');
        return await response.json();
    }

    async addActivity(type, description, data = {}) {
        const activity = {
            type,
            description,
            data,
            timestamp: new Date().toISOString(),
            user: window.authManager.getCurrentUser()?.username || 'System'
        };

        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activity)
        });
        return await response.json();
    }
}

// Global instance
window.activityService = new ActivityService();
