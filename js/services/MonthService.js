// Month Service
class MonthService {
    async getMonths() {
        const response = await fetch('/api/months');
        return await response.json();
    }

    async getMonthById(id) {
        const response = await fetch(`/api/months/${id}`);
        return await response.json();
    }

    async addMonth(monthData) {
        const response = await fetch('/api/months', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(monthData)
        });
        return await response.json();
    }

    async updateMonth(id, updates) {
        const response = await fetch(`/api/months/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    }

    async deleteMonth(id) {
        const response = await fetch(`/api/months/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async getMonthsByCourse(courseId) {
        const response = await fetch(`/api/months/course/${courseId}`);
        return await response.json();
    }
}

// Global instance
window.monthService = new MonthService();
