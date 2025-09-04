// Students Database Management
class StudentsDatabaseManager {
    constructor() {
        this.isInitialized = false;
        this.currentFilters = {};
        this.filteredStudents = [];
        // Cache for reference data
        this.batches = [];
        this.courses = [];
        this.months = [];
        this.institutions = [];
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.bindEvents();
        this.refresh();
    }

    bindEvents() {
        // Search input with debounce
        const searchInput = document.getElementById('dbSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(async () => {
                await this.applyFilters();
            }, 300));
        }

        // Filter dropdowns
        const filterElements = [
            'dbBatchFilter', 'dbCourseFilter', 'dbMonthFilter', 
            'dbPaymentStatusFilter', 'dbInstitutionFilter', 'dbGenderFilter'
        ];

        filterElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('change', async () => {
                    await this.applyFilters();
                });
            }
        });

        // Action buttons
        const clearBtn = document.getElementById('dbClearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                await this.clearFilters();
            });
        }

        const exportBtn = document.getElementById('dbExportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
    }

    async refresh() {
        await this.updateFilterDropdowns();
        await this.applyFilters();
    }

    async updateFilterDropdowns() {
        // Update Batch filter
        const batchFilter = document.getElementById('dbBatchFilter');
        if (batchFilter) {
            try {
                const response = await fetch('/api/batches');
                this.batches = await response.json();
                batchFilter.innerHTML = '<option value="">All Batches</option>' +
                    this.batches.map(batch => `<option value="${batch._id}">${batch.name}</option>`).join('');
            } catch (error) {
                console.error('Error loading batches for filter:', error);
                this.batches = [];
            }
        }

        // Update Course filter
        const courseFilter = document.getElementById('dbCourseFilter');
        if (courseFilter) {
            try {
                const response = await fetch('/api/courses');
                this.courses = await response.json();
                courseFilter.innerHTML = '<option value="">All Courses</option>' +
                    this.courses.map(course => {
                        return `<option value="${course._id}">${course.name}</option>`;
                    }).join('');
            } catch (error) {
                console.error('Error loading courses for filter:', error);
                this.courses = [];
            }
        }

        // Update Month filter
        const monthFilter = document.getElementById('dbMonthFilter');
        if (monthFilter) {
            try {
                const response = await fetch('/api/months');
                this.months = await response.json();
                monthFilter.innerHTML = '<option value="">All Months</option>' +
                    this.months.map(month => {
                        return `<option value="${month._id}">${month.name}</option>`;
                    }).join('');
            } catch (error) {
                console.error('Error loading months for filter:', error);
                this.months = [];
            }
        }

        // Update Institution filter
        const institutionFilter = document.getElementById('dbInstitutionFilter');
        if (institutionFilter) {
            try {
                const response = await fetch('/api/institutions');
                this.institutions = await response.json();
                institutionFilter.innerHTML = '<option value="">All Institutions</option>' +
                    this.institutions.map(inst => `<option value="${inst._id}">${inst.name}</option>`).join('');
            } catch (error) {
                console.error('Error loading institutions for filter:', error);
                this.institutions = [];
            }
        }
    }

    async applyFilters() {
        const searchTerm = document.getElementById('dbSearchInput')?.value.toLowerCase() || '';
        const batchFilter = document.getElementById('dbBatchFilter')?.value || '';
        const courseFilter = document.getElementById('dbCourseFilter')?.value || '';
        const monthFilter = document.getElementById('dbMonthFilter')?.value || '';
        const paymentStatusFilter = document.getElementById('dbPaymentStatusFilter')?.value || '';
        const institutionFilter = document.getElementById('dbInstitutionFilter')?.value || '';
        const genderFilter = document.getElementById('dbGenderFilter')?.value || '';

        console.log('Applying filters:', {
            searchTerm, batchFilter, courseFilter, monthFilter, 
            paymentStatusFilter, institutionFilter, genderFilter
        });

        try {
            // Fetch students from API
            const response = await fetch('/api/students');
            let students = await response.json();
            
            console.log('Fetched students:', students.length);
            console.log('First student sample:', students[0]);

            // Apply search filter
            if (searchTerm) {
                students = students.filter(student => 
                    student.name.toLowerCase().includes(searchTerm) ||
                    student.studentId.toLowerCase().includes(searchTerm) ||
                    student.phone.includes(searchTerm) ||
                    student.guardianName.toLowerCase().includes(searchTerm) ||
                    student.guardianPhone.includes(searchTerm)
                );
                console.log('After search filter:', students.length);
            }

            // Apply batch filter
            if (batchFilter) {
                students = students.filter(student => {
                    const batchId = student.batchId?._id || student.batchId;
                    return batchId === batchFilter;
                });
                console.log('After batch filter:', students.length);
            }

            // Apply institution filter
            if (institutionFilter) {
                students = students.filter(student => {
                    const institutionId = student.institutionId?._id || student.institutionId;
                    return institutionId === institutionFilter;
                });
                console.log('After institution filter:', students.length);
            }

            // Apply gender filter
            if (genderFilter) {
                students = students.filter(student => student.gender === genderFilter);
                console.log('After gender filter:', students.length);
            }

            // Apply course filter
            if (courseFilter) {
                students = students.filter(student => {
                    if (!student.enrolledCourses) return false;
                    return student.enrolledCourses.some(enrollment => {
                        const courseId = enrollment.courseId?._id || enrollment.courseId;
                        return courseId === courseFilter;
                    });
                });
            }

            // Apply month filter
            if (monthFilter) {
                students = students.filter(student => {
                    if (!student.enrolledCourses) return false;
                    
                    return student.enrolledCourses.some(enrollment => {
                        const courseId = enrollment.courseId?._id || enrollment.courseId;
                        const allCourseMonths = this.months.filter(m => {
                            const mCourseId = m.courseId?._id || m.courseId;
                            return mCourseId === courseId;
                        });
                        
                        const startingMonthId = enrollment.startingMonthId?._id || enrollment.startingMonthId;
                        const endingMonthId = enrollment.endingMonthId?._id || enrollment.endingMonthId;
                        
                        if (startingMonthId) {
                            const startingMonth = this.months.find(m => (m._id || m.id) === startingMonthId);
                            const endingMonth = endingMonthId ? this.months.find(m => (m._id || m.id) === endingMonthId) : null;
                            
                            if (startingMonth) {
                                let applicableMonths = allCourseMonths.filter(month => 
                                    (month.monthNumber || 0) >= (startingMonth.monthNumber || 0)
                                );
                                
                                if (endingMonth) {
                                    applicableMonths = applicableMonths.filter(month => 
                                        (month.monthNumber || 0) <= (endingMonth.monthNumber || 0)
                                    );
                                }
                                
                                return applicableMonths.some(month => (month._id || month.id) === monthFilter);
                            }
                        }
                        
                        return false;
                    });
                });
            }

            // Apply payment status filter
            if (paymentStatusFilter) {
                students = students.filter(student => {
                    const monthPaymentDetails = student.monthPaymentDetails || {};
                    let totalDue = 0;
                    let totalPaid = 0;

                    if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                        student.enrolledCourses.forEach(enrollment => {
                            const courseId = enrollment.courseId?._id || enrollment.courseId;
                            const course = this.courses.find(c => (c._id || c.id) === courseId);
                            if (course) {
                                const allCourseMonths = this.months.filter(m => {
                                    const mCourseId = m.courseId?._id || m.courseId;
                                    return mCourseId === courseId;
                                }).sort((a, b) => (a.monthNumber || 0) - (b.monthNumber || 0));
                                
                                const startingMonthId = enrollment.startingMonthId?._id || enrollment.startingMonthId;
                                const endingMonthId = enrollment.endingMonthId?._id || enrollment.endingMonthId;
                                
                                if (startingMonthId) {
                                    const startingMonth = this.months.find(m => (m._id || m.id) === startingMonthId);
                                    const endingMonth = endingMonthId ? this.months.find(m => (m._id || m.id) === endingMonthId) : null;
                                    
                                    if (startingMonth) {
                                        let applicableMonths = allCourseMonths.filter(month => 
                                            (month.monthNumber || 0) >= (startingMonth.monthNumber || 0)
                                        );
                                        
                                        if (endingMonth) {
                                            applicableMonths = applicableMonths.filter(month => 
                                                (month.monthNumber || 0) <= (endingMonth.monthNumber || 0)
                                            );
                                        }
                                        
                                        applicableMonths.forEach(month => {
                                            totalDue += month.payment;
                                            const monthId = month._id || month.id;
                                            const monthPayment = monthPaymentDetails[monthId];
                                            if (monthPayment) {
                                                totalPaid += monthPayment.totalPaid + monthPayment.totalDiscount;
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }

                    const totalCovered = totalPaid;
                    const unpaidDue = Math.max(0, totalDue - totalCovered);

                    switch (paymentStatusFilter) {
                        case 'paid':
                            return totalDue > 0 && unpaidDue <= 0;
                        case 'partial':
                            return totalCovered > 0 && unpaidDue > 0;
                        case 'unpaid':
                            return totalCovered === 0 && totalDue > 0;
                        default:
                            return true;
                    }
                });
            }

            this.filteredStudents = students;
            console.log('Final filtered students:', students.length);
            this.renderStudents(students);
            this.updateSummary(students);
        } catch (error) {
            console.error('Error applying filters:', error);
            // Show error message to user
            const studentsList = document.getElementById('dbStudentsList');
            if (studentsList) {
                studentsList.innerHTML = `
                    <div class="error-state">
                        <h3>Error loading students</h3>
                        <p>Please try refreshing the page.</p>
                    </div>
                `;
            }
        }
    }

    renderStudents(students) {
        const studentsList = document.getElementById('dbStudentsList');
        if (!studentsList) return;

        if (students.length === 0) {
            studentsList.innerHTML = `
                <div class="no-results">
                    <h3>No students found</h3>
                    <p>Try adjusting your filters to see more results.</p>
                </div>
            `;
            return;
        }

        let html = '';
        students.forEach(student => {
            const institutionName = student.institutionId?.name || 'Not assigned';
            const batchName = student.batchId?.name || 'Not assigned';
            const monthPaymentDetails = student.monthPaymentDetails || {};
            
            let totalDue = 0;
            let totalPaid = 0;
            let courseNames = '';
            
            if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                student.enrolledCourses.forEach(enrollment => {
                    const courseId = enrollment.courseId?._id || enrollment.courseId;
                    const course = this.courses.find(c => (c._id || c.id) === courseId);
                    if (course) {
                        courseNames += course.name + ', ';
                        
                        const allCourseMonths = this.months.filter(m => {
                            const mCourseId = m.courseId?._id || m.courseId;
                            return mCourseId === courseId;
                        }).sort((a, b) => (a.monthNumber || 0) - (b.monthNumber || 0));
                        
                        const startingMonthId = enrollment.startingMonthId?._id || enrollment.startingMonthId;
                        const endingMonthId = enrollment.endingMonthId?._id || enrollment.endingMonthId;
                        
                        if (startingMonthId) {
                            const startingMonth = this.months.find(m => (m._id || m.id) === startingMonthId);
                            const endingMonth = endingMonthId ? this.months.find(m => (m._id || m.id) === endingMonthId) : null;
                            
                            if (startingMonth) {
                                let applicableMonths = allCourseMonths.filter(month => 
                                    (month.monthNumber || 0) >= (startingMonth.monthNumber || 0)
                                );
                                
                                if (endingMonth) {
                                    applicableMonths = applicableMonths.filter(month => 
                                        (month.monthNumber || 0) <= (endingMonth.monthNumber || 0)
                                    );
                                }
                                
                                applicableMonths.forEach(month => {
                                    totalDue += month.payment;
                                    const monthId = month._id || month.id;
                                    const monthPayment = monthPaymentDetails[monthId];
                                    if (monthPayment) {
                                        totalPaid += monthPayment.totalPaid + monthPayment.totalDiscount;
                                    }
                                });
                            }
                        }
                    }
                });
                courseNames = courseNames.slice(0, -2); // Remove last comma
            }

            const totalCovered = totalPaid;
            const unpaidDue = Math.max(0, totalDue - totalCovered);
            
            let paymentStatus = 'Not enrolled';
            let statusClass = 'warning';
            if (totalDue > 0) {
                if (unpaidDue <= 0) {
                    paymentStatus = 'Paid';
                    statusClass = 'success';
                } else if (totalCovered > 0) {
                    paymentStatus = 'Partial';
                    statusClass = 'warning';
                } else {
                    paymentStatus = 'Unpaid';
                    statusClass = 'danger';
                }
            }

            html += `
                <div class="student-item">
                    <div class="student-basic-info">
                        <div class="student-avatar">
                            <i class="fa fa-user"></i>
                        </div>
                        <div class="student-details">
                            <h4>${Utils.escapeHtml(student.name)}</h4>
                            <p><strong>ID:</strong> ${Utils.escapeHtml(student.studentId)}</p>
                            <p><strong>Phone:</strong> ${Utils.escapeHtml(student.phone)}</p>
                            <p><strong>Guardian:</strong> ${Utils.escapeHtml(student.guardianName)} (${Utils.escapeHtml(student.guardianPhone)})</p>
                        </div>
                    </div>
                    <div class="student-academic-info">
                        <p><strong>Institution:</strong> ${Utils.escapeHtml(institutionName)}</p>
                        <p><strong>Batch:</strong> ${Utils.escapeHtml(batchName)}</p>
                        <p><strong>Courses:</strong> ${Utils.escapeHtml(courseNames) || 'Not enrolled'}</p>
                        <p><strong>Gender:</strong> ${Utils.escapeHtml(student.gender || 'Not specified')}</p>
                    </div>
                    <div class="student-payment-info">
                        <div class="payment-summary">
                            <div class="payment-item">
                                <span class="payment-label">Total Due:</span>
                                <span class="payment-value">৳${totalDue.toFixed(2)}</span>
                            </div>
                            <div class="payment-item">
                                <span class="payment-label">Total Paid:</span>
                                <span class="payment-value">৳${totalCovered.toFixed(2)}</span>
                            </div>
                            <div class="payment-item">
                                <span class="payment-label">Remaining:</span>
                                <span class="payment-value danger">৳${unpaidDue.toFixed(2)}</span>
                            </div>
                        </div>
                        <div class="payment-status ${statusClass}">
                            ${paymentStatus}
                        </div>
                    </div>
                    <div class="student-actions">
                        <button onclick="window.studentsDatabaseManager.viewPaymentHistory('${student._id}')" 
                                class="btn btn-info btn-sm">
                            <i class="fa fa-eye"></i> View History
                        </button>
                        <button onclick="window.studentsDatabaseManager.deleteStudent('${student._id}')" 
                                class="btn btn-danger btn-sm">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });

        studentsList.innerHTML = html;
    }

    async updateSummary(students) {
        try {
            // Update total students count
            const totalStudentsElement = document.getElementById('dbTotalStudents');
            if (totalStudentsElement) {
                const response = await fetch('/api/students');
                const allStudents = await response.json();
                totalStudentsElement.textContent = allStudents.length;
            }

            // Update filtered count
            const filteredCountElement = document.getElementById('dbFilteredCount');
            if (filteredCountElement) {
                filteredCountElement.textContent = students.length;
            }

            // Calculate payment statistics for filtered students
            let totalDue = 0;
            let totalPaid = 0;
            let paidCount = 0;
            let partialCount = 0;
            let unpaidCount = 0;

            students.forEach(student => {
                const monthPaymentDetails = student.monthPaymentDetails || {};
                let studentDue = 0;
                let studentPaid = 0;

                if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                    student.enrolledCourses.forEach(enrollment => {
                        const courseId = enrollment.courseId?._id || enrollment.courseId;
                        const allCourseMonths = this.months.filter(m => {
                            const mCourseId = m.courseId?._id || m.courseId;
                            return mCourseId === courseId;
                        });
                        
                        const startingMonthId = enrollment.startingMonthId?._id || enrollment.startingMonthId;
                        const endingMonthId = enrollment.endingMonthId?._id || enrollment.endingMonthId;
                        
                        if (startingMonthId) {
                            const startingMonth = this.months.find(m => (m._id || m.id) === startingMonthId);
                            const endingMonth = endingMonthId ? this.months.find(m => (m._id || m.id) === endingMonthId) : null;
                            
                            if (startingMonth) {
                                let applicableMonths = allCourseMonths.filter(month => 
                                    (month.monthNumber || 0) >= (startingMonth.monthNumber || 0)
                                );
                                
                                if (endingMonth) {
                                    applicableMonths = applicableMonths.filter(month => 
                                        (month.monthNumber || 0) <= (endingMonth.monthNumber || 0)
                                    );
                                }
                                
                                applicableMonths.forEach(month => {
                                    studentDue += month.payment;
                                    const monthId = month._id || month.id;
                                    const monthPayment = monthPaymentDetails[monthId];
                                    if (monthPayment) {
                                        studentPaid += monthPayment.totalPaid + monthPayment.totalDiscount;
                                    }
                                });
                            }
                        }
                    });
                }

                totalDue += studentDue;
                totalPaid += studentPaid;

                const unpaidDue = Math.max(0, studentDue - studentPaid);
                if (studentDue > 0) {
                    if (unpaidDue <= 0) {
                        paidCount++;
                    } else if (studentPaid > 0) {
                        partialCount++;
                    } else {
                        unpaidCount++;
                    }
                }
            });

            // Update summary elements
            const elements = {
                'dbTotalDue': `৳${totalDue.toFixed(2)}`,
                'dbTotalPaid': `৳${totalPaid.toFixed(2)}`,
                'dbTotalRemaining': `৳${Math.max(0, totalDue - totalPaid).toFixed(2)}`,
                'dbPaidCount': paidCount,
                'dbPartialCount': partialCount,
                'dbUnpaidCount': unpaidCount
            };

            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
        } catch (error) {
            console.error('Error updating summary:', error);
        }
    }

    async clearFilters() {
        document.getElementById('dbSearchInput').value = '';
        document.getElementById('dbBatchFilter').value = '';
        document.getElementById('dbCourseFilter').value = '';
        document.getElementById('dbMonthFilter').value = '';
        document.getElementById('dbPaymentStatusFilter').value = '';
        document.getElementById('dbInstitutionFilter').value = '';
        document.getElementById('dbGenderFilter').value = '';
        
        await this.applyFilters();
        Utils.showToast('Filters cleared', 'success');
    }

    exportData() {
        if (this.filteredStudents.length === 0) {
            Utils.showToast('No data to export', 'warning');
            return;
        }

        const csvData = [];
        csvData.push(['Student ID', 'Name', 'Phone', 'Guardian Name', 'Guardian Phone', 'Institution', 'Batch', 'Courses', 'Gender', 'Total Due', 'Total Paid', 'Remaining', 'Payment Status']);

        this.filteredStudents.forEach(student => {
            const institutionName = student.institutionId?.name || 'Not assigned';
            const batchName = student.batchId?.name || 'Not assigned';
            const monthPaymentDetails = student.monthPaymentDetails || {};
            
            let totalDue = 0;
            let totalPaid = 0;
            let courseNames = '';
            
            if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                student.enrolledCourses.forEach(enrollment => {
                    const courseId = enrollment.courseId?._id || enrollment.courseId;
                    const course = this.courses.find(c => (c._id || c.id) === courseId);
                    if (course) {
                        courseNames += course.name + ', ';
                        
                        const allCourseMonths = this.months.filter(m => {
                            const mCourseId = m.courseId?._id || m.courseId;
                            return mCourseId === courseId;
                        });
                        
                        const startingMonthId = enrollment.startingMonthId?._id || enrollment.startingMonthId;
                        const endingMonthId = enrollment.endingMonthId?._id || enrollment.endingMonthId;
                        
                        if (startingMonthId) {
                            const startingMonth = this.months.find(m => (m._id || m.id) === startingMonthId);
                            const endingMonth = endingMonthId ? this.months.find(m => (m._id || m.id) === endingMonthId) : null;
                            
                            if (startingMonth) {
                                let applicableMonths = allCourseMonths.filter(month => 
                                    (month.monthNumber || 0) >= (startingMonth.monthNumber || 0)
                                );
                                
                                if (endingMonth) {
                                    applicableMonths = applicableMonths.filter(month => 
                                        (month.monthNumber || 0) <= (endingMonth.monthNumber || 0)
                                    );
                                }
                                
                                applicableMonths.forEach(month => {
                                    totalDue += month.payment;
                                    const monthId = month._id || month.id;
                                    const monthPayment = monthPaymentDetails[monthId];
                                    if (monthPayment) {
                                        totalPaid += monthPayment.totalPaid + monthPayment.totalDiscount;
                                    }
                                });
                            }
                        }
                    }
                });
                courseNames = courseNames.slice(0, -2);
            }

            const unpaidDue = Math.max(0, totalDue - totalPaid);
            let paymentStatus = 'Not enrolled';
            if (totalDue > 0) {
                if (unpaidDue <= 0) {
                    paymentStatus = 'Paid';
                } else if (totalPaid > 0) {
                    paymentStatus = 'Partial';
                } else {
                    paymentStatus = 'Unpaid';
                }
            }

            csvData.push([
                student.studentId,
                student.name,
                student.phone,
                student.guardianName,
                student.guardianPhone,
                institutionName,
                batchName,
                courseNames,
                student.gender || 'Not specified',
                totalDue.toFixed(2),
                totalPaid.toFixed(2),
                unpaidDue.toFixed(2),
                paymentStatus
            ]);
        });

        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_database_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        Utils.showToast('Data exported successfully', 'success');
    }

    async viewPaymentHistory(studentId) {
        try {
            const response = await fetch(`/api/students/${studentId}`);
            const student = await response.json();
            
            if (!student) {
                Utils.showToast('Student not found', 'error');
                return;
            }

            // For now, just show basic info. Payment history feature can be enhanced later
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Payment History - ${Utils.escapeHtml(student.name)}</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <p><strong>Student ID:</strong> ${Utils.escapeHtml(student.studentId)}</p>
                        <p><strong>Institution:</strong> ${Utils.escapeHtml(student.institutionId?.name || 'Not assigned')}</p>
                        <p><strong>Batch:</strong> ${Utils.escapeHtml(student.batchId?.name || 'Not assigned')}</p>
                        <p>Detailed payment history feature will be implemented in the payment management module.</p>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.style.display = 'flex';

            modal.querySelector('.close').onclick = () => {
                document.body.removeChild(modal);
            };

            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            };
        } catch (error) {
            console.error('Error fetching payment history:', error);
            Utils.showToast('Error loading payment history', 'error');
        }
    }

    async deleteStudent(studentId) {
        try {
            const response = await fetch(`/api/students/${studentId}`);
            const student = await response.json();
            
            if (!student) {
                Utils.showToast('Student not found', 'error');
                return;
            }

            Utils.confirm(`Are you sure you want to delete "${student.name}" (${student.studentId})? This action cannot be undone and will also remove all payment records for this student.`, async () => {
                try {
                    const deleteResponse = await fetch(`/api/students/${studentId}`, {
                        method: 'DELETE'
                    });
                    
                    if (deleteResponse.ok) {
                        Utils.showToast('Student deleted successfully', 'success');
                        await this.applyFilters(); // Refresh the list
                    } else {
                        const errorData = await deleteResponse.json();
                        Utils.showToast(errorData.message || 'Error deleting student', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting student:', error);
                    Utils.showToast('Error deleting student', 'error');
                }
            });
        } catch (error) {
            console.error('Error fetching student details:', error);
            Utils.showToast('Error loading student details', 'error');
        }
    }
}

// Global students database manager instance
window.studentsDatabaseManager = new StudentsDatabaseManager();
