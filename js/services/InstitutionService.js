// Institution Service
class InstitutionService {
    async getInstitutions() {
        const response = await fetch('/api/institutions');
        return await response.json();
    }

    async getInstitutionById(id) {
        const response = await fetch(`/api/institutions/${id}`);
        return await response.json();
    }

    async addInstitution(institutionData) {
        const response = await fetch('/api/institutions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(institutionData)
        });
        return await response.json();
    }

    async updateInstitution(id, updates) {
        const response = await fetch(`/api/institutions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    }

    async deleteInstitution(id) {
        const response = await fetch(`/api/institutions/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
}

// Global instance
window.institutionService = new InstitutionService();
