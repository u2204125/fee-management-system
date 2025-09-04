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
              this.filteredStudents = students;
            console.log('Final filtered students:', students.length);
            this.renderStudents(students);
            this.updateSummary(students);
        } catch (error) {
            console.error('Error applying filters:', error);
            // Show error message to user
            const studentsList = document.getElementById('dbStudentsList');
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
    }    init() {
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
        const applyBtn = document.getElementById('dbApplyFilters');
        if (applyBtn) {
            applyBtn.addEventListener('click', async () => {
                await this.applyFilters();
            });
        }

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
            this.renderStudents(students);
            await this.updateSummary(students);
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

        studentsList.innerHTML = students.map(student => {
            const institution = this.institutions.find(i => i.id === student.institutionId);
            const batch = this.batches.find(b => b.id === student.batchId);
            const monthPaymentDetails = student.monthPaymentDetails || {};
            
            // Calculate payment status and amounts
            let totalDue = 0;
            let totalPaid = 0;
            let enrolledCourseNames = [];

            if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                student.enrolledCourses.forEach(enrollment => {
                    const course = this.courses.find(c => c.id === enrollment.courseId);
                    if (course) {
                        enrolledCourseNames.push(course.name);
                    }

                    const allCourseMonths = this.months.filter(m => m.courseId === enrollment.courseId)
                        .sort((a, b) => (a.monthNumber || 0) - (b.monthNumber || 0));
                    
                    if (enrollment.startingMonthId) {
                        const startingMonth = this.months.find(m => m.id === enrollment.startingMonthId);
                        const endingMonth = enrollment.endingMonthId ? this.months.find(m => m.id === enrollment.endingMonthId) : null;
                        
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
                                const monthPayment = monthPaymentDetails[month.id];
                                if (monthPayment) {
                                    totalPaid += monthPayment.totalPaid;
                                    totalPaid += monthPayment.totalDiscount; // Add discount as "paid"
                                }
                            });
                        }
                    }
                });
            }

            const unpaidDue = totalDue - totalPaid;
            
            // Determine payment status based on remaining due
            let paymentStatus, statusText;
            if (totalDue === 0) {
                paymentStatus = 'unpaid';
                statusText = 'No Fees';
            } else if (unpaidDue <= 0) {
                paymentStatus = 'paid';
                statusText = 'Fully Paid';
            } else if (totalPaid > 0) {
                paymentStatus = 'partial';
                statusText = 'Partially Paid';
            } else {
                paymentStatus = 'unpaid';
                statusText = 'Unpaid';
            }

            return `
                <div class="database-student-card">
                    <div class="student-header">
                        <div class="student-basic-info">
                            <h4>${student.name}</h4>
                            <div class="student-id">ID: ${student.studentId}</div>
                        </div>
                        <div class="student-status">
                            <span class="payment-status ${paymentStatus}">${statusText}</span>
                        </div>
                    </div>
                    
                    <div class="student-details-grid">
                        <div class="detail-section">
                            <h5>Personal Information</h5>
                            <div class="detail-item">
                                <span class="detail-label">Gender:</span>
                                <span class="detail-value">${student.gender}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Phone:</span>
                                <span class="detail-value">${student.phone}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Institution:</span>
                                <span class="detail-value">${institution?.name || 'Unknown'}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Academic Information</h5>
                            <div class="detail-item">
                                <span class="detail-label">Batch:</span>
                                <span class="detail-value">${batch?.name || 'Unknown'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Courses:</span>
                                <span class="detail-value">${enrolledCourseNames.join(', ') || 'None'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Joined:</span>
                                <span class="detail-value">${Utils.formatDate(student.createdAt)}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Guardian Information</h5>
                            <div class="detail-item">
                                <span class="detail-label">Guardian:</span>
                                <span class="detail-value">${student.guardianName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Guardian Phone:</span>
                                <span class="detail-value">${student.guardianPhone}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Payment Information</h5>
                            <div class="detail-item">
                                <span class="detail-label">Total Due:</span>
                                <span class="detail-value">${Utils.formatCurrency(totalDue)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Total Paid:</span>
                                <span class="detail-value">${Utils.formatCurrency(totalPaid)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Remaining:</span>
                                <span class="detail-value ${unpaidDue > 0 ? 'text-danger' : 'text-success'}">${Utils.formatCurrency(unpaidDue)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="student-actions">
                        <button class="btn btn-small btn-outline" onclick="studentManager.editStudent('${student.id}')">
                            Edit Student
                        </button>
                        <button class="btn btn-small btn-primary" onclick="feePaymentManager.findStudentById('${student.id}')">
                            Pay Fee
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="studentsDatabaseManager.viewPaymentHistory('${student.id}')">
                            Payment History
                        </button>
                        <button class="btn btn-small btn-danger" onclick="studentsDatabaseManager.deleteStudent('${student.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateSummary(students) {
        const totalStudentsElement = document.getElementById('dbTotalStudents');
        const filteredCountElement = document.getElementById('dbFilteredCount');
        const totalRevenueElement = document.getElementById('dbTotalRevenue');
        const pendingDuesElement = document.getElementById('dbPendingDues');

        if (totalStudentsElement) {
            // Get total students from API
            try {
                const response = await fetch('/api/students');
                const allStudents = await response.json();
                totalStudentsElement.textContent = allStudents.length;
            } catch (error) {
                console.error('Error fetching total students count:', error);
                totalStudentsElement.textContent = '---';
            }
        }

        if (filteredCountElement) {
            filteredCountElement.textContent = students.length;
        }

        let totalRevenue = 0;
        let totalPendingDues = 0;

        students.forEach(student => {
            const monthPaymentDetails = student.monthPaymentDetails || {};
            let studentTotalDue = 0;
            let studentTotalPaid = 0;

            if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                student.enrolledCourses.forEach(enrollment => {
                    const allCourseMonths = this.months.filter(m => m.courseId === enrollment.courseId);
                    
                    if (enrollment.startingMonthId) {
                        const startingMonth = this.months.find(m => m.id === enrollment.startingMonthId);
                        const endingMonth = enrollment.endingMonthId ? this.months.find(m => m.id === enrollment.endingMonthId) : null;
                        
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
                                studentTotalDue += month.payment;
                                const monthPayment = monthPaymentDetails[month.id];
                                if (monthPayment) {
                                    studentTotalPaid += monthPayment.totalPaid + monthPayment.totalDiscount;
                                }
                            });
                        }
                    }
                });
            }

            totalRevenue += studentTotalPaid;
            totalPendingDues += Math.max(0, studentTotalDue - studentTotalPaid);
        });

        if (totalRevenueElement) {
            totalRevenueElement.textContent = Utils.formatCurrency(totalRevenue);
        }

        if (pendingDuesElement) {
            pendingDuesElement.textContent = Utils.formatCurrency(totalPendingDues);
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

        const exportData = this.filteredStudents.map(student => {
            const institution = this.institutions.find(i => i.id === student.institutionId);
            const batch = this.batches.find(b => b.id === student.batchId);
            const monthPaymentDetails = student.monthPaymentDetails || {};
            
            let totalDue = 0;
            let totalPaid = 0;
            let enrolledCourseNames = [];

            if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                student.enrolledCourses.forEach(enrollment => {
                    const course = this.courses.find(c => c.id === enrollment.courseId);
                    if (course) {
                        enrolledCourseNames.push(course.name);
                    }

                    const allCourseMonths = this.months.filter(m => m.courseId === enrollment.courseId);
                    
                    if (enrollment.startingMonthId) {
                        const startingMonth = this.months.find(m => m.id === enrollment.startingMonthId);
                        const endingMonth = enrollment.endingMonthId ? this.months.find(m => m.id === enrollment.endingMonthId) : null;
                        
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
                                const monthPayment = monthPaymentDetails[month.id];
                                if (monthPayment) {
                                    totalPaid += monthPayment.totalPaid;
                                }
                            });
                        }
                    }
                });
            }

            const unpaidDue = totalDue - totalPaid;
            const paymentStatus = unpaidDue <= 0 && totalDue > 0 ? 'Fully Paid' : 
                                 totalPaid > 0 && unpaidDue > 0 ? 'Partially Paid' : 'Unpaid';

            return {
                'Student ID': student.studentId,
                'Name': student.name,
                'Gender': student.gender,
                'Phone': student.phone,
                'Guardian Name': student.guardianName,
                'Guardian Phone': student.guardianPhone,
                'Institution': institution?.name || 'Unknown',
                'Batch': batch?.name || 'Unknown',
                'Enrolled Courses': enrolledCourseNames.join(', '),
                'Total Due': totalDue,
                'Total Paid': totalPaid,
                'Remaining Due': unpaidDue,
                'Payment Status': paymentStatus,
                'Joined Date': Utils.formatDate(student.createdAt)
            };
        });

        const filename = `students_database_${new Date().toISOString().split('T')[0]}.csv`;
        Utils.exportToCSV(exportData, filename);
        Utils.showToast('Data exported successfully', 'success');
    }

    async viewPaymentHistory(studentId) {
        try {
            // Get student details from API
            const studentResponse = await fetch(`/api/students/${studentId}`);
            const student = await studentResponse.json();
            
            if (!student) {
                Utils.showToast('Student not found', 'error');
                return;
            }

            // Get payments for this student from API
            const paymentsResponse = await fetch(`/api/payments?studentId=${studentId}`);
            const payments = await paymentsResponse.json();
            
            const historyHtml = `
                <div class="payment-history">
                    <h4>Payment History for ${student.name} (${student.studentId})</h4>
                    ${payments.length === 0 ? 
                        '<p>No payment history found.</p>' :
                        payments.map(payment => `
                            <div class="payment-history-item">
                                <div class="payment-header">
                                    <strong>Invoice: ${payment.invoiceNumber}</strong>
                                    <span class="payment-date">${Utils.formatDateTime(payment.createdAt)}</span>
                                </div>
                                <div class="payment-details">
                                    <p><strong>Amount Paid:</strong> ${Utils.formatCurrency(payment.paidAmount)}</p>
                                    <p><strong>Due Amount:</strong> ${Utils.formatCurrency(payment.dueAmount)}</p>
                                ${payment.discountAmount > 0 ? `<p><strong>Discount:</strong> ${Utils.formatCurrency(payment.discountAmount)}</p>` : ''}
                                <p><strong>Received By:</strong> ${payment.receivedBy}</p>
                                ${payment.reference ? `<p><strong>Reference:</strong> ${payment.reference}</p>` : ''}
                            </div>
                        </div>
                    `).join('')
                }
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="navigationManager.closeModal(document.getElementById('editModal'))">Close</button>
                </div>
            </div>
        `;

        window.navigationManager.showModal('editModal', 'Payment History', historyHtml);
        } catch (error) {
            console.error('Error fetching payment history:', error);
            Utils.showToast('Error loading payment history', 'error');
        }
    }

    async deleteStudent(studentId) {
        try {
            // Get student details from API first
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