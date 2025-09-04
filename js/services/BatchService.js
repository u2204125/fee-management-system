// Batch Service
class BatchService {
    async getBatches() {
        const response = await fetch('/api/batches');
        return await response.json();
    }

    async getBatchById(id) {
        const response = await fetch(`/api/batches/${id}`);
        return await response.json();
    }

    async addBatch(batchData) {
        const response = await fetch('/api/batches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchData)
        });
        return await response.json();
    }

    async updateBatch(id, updates) {
        const response = await fetch(`/api/batches/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    }

    async deleteBatch(id) {
        const response = await fetch(`/api/batches/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
}

// Global instance
window.batchService = new BatchService();
