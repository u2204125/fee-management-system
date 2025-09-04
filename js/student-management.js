// Student Management
class StudentManagementManager {
    constructor() {
        this.isInitialized = false;
        this.init().catch(console.error);
    }

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.bindEvents();
        await this.refresh();
    }

    bindEvents() {
        // Create Institution Form
        const institutionForm = document.getElementById('createInstitutionForm');
        if (institutionForm) {
            institutionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createInstitution();
            });
        }

        // Add Student Form
        const studentForm = document.getElementById('addStudentForm');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addStudent();
            });
        }

        // Search and filter events
        const studentSearch = document.getElementById('studentSearch');
        if (studentSearch) {
            studentSearch.addEventListener('input', Utils.debounce(() => {
                this.filterStudents();
            }, 300));
        }

        const paymentFilter = document.getElementById('paymentFilter');
        if (paymentFilter) {
            paymentFilter.addEventListener('change', () => {
                this.filterStudents();
            });
        }
    }

    async createInstitution() {
        const name = document.getElementById('institutionName').value.trim();
        const address = document.getElementById('institutionAddress').value.trim();

        if (!name || !address) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }

        try {
            // Check if institution already exists
            const response = await fetch('/api/institutions');
            const institutions = await response.json();
            const existingInstitution = institutions.find(inst => 
                inst.name.toLowerCase() === name.toLowerCase()
            );

            if (existingInstitution) {
                Utils.showToast('Institution with this name already exists', 'error');
                return;
            }

            const institutionData = {
                name: Utils.sanitizeInput(name),
                address: Utils.sanitizeInput(address)
            };

            const createResponse = await fetch('/api/institutions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(institutionData)
            });

            if (createResponse.ok) {
                const institution = await createResponse.json();
                Utils.showToast('Institution created successfully', 'success');
                document.getElementById('createInstitutionForm').reset();
                
                // Clear cache first
                localStorage.removeItem('institutions_cache');
                
                // Refresh the UI
                await this.loadInstitutions();
                await this.updateInstitutionDropdown();
            } else {
                const error = await createResponse.json();
                Utils.showToast(error.message || 'Failed to create institution', 'error');
            }
        } catch (error) {
            console.error('Error creating institution:', error);
            Utils.showToast('Failed to create institution', 'error');
        }
    }

    async addStudent() {
        const name = document.getElementById('studentName').value.trim();
        const institutionId = document.getElementById('studentInstitution').value;
        const gender = document.getElementById('studentGender').value;
        const phone = document.getElementById('studentPhone').value.trim();
        const guardianName = document.getElementById('guardianName').value.trim();
        const guardianPhone = document.getElementById('guardianPhone').value.trim();
        const batchId = document.getElementById('studentBatch').value;

        if (!name || !institutionId || !gender || !phone || !guardianName || !guardianPhone || !batchId) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!Utils.validatePhone(phone) || !Utils.validatePhone(guardianPhone)) {
            Utils.showToast('Please enter valid phone numbers', 'error');
            return;
        }

        // Get enrolled courses with starting months
        const enrolledCourses = this.getEnrolledCourses();
        
        if (enrolledCourses.length === 0) {
            Utils.showToast('Please select at least one course', 'error');
            return;
        }
        const studentData = {
            name: Utils.sanitizeInput(name),
            institutionId,
            gender,
            phone: Utils.sanitizeInput(phone),
            guardianName: Utils.sanitizeInput(guardianName),
            guardianPhone: Utils.sanitizeInput(guardianPhone),
            batchId,
            enrolledCourses
        };

        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });

            if (response.ok) {
                const student = await response.json();
                
                // Log activity
                if (window.activityService) {
                    await window.activityService.addActivity(
                        'student_added',
                        `Added new student: ${student.name} (ID: ${student.studentId})`,
                        { studentId: student._id, studentName: student.name, studentNumber: student.studentId }
                    );
                }
                
                Utils.showToast(`Student added successfully with ID: ${student.studentId}`, 'success');
                document.getElementById('addStudentForm').reset();
                this.clearCourseSelection();
                
                // Clear cache
                localStorage.removeItem('students_cache');
                
                // Refresh dashboard if it exists
                if (window.dashboardManager) {
                    window.dashboardManager.refresh();
                }
            } else {
                const error = await response.json();
                Utils.showToast(error.message || 'Failed to add student', 'error');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            Utils.showToast('Failed to add student', 'error');
        }
    }

    async refresh() {
        await this.loadInstitutions();
        await this.updateInstitutionDropdown();
        await this.updateBatchDropdown();
    }

    async loadInstitutions() {
        const institutionList = document.getElementById('institutionList');
        if (!institutionList) return;

        try {
            // Check cache first
            let institutions = JSON.parse(localStorage.getItem('institutions_cache') || 'null');
            if (!institutions) {
                const response = await fetch('/api/institutions');
                institutions = await response.json();
                // Cache for 5 minutes
                localStorage.setItem('institutions_cache', JSON.stringify(institutions));
                setTimeout(() => localStorage.removeItem('institutions_cache'), 5 * 60 * 1000);
            }
            
            if (institutions.length === 0) {
                institutionList.innerHTML = '<p class="empty-state">No institutions found. Please create one first.</p>';
                return;
            }

            let html = '<div class="institutions-grid">';
            institutions.forEach(institution => {
                html += `
                    <div class="institution-card">
                        <h4>${Utils.escapeHtml(institution.name)}</h4>
                        <p><strong>Address:</strong> ${Utils.escapeHtml(institution.address)}</p>
                        <div class="card-actions">
                            <button class="btn btn-sm btn-secondary" onclick="window.studentManagementManager.editInstitution('${institution._id}')">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="window.studentManagementManager.deleteInstitution('${institution._id}')">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            institutionList.innerHTML = html;
        } catch (error) {
            console.error('Error loading institutions:', error);
            institutionList.innerHTML = '<p class="error-state">Failed to load institutions.</p>';
        }
    }

    async updateInstitutionDropdown() {
        const institutionSelect = document.getElementById('studentInstitution');
        if (!institutionSelect) return;

        try {
            // Check cache first
            let institutions = JSON.parse(localStorage.getItem('institutions_cache') || 'null');
            if (!institutions) {
                const response = await fetch('/api/institutions');
                institutions = await response.json();
                // Cache for 5 minutes
                localStorage.setItem('institutions_cache', JSON.stringify(institutions));
                setTimeout(() => localStorage.removeItem('institutions_cache'), 5 * 60 * 1000);
            }

            institutionSelect.innerHTML = '<option value="">Select Institution</option>';
            institutions.forEach(institution => {
                institutionSelect.innerHTML += `<option value="${institution._id}">${Utils.escapeHtml(institution.name)}</option>`;
            });
        } catch (error) {
            console.error('Error loading institutions for dropdown:', error);
        }
    }

    async updateBatchDropdown() {
        const batchSelect = document.getElementById('studentBatch');
        if (!batchSelect) return;

        try {
            // Check cache first
            let batches = JSON.parse(localStorage.getItem('batches_cache') || 'null');
            if (!batches) {
                const response = await fetch('/api/batches');
                batches = await response.json();
                // Cache for 5 minutes
                localStorage.setItem('batches_cache', JSON.stringify(batches));
                setTimeout(() => localStorage.removeItem('batches_cache'), 5 * 60 * 1000);
            }

            batchSelect.innerHTML = '<option value="">Select Batch</option>';
            batches.forEach(batch => {
                batchSelect.innerHTML += `<option value="${batch._id}">${Utils.escapeHtml(batch.name)}</option>`;
            });

            // Update course selection when batch changes
            batchSelect.addEventListener('change', () => {
                this.updateCourseSelection();
            });
        } catch (error) {
            console.error('Error loading batches for dropdown:', error);
        }
    }

    async updateCourseSelection() {
        const batchId = document.getElementById('studentBatch').value;
        const courseSelectionDiv = document.getElementById('courseSelection');
        
        if (!courseSelectionDiv) return;
        
        if (!batchId) {
            courseSelectionDiv.innerHTML = '<p>Please select a batch first</p>';
            return;
        }
        
        try {
            // Get courses for the selected batch
            const response = await fetch(`/api/courses?batchId=${batchId}`);
            const courses = await response.json();
            
            if (courses.length === 0) {
                courseSelectionDiv.innerHTML = '<p>No courses available for this batch</p>';
                return;
            }
            
            let courseItems = [];
            for (const course of courses) {
                const monthsResponse = await fetch(`/api/months?courseId=${course._id}`);
                const months = await monthsResponse.json();
                const monthOptions = months.map(month => 
                    `<option value="${month._id}">${month.name}</option>`
                ).join('');
                
                courseItems.push(`
                    <div class="course-enrollment-item">
                        <div class="course-checkbox">
                            <input type="checkbox" id="course_${course._id}" value="${course._id}" onchange="window.studentManagementManager.toggleCourseSelection('${course._id}')">
                            <label for="course_${course._id}">${course.name}</label>
                        </div>
                        <div class="starting-month-select" id="startingMonth_${course._id}" style="display: none;">
                            <label for="startMonth_${course._id}">Starting Month:</label>
                            <select id="startMonth_${course._id}">
                                <option value="">Select Starting Month</option>
                                ${monthOptions}
                            </select>
                            <label for="endMonth_${course._id}">Ending Month (Optional):</label>
                            <select id="endMonth_${course._id}">
                                <option value="">No End Date</option>
                                ${monthOptions}
                            </select>
                        </div>
                    </div>
                `);
            }
            
            courseSelectionDiv.innerHTML = courseItems.join('');
        } catch (error) {
            console.error('Error loading courses:', error);
            courseSelectionDiv.innerHTML = '<p>Error loading courses</p>';
        }
    }

    toggleCourseSelection(courseId) {
        const checkbox = document.getElementById(`course_${courseId}`);
        const startingMonthDiv = document.getElementById(`startingMonth_${courseId}`);
        
        if (checkbox.checked) {
            startingMonthDiv.style.display = 'block';
        } else {
            startingMonthDiv.style.display = 'none';
            document.getElementById(`startMonth_${courseId}`).value = '';
        }
    }

    getEnrolledCourses() {
        const enrolledCourses = [];
        const courseCheckboxes = document.querySelectorAll('#courseSelection input[type="checkbox"]:checked');
        
        courseCheckboxes.forEach(checkbox => {
            const courseId = checkbox.value;
            const startingMonthId = document.getElementById(`startMonth_${courseId}`).value;
            const endingMonthId = document.getElementById(`endMonth_${courseId}`).value;
            
            if (startingMonthId) {
                const enrollment = {
                    courseId,
                    startingMonthId
                };
                
                if (endingMonthId) {
                    enrollment.endingMonthId = endingMonthId;
                }
                
                enrolledCourses.push(enrollment);
            }
        });
        
        return enrolledCourses;
    }

    getEditEnrolledCourses() {
        const enrolledCourses = [];
        const courseCheckboxes = document.querySelectorAll('#editCourseSelection input[type="checkbox"]:checked');
        
        courseCheckboxes.forEach(checkbox => {
            const courseId = checkbox.value;
            const startingMonthId = document.getElementById(`editStartMonth_${courseId}`).value;
            const endingMonthId = document.getElementById(`editEndMonth_${courseId}`).value;
            
            if (startingMonthId) {
                const enrollment = {
                    courseId,
                    startingMonthId
                };
                
                if (endingMonthId) {
                    enrollment.endingMonthId = endingMonthId;
                }
                
                enrolledCourses.push(enrollment);
            }
        });
        
        return enrolledCourses;
    }

    toggleEditCourseSelection(courseId) {
        const checkbox = document.getElementById(`editCourse_${courseId}`);
        const startingMonthDiv = document.getElementById(`editStartingMonth_${courseId}`);
        
        if (checkbox.checked) {
            startingMonthDiv.style.display = 'block';
        } else {
            startingMonthDiv.style.display = 'none';
            document.getElementById(`editStartMonth_${courseId}`).value = '';
        }
    }

    clearCourseSelection() {
        const courseSelectionDiv = document.getElementById('courseSelection');
        if (courseSelectionDiv) {
            courseSelectionDiv.innerHTML = '<p>Please select a batch first</p>';
        }
    }

    async editInstitution(id) {
        try {
            const response = await fetch(`/api/institutions/${id}`);
            const institution = await response.json();
            if (!institution) return;

            const editForm = `
                <form id="editInstitutionForm">
                    <div class="form-group">
                        <label for="editInstitutionName">Institution Name</label>
                        <input type="text" id="editInstitutionName" value="${institution.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editInstitutionAddress">Institution Address</label>
                        <textarea id="editInstitutionAddress" required>${institution.address}</textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Update Institution</button>
                        <button type="button" class="btn btn-outline" onclick="navigationManager.closeModal(document.getElementById('editModal'))">Cancel</button>
                    </div>
                </form>
            `;

            document.getElementById('editModalTitle').textContent = 'Edit Institution';
            document.getElementById('editModalBody').innerHTML = editForm;
            document.getElementById('editModal').classList.add('active');

            document.getElementById('editInstitutionForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('editInstitutionName').value.trim();
                const address = document.getElementById('editInstitutionAddress').value.trim();

                if (!name || !address) {
                    Utils.showToast('Please fill in all fields', 'error');
                    return;
                }

                try {
                    const updateResponse = await fetch(`/api/institutions/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: Utils.sanitizeInput(name),
                            address: Utils.sanitizeInput(address)
                        })
                    });

                    if (updateResponse.ok) {
                        Utils.showToast('Institution updated successfully', 'success');
                        document.getElementById('editModal').classList.remove('active');
                        
                        // Clear cache first
                        localStorage.removeItem('institutions_cache');
                        
                        // Refresh the UI
                        await this.loadInstitutions();
                        await this.updateInstitutionDropdown();
                    } else {
                        const error = await updateResponse.json();
                        Utils.showToast(error.message || 'Failed to update institution', 'error');
                    }
                } catch (error) {
                    console.error('Error updating institution:', error);
                    Utils.showToast('Failed to update institution', 'error');
                }
            });
        } catch (error) {
            console.error('Error fetching institution:', error);
            Utils.showToast('Failed to load institution data', 'error');
        }
    }

    async deleteInstitution(id) {
        try {
            const response = await fetch(`/api/institutions/${id}`);
            const institution = await response.json();
            if (!institution) return;

            Utils.confirm(`Are you sure you want to delete "${institution.name}"?`, async () => {
                try {
                    const deleteResponse = await fetch(`/api/institutions/${id}`, {
                        method: 'DELETE'
                    });

                    if (deleteResponse.ok) {
                        Utils.showToast('Institution deleted successfully', 'success');
                        
                        // Clear cache first
                        localStorage.removeItem('institutions_cache');
                        
                        // Refresh the UI
                        await this.loadInstitutions();
                        await this.updateInstitutionDropdown();
                    } else {
                        const error = await deleteResponse.json();
                        Utils.showToast(error.message || 'Failed to delete institution', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting institution:', error);
                    Utils.showToast('Failed to delete institution', 'error');
                }
            });
        } catch (error) {
            console.error('Error fetching institution:', error);
            Utils.showToast('Failed to load institution data', 'error');
        }
    }

    editStudent(id) {
        const student = window.storageManager.getStudentById(id);
        if (!student) return;

        const institutions = window.storageManager.getInstitutions();
        const batches = window.storageManager.getBatches();
        const allCourses = window.storageManager.getCoursesByBatch(student.batchId);
        const enrolledCourseIds = (student.enrolledCourses || []).map(e => e.courseId);

        const editForm = `
            <form id="editStudentForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editStudentName">Student Name</label>
                        <input type="text" id="editStudentName" value="${student.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editStudentInstitution">Institution</label>
                        <select id="editStudentInstitution" required>
                            <option value="">Select Institution</option>
                            ${institutions.map(inst => 
                                `<option value="${inst.id}" ${inst.id === student.institutionId ? 'selected' : ''}>${inst.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editStudentGender">Gender</label>
                        <select id="editStudentGender" required>
                            <option value="">Select Gender</option>
                            <option value="Male" ${student.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${student.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Custom" ${student.gender === 'Custom' ? 'selected' : ''}>Custom</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editStudentPhone">Student Phone</label>
                        <input type="tel" id="editStudentPhone" value="${student.phone}" required>
                    </div>
                    <div class="form-group">
                        <label for="editGuardianName">Guardian Name</label>
                        <input type="text" id="editGuardianName" value="${student.guardianName}" required>
                    </div>
                    <div class="form-group">
                        <label for="editGuardianPhone">Guardian Phone</label>
                        <input type="tel" id="editGuardianPhone" value="${student.guardianPhone}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editStudentBatch">Batch</label>
                        <select id="editStudentBatch" required>
                            <option value="">Select Batch</option>
                            ${batches.map(batch => 
                                `<option value="${batch.id}" ${batch.id === student.batchId ? 'selected' : ''}>${batch.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Course Enrollment</label>
                    <div id="editCourseSelection" class="course-selection">
                        ${allCourses.map(course => {
                            const isEnrolled = enrolledCourseIds.includes(course.id);
                            const enrollment = isEnrolled ? student.enrolledCourses.find(e => e.courseId === course.id) : null;
                            const months = window.storageManager.getMonthsByCourse(course.id);
                            const monthOptions = months.map(month => 
                                `<option value="${month.id}" ${enrollment && enrollment.startingMonthId === month.id ? 'selected' : ''}>${month.name}</option>`
                            ).join('');
                            const endMonthOptions = months.map(month => 
                                `<option value="${month.id}" ${enrollment && enrollment.endingMonthId === month.id ? 'selected' : ''}>${month.name}</option>`
                            ).join('');
                            
                            return `
                                <div class="course-enrollment-item">
                                    <div class="course-checkbox">
                                        <input type="checkbox" id="editCourse_${course.id}" value="${course.id}" ${isEnrolled ? 'checked' : ''} onchange="studentManager.toggleEditCourseSelection('${course.id}')">
                                        <label for="editCourse_${course.id}">${course.name}</label>
                                    </div>
                                    <div class="starting-month-select" id="editStartingMonth_${course.id}" style="display: ${isEnrolled ? 'block' : 'none'};">
                                        <label for="editStartMonth_${course.id}">Starting Month:</label>
                                        <select id="editStartMonth_${course.id}">
                                            <option value="">Select Starting Month</option>
                                            ${monthOptions}
                                        </select>
                                        <label for="editEndMonth_${course.id}">Ending Month (Optional):</label>
                                        <select id="editEndMonth_${course.id}">
                                            <option value="">No End Date</option>
                                            ${endMonthOptions}
                                        </select>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Update Student</button>
                    <button type="button" class="btn btn-outline" onclick="navigationManager.closeModal(document.getElementById('editModal'))">Cancel</button>
                </div>
            </form>
        `;

        window.navigationManager.showModal('editModal', 'Edit Student', editForm);

        document.getElementById('editStudentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('editStudentName').value.trim();
            const institutionId = document.getElementById('editStudentInstitution').value;
            const gender = document.getElementById('editStudentGender').value;
            const phone = document.getElementById('editStudentPhone').value.trim();
            const guardianName = document.getElementById('editGuardianName').value.trim();
            const guardianPhone = document.getElementById('editGuardianPhone').value.trim();
            const batchId = document.getElementById('editStudentBatch').value;
            const enrolledCourses = this.getEditEnrolledCourses();

            if (!name || !institutionId || !gender || !phone || !guardianName || !guardianPhone || !batchId) {
                Utils.showToast('Please fill in all fields', 'error');
                return;
            }

            if (!Utils.validatePhone(phone) || !Utils.validatePhone(guardianPhone)) {
                Utils.showToast('Please enter valid phone numbers', 'error');
                return;
            }

            if (enrolledCourses.length === 0) {
                Utils.showToast('Please select at least one course', 'error');
                return;
            }
            const result = window.storageManager.updateStudent(id, {
                name: Utils.sanitizeInput(name),
                institutionId,
                gender,
                phone: Utils.sanitizeInput(phone),
                guardianName: Utils.sanitizeInput(guardianName),
                guardianPhone: Utils.sanitizeInput(guardianPhone),
                batchId,
                enrolledCourses
            });

            if (result) {
                Utils.showToast('Student updated successfully', 'success');
                window.navigationManager.closeModal(document.getElementById('editModal'));
            }
        });
    }

    deleteStudent(id) {
        const student = window.storageManager.getStudentById(id);
        if (!student) return;

        Utils.confirm(`Are you sure you want to delete "${student.name}"?`, () => {
            const result = window.storageManager.deleteStudent(id);
            if (result.success) {
                Utils.showToast('Student deleted successfully', 'success');
            } else {
                Utils.showToast(result.message, 'error');
            }
        });
    }
}

// Global student management manager instance
window.studentManagementManager = new StudentManagementManager();
