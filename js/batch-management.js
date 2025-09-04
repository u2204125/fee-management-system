// Batch Management
class BatchManager {
    constructor() {
        this.cache = {
            batches: [],
            courses: [],
            months: []
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.refresh();
    }

    bindEvents() {
        // Create Batch Form
        const createBatchForm = document.getElementById('createBatchForm');
        if (createBatchForm) {
            createBatchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createBatch();
            });
        }

        // Create Course Form
        const createCourseForm = document.getElementById('createCourseForm');
        if (createCourseForm) {
            createCourseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createCourse();
            });
        }

        // Create Month Form
        const createMonthForm = document.getElementById('createMonthForm');
        if (createMonthForm) {
            createMonthForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createMonth();
            });
        }

        // Month number dropdown change
        const monthNumberSelect = document.getElementById('monthNumber');
        if (monthNumberSelect) {
            monthNumberSelect.addEventListener('change', () => {
                this.toggleCustomMonthNumber();
            });
        }

        // Month name dropdown change
        const monthNameSelect = document.getElementById('monthName');
        if (monthNameSelect) {
            monthNameSelect.addEventListener('change', () => {
                this.toggleCustomMonthName();
            });
        }
    }

    toggleCustomMonthName() {
        const monthNameSelect = document.getElementById('monthName');
        const customMonthNameInput = document.getElementById('customMonthName');
        
        if (monthNameSelect.value === 'custom') {
            customMonthNameInput.style.display = 'block';
            customMonthNameInput.required = true;
        } else {
            customMonthNameInput.style.display = 'none';
            customMonthNameInput.required = false;
            customMonthNameInput.value = '';
        }
    }
    toggleCustomMonthNumber() {
        const monthNumberSelect = document.getElementById('monthNumber');
        const customMonthNumberGroup = document.getElementById('customMonthNumberGroup');
        const customMonthNumberInput = document.getElementById('customMonthNumber');
        
        if (monthNumberSelect.value === 'custom') {
            customMonthNumberGroup.style.display = 'block';
            customMonthNumberInput.required = true;
        } else {
            customMonthNumberGroup.style.display = 'none';
            customMonthNumberInput.required = false;
            customMonthNumberInput.value = '';
        }
    }

    async createBatch() {
        const batchName = Utils.sanitizeInput(document.getElementById('batchName').value);

        if (!batchName) {
            Utils.showToast('Please enter batch name', 'error');
            return;
        }

        try {
            // Check if batch already exists
            const existingBatch = this.cache.batches.find(b =>
                b.name.toLowerCase() === batchName.toLowerCase()
            );

            if (existingBatch) {
                Utils.showToast('Batch with this name already exists', 'error');
                return;
            }

            const response = await fetch('/api/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: batchName })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create batch');
            }

            const newBatch = await response.json();
            this.cache.batches.push(newBatch);

            Utils.showToast('Batch created successfully', 'success');

            document.getElementById('createBatchForm').reset();
            this.refresh();
        } catch (error) {
            console.error('Error creating batch:', error);
            Utils.showToast(error.message || 'Failed to create batch', 'error');
        }
    }

    async createCourse() {
        const courseName = Utils.sanitizeInput(document.getElementById('courseName').value);
        const batchId = document.getElementById('courseBatch').value;

        if (!courseName || !batchId) {
            Utils.showToast('Please fill all fields', 'error');
            return;
        }

        try {
            // Check if course already exists in this batch
            const existingCourse = this.cache.courses.find(c =>
                c.name.toLowerCase() === courseName.toLowerCase() && c.batchId === batchId
            );

            if (existingCourse) {
                Utils.showToast('Course with this name already exists in the selected batch', 'error');
                return;
            }

            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: courseName,
                    batchId: batchId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create course');
            }

            const newCourse = await response.json();
            this.cache.courses.push(newCourse);

            Utils.showToast('Course created successfully', 'success');

            document.getElementById('createCourseForm').reset();
            this.refresh();
        } catch (error) {
            console.error('Error creating course:', error);
            Utils.showToast(error.message || 'Failed to create course', 'error');
        }
    }

    async createMonth() {
        const monthNameSelect = document.getElementById('monthName').value;
        let monthName;

        if (monthNameSelect === 'custom') {
            monthName = Utils.sanitizeInput(document.getElementById('customMonthName').value);
        } else {
            monthName = monthNameSelect;
        }

        const monthNumberSelect = document.getElementById('monthNumber').value;
        let monthNumber;

        if (monthNumberSelect === 'custom') {
            monthNumber = parseInt(document.getElementById('customMonthNumber').value);
        } else {
            monthNumber = parseInt(monthNumberSelect);
        }

        const courseId = document.getElementById('monthCourse').value;
        const payment = parseFloat(document.getElementById('coursePayment').value);

        if (!monthName || !monthNumber || !courseId || !payment || payment <= 0) {
            Utils.showToast('Please fill all fields with valid values', 'error');
            return;
        }

        if (monthNumber < 1 || monthNumber > 999) {
            Utils.showToast('Month number must be between 1 and 999', 'error');
            return;
        }

        try {
            // Check if month already exists for this course
            const existingMonth = this.cache.months.find(m =>
                (m.name.toLowerCase() === monthName.toLowerCase() || m.monthNumber === monthNumber) && m.courseId === courseId
            );

            if (existingMonth) {
                Utils.showToast('Month with this name or number already exists for the selected course', 'error');
                return;
            }

            const response = await fetch('/api/months', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: monthName,
                    monthNumber: monthNumber,
                    courseId: courseId,
                    payment: payment
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create month');
            }

            const newMonth = await response.json();
            this.cache.months.push(newMonth);

            Utils.showToast('Month created successfully', 'success');

            document.getElementById('createMonthForm').reset();
            this.toggleCustomMonthName(); // Reset custom name input visibility
            this.toggleCustomMonthNumber(); // Reset custom input visibility
            this.refresh();
        } catch (error) {
            console.error('Error creating month:', error);
            Utils.showToast(error.message || 'Failed to create month', 'error');
        }
    }

    async refresh() {
        await this.loadBatches();
        await this.loadCourses();
        await this.loadMonths();
        this.updateDropdowns();
    }

    async loadBatches() {
        try {
            const response = await fetch('/api/batches');
            if (!response.ok) {
                throw new Error('Failed to fetch batches');
            }

            this.cache.batches = await response.json();

            const batchList = document.getElementById('batchList');
            batchList.innerHTML = this.cache.batches.map(batch => `
                <div class="entity-item">
                    <div class="entity-info">
                        <div class="entity-name">${batch.name}</div>
                        <div class="entity-details">Created: ${Utils.formatDate(batch.createdAt)}</div>
                    </div>
                    <div class="entity-actions">
                        <button class="btn btn-small btn-outline" onclick="batchManager.editBatch('${batch._id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="batchManager.deleteBatch('${batch._id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading batches:', error);
            const batchList = document.getElementById('batchList');
            batchList.innerHTML = '<p class="text-center">Error loading batches</p>';
        }
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/courses');
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            this.cache.courses = await response.json();

            const courseList = document.getElementById('courseList');
            courseList.innerHTML = this.cache.courses.map(course => {
                const batch = this.cache.batches.find(b => b._id === course.batchId || b._id === course.batchId?._id);
                return `
                    <div class="entity-item">
                        <div class="entity-info">
                            <div class="entity-name">${course.name}</div>
                            <div class="entity-details">Batch: ${batch?.name || 'Unknown'} | Created: ${Utils.formatDate(course.createdAt)}</div>
                        </div>
                        <div class="entity-actions">
                            <button class="btn btn-small btn-outline" onclick="batchManager.editCourse('${course._id}')">Edit</button>
                            <button class="btn btn-small btn-danger" onclick="batchManager.deleteCourse('${course._id}')">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading courses:', error);
            const courseList = document.getElementById('courseList');
            courseList.innerHTML = '<p class="text-center">Error loading courses</p>';
        }
    }

    async loadMonths() {
        try {
            const response = await fetch('/api/months');
            if (!response.ok) {
                throw new Error('Failed to fetch months');
            }

            this.cache.months = await response.json();

            const monthList = document.getElementById('monthList');
            monthList.innerHTML = this.cache.months.map(month => {
                const course = this.cache.courses.find(c => c._id === month.courseId || c._id === month.courseId?._id);
                const batch = course ? this.cache.batches.find(b => b._id === course.batchId || b._id === course.batchId?._id) : null;
                return `
                    <div class="entity-item">
                        <div class="entity-info">
                            <div class="entity-name">${month.name}</div>
                            <div class="entity-details">
                                Course: ${course?.name || 'Unknown'} |
                                Batch: ${batch?.name || 'Unknown'} |
                                Month #: ${month.monthNumber || 'N/A'} |
                                Fee: ${Utils.formatCurrency(month.payment)}
                            </div>
                        </div>
                        <div class="entity-actions">
                            <button class="btn btn-small btn-outline" onclick="batchManager.editMonth('${month._id}')">Edit</button>
                            <button class="btn btn-small btn-danger" onclick="batchManager.deleteMonth('${month._id}')">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading months:', error);
            const monthList = document.getElementById('monthList');
            monthList.innerHTML = '<p class="text-center">Error loading months</p>';
        }
    }

    updateDropdowns() {
        // Update course batch dropdown
        const courseBatchSelect = document.getElementById('courseBatch');

        courseBatchSelect.innerHTML = '<option value="">Select Batch</option>' +
            this.cache.batches.map(batch => `<option value="${batch._id}">${batch.name}</option>`).join('');

        // Update month course dropdown
        const monthCourseSelect = document.getElementById('monthCourse');

        monthCourseSelect.innerHTML = '<option value="">Select Course</option>' +
            this.cache.courses.map(course => {
                const batch = this.cache.batches.find(b => b._id === course.batchId || b._id === course.batchId?._id);
                return `<option value="${course._id}">${course.name} (${batch?.name || 'Unknown Batch'})</option>`;
            }).join('');
    }

    async editBatch(id) {
        const batch = this.cache.batches.find(b => b._id === id);
        if (!batch) return;

        const newName = prompt('Edit batch name:', batch.name);
        if (newName && newName !== batch.name) {
            const sanitizedName = Utils.sanitizeInput(newName);

            try {
                // Check if new name already exists
                const existingBatch = this.cache.batches.find(b =>
                    b.name.toLowerCase() === sanitizedName.toLowerCase() && b._id !== id
                );

                if (existingBatch) {
                    Utils.showToast('Batch with this name already exists', 'error');
                    return;
                }

                const response = await fetch(`/api/batches/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: sanitizedName })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update batch');
                }

                const updatedBatch = await response.json();

                // Update cache
                const index = this.cache.batches.findIndex(b => b._id === id);
                if (index !== -1) {
                    this.cache.batches[index] = updatedBatch;
                }

                Utils.showToast('Batch updated successfully', 'success');
                this.refresh();
            } catch (error) {
                console.error('Error updating batch:', error);
                Utils.showToast(error.message || 'Failed to update batch', 'error');
            }
        }
    }

    async editCourse(id) {
        const course = this.cache.courses.find(c => c._id === id);
        if (!course) return;

        const newName = prompt('Edit course name:', course.name);
        if (newName && newName !== course.name) {
            const sanitizedName = Utils.sanitizeInput(newName);

            try {
                // Check if new name already exists in the same batch
                const existingCourse = this.cache.courses.find(c =>
                    c.name.toLowerCase() === sanitizedName.toLowerCase() &&
                    c.batchId === course.batchId &&
                    c._id !== id
                );

                if (existingCourse) {
                    Utils.showToast('Course with this name already exists in this batch', 'error');
                    return;
                }

                const response = await fetch(`/api/courses/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: sanitizedName })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update course');
                }

                const updatedCourse = await response.json();

                // Update cache
                const index = this.cache.courses.findIndex(c => c._id === id);
                if (index !== -1) {
                    this.cache.courses[index] = updatedCourse;
                }

                Utils.showToast('Course updated successfully', 'success');
                this.refresh();
            } catch (error) {
                console.error('Error updating course:', error);
                Utils.showToast(error.message || 'Failed to update course', 'error');
            }
        }
    }

    async editMonth(id) {
        const month = this.cache.months.find(m => m._id === id);
        if (!month) return;

        const newName = prompt('Edit month name:', month.name);
        const newPayment = prompt('Edit payment amount:', month.payment);

        if (newName || newPayment) {
            const updates = {};

            try {
                if (newName && newName !== month.name) {
                    const sanitizedName = Utils.sanitizeInput(newName);

                    // Check if new name already exists for the same course
                    const existingMonth = this.cache.months.find(m =>
                        m.name.toLowerCase() === sanitizedName.toLowerCase() &&
                        m.courseId === month.courseId &&
                        m._id !== id
                    );

                    if (existingMonth) {
                        Utils.showToast('Month with this name already exists for this course', 'error');
                        return;
                    }

                    updates.name = sanitizedName;
                }

                if (newPayment && parseFloat(newPayment) > 0 && parseFloat(newPayment) !== month.payment) {
                    updates.payment = parseFloat(newPayment);
                }

                if (Object.keys(updates).length > 0) {
                    const response = await fetch(`/api/months/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to update month');
                    }

                    const updatedMonth = await response.json();

                    // Update cache
                    const index = this.cache.months.findIndex(m => m._id === id);
                    if (index !== -1) {
                        this.cache.months[index] = updatedMonth;
                    }

                    Utils.showToast('Month updated successfully', 'success');
                    this.refresh();
                }
            } catch (error) {
                console.error('Error updating month:', error);
                Utils.showToast(error.message || 'Failed to update month', 'error');
            }
        }
    }

    async deleteBatch(id) {
        Utils.confirm('Are you sure you want to delete this batch? This will also delete all related courses and months.', async () => {
            try {
                const response = await fetch(`/api/batches/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete batch');
                }

                // Remove from cache
                this.cache.batches = this.cache.batches.filter(b => b._id !== id);
                // Also remove related courses and months from cache
                this.cache.courses = this.cache.courses.filter(c => c.batchId !== id);
                this.cache.months = this.cache.months.filter(m => {
                    const course = this.cache.courses.find(c => c._id === m.courseId);
                    return course !== undefined;
                });

                Utils.showToast('Batch deleted successfully', 'success');
                this.refresh();
            } catch (error) {
                console.error('Error deleting batch:', error);
                Utils.showToast(error.message || 'Failed to delete batch', 'error');
            }
        });
    }

    async deleteCourse(id) {
        Utils.confirm('Are you sure you want to delete this course? This will also delete all related months.', async () => {
            try {
                const response = await fetch(`/api/courses/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete course');
                }

                // Remove from cache
                this.cache.courses = this.cache.courses.filter(c => c._id !== id);
                // Also remove related months from cache
                this.cache.months = this.cache.months.filter(m => m.courseId !== id);

                Utils.showToast('Course deleted successfully', 'success');
                this.refresh();
            } catch (error) {
                console.error('Error deleting course:', error);
                Utils.showToast(error.message || 'Failed to delete course', 'error');
            }
        });
    }

    async deleteMonth(id) {
        Utils.confirm('Are you sure you want to delete this month?', async () => {
            try {
                const response = await fetch(`/api/months/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete month');
                }

                // Remove from cache
                this.cache.months = this.cache.months.filter(m => m._id !== id);

                Utils.showToast('Month deleted successfully', 'success');
                this.refresh();
            } catch (error) {
                console.error('Error deleting month:', error);
                Utils.showToast(error.message || 'Failed to delete month', 'error');
            }
        });
    }
}

// Global batch manager instance
window.batchManager = new BatchManager();
