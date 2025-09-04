// Course Service
class CourseService {
    async getCourses() {
        const response = await fetch('/api/courses');
        return await response.json();
    }

    async getCourseById(id) {
        const response = await fetch(`/api/courses/${id}`);
        return await response.json();
    }

    async addCourse(courseData) {
        const response = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
        });
        return await response.json();
    }

    async updateCourse(id, updates) {
        const response = await fetch(`/api/courses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    }

    async deleteCourse(id) {
        const response = await fetch(`/api/courses/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async getCoursesByBatch(batchId) {
        const response = await fetch(`/api/courses/batch/${batchId}`);
        return await response.json();
    }
}

// Global instance
window.courseService = new CourseService();
