// Student Service
class StudentService {
    async generateStudentId() {
        const response = await fetch('/api/students/generate-id');
        const data = await response.json();
        return data.studentId;
    }

    async getStudents() {
        const response = await fetch('/api/students');
        return await response.json();
    }

    async getStudentById(id) {
        const response = await fetch(`/api/students/${id}`);
        return await response.json();
    }

    async getStudentByStudentId(studentId) {
        const response = await fetch(`/api/students/byStudentId/${studentId}`);
        return await response.json();
    }

    async addStudent(studentData) {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        return await response.json();
    }

    async updateStudent(id, updates) {
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    }

    async deleteStudent(id) {
        const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async getStudentsByBatch(batchId) {
        const response = await fetch(`/api/students/batch/${batchId}`);
        return await response.json();
    }
}

// Global instance
window.studentService = new StudentService();
