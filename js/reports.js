// Reports Management
class ReportsManager {
    constructor() {
        this.eventsBound = false;
        // Cache for reference data
        this.courses = [];
        this.batches = [];
        this.months = [];
        this.students = [];
        this.payments = [];
        this.institutions = [];
        this.init();
    }

    init() {
        this.refresh();
    }

    async refresh() {
        if (!this.eventsBound) {
            this.bindEvents();
            this.eventsBound = true;
        }
        await this.loadReferenceData();
        await this.updateCourseDropdown();
    }

    async loadReferenceData() {
        try {
            // Load all reference data in parallel
            const [coursesRes, batchesRes, monthsRes, studentsRes, paymentsRes, institutionsRes] = await Promise.all([
                fetch('/api/courses'),
                fetch('/api/batches'),
                fetch('/api/months'),
                fetch('/api/students'),
                fetch('/api/payments'),
                fetch('/api/institutions')
            ]);

            this.courses = await coursesRes.json();
            this.batches = await batchesRes.json();
            this.months = await monthsRes.json();
            this.students = await studentsRes.json();
            this.payments = await paymentsRes.json();
            this.institutions = await institutionsRes.json();
        } catch (error) {
            console.error('Error loading reference data:', error);
        }
    }

    bindEvents() {
        // Generate Report Button
        const generateReportBtn = document.getElementById('generateReport');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', async () => {
                await this.generateReport();
            });
        }

        // Report Type Change
        const reportTypeSelect = document.getElementById('reportType');
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', () => {
                this.updateDateFields();
            });
        }

        // Course Change for Month Filter
        const reportCourseSelect = document.getElementById('reportCourse');
        if (reportCourseSelect) {
            reportCourseSelect.addEventListener('change', () => {
                this.updateMonthFilter();
            });
        }

        // Discount Reports
        const generateDiscountReportBtn = document.getElementById('generateDiscountReport');
        if (generateDiscountReportBtn) {
            generateDiscountReportBtn.addEventListener('click', async () => {
                await this.generateDiscountReport();
            });
        }
    }

    updateDateFields() {
        const reportType = document.getElementById('reportType').value;
        const dateField = document.getElementById('reportDate');
        
        switch (reportType) {
            case 'date':
                dateField.type = 'date';
                dateField.style.display = 'block';
                break;
            case 'week':
                dateField.type = 'week';
                dateField.style.display = 'block';
                break;
            case 'month':
                dateField.type = 'month';
                dateField.style.display = 'block';
                break;
            case 'course':
                dateField.style.display = 'none';
                break;
            default:
                dateField.style.display = 'block';
        }
    }

    async updateCourseDropdown() {
        const courseSelect = document.getElementById('reportCourse');
        const discountCourseSelect = document.getElementById('discountReportCourse');
        
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">All Courses</option>';
            this.courses.forEach(course => {
                const batchId = course.batchId?._id || course.batchId;
                const batch = this.batches.find(b => (b._id || b.id) === batchId);
                const batchName = batch ? batch.name : 'Unknown Batch';
                courseSelect.innerHTML += `<option value="${course._id}">${course.name} (${batchName})</option>`;
            });
        }

        if (discountCourseSelect) {
            discountCourseSelect.innerHTML = '<option value="">All Courses</option>';
            this.courses.forEach(course => {
                const batchId = course.batchId?._id || course.batchId;
                const batch = this.batches.find(b => (b._id || b.id) === batchId);
                const batchName = batch ? batch.name : 'Unknown Batch';
                discountCourseSelect.innerHTML += `<option value="${course._id}">${course.name} (${batchName})</option>`;
            });
        }
    }

    updateMonthFilter() {
        const selectedCourse = document.getElementById('reportCourse').value;
        const monthFilterContainer = document.getElementById('monthFilterContainer');
        
        if (selectedCourse && monthFilterContainer) {
            const courseMonths = this.months.filter(month => {
                const monthCourseId = month.courseId?._id || month.courseId;
                return monthCourseId === selectedCourse;
            }).sort((a, b) => (a.monthNumber || 0) - (b.monthNumber || 0));
            
            let monthOptions = '<option value="">All Months</option>';
            courseMonths.forEach(month => {
                monthOptions += `<option value="${month._id}">${month.name}</option>`;
            });
            
            monthFilterContainer.innerHTML = `
                <div class="form-group">
                    <label for="reportMonth">Month</label>
                    <select id="reportMonth">${monthOptions}</select>
                </div>
            `;
        } else if (monthFilterContainer) {
            monthFilterContainer.innerHTML = '';
        }
    }

    async generateReport() {
        const reportType = document.getElementById('reportType').value;
        const reportDate = document.getElementById('reportDate').value;
        const reportCourse = document.getElementById('reportCourse').value;
        const reportMonth = document.getElementById('reportMonth')?.value;
        
        let filteredPayments = [...this.payments];
        
        // Apply filters based on report type
        switch (reportType) {
            case 'date':
                if (reportDate) {
                    filteredPayments = this.filterByDate(filteredPayments, reportDate);
                }
                break;
            case 'week':
                if (reportDate) {
                    filteredPayments = this.filterByWeek(filteredPayments, reportDate);
                }
                break;
            case 'month':
                if (reportDate) {
                    filteredPayments = this.filterByMonth(filteredPayments, reportDate);
                }
                break;
            case 'course':
                if (reportCourse) {
                    filteredPayments = this.filterByCourse(filteredPayments, reportCourse);
                }
                if (reportMonth) {
                    filteredPayments = this.filterBySpecificMonth(filteredPayments, reportMonth);
                }
                break;
        }

        this.displayReport(filteredPayments, reportType);
    }

    filterByDate(payments, targetDate) {
        const date = new Date(targetDate);
        return payments.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate.toDateString() === date.toDateString();
        });
    }

    filterByWeek(payments, weekString) {
        const [year, week] = weekString.split('-W');
        const startOfWeek = this.getStartOfWeek(parseInt(year), parseInt(week));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return payments.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= startOfWeek && paymentDate <= endOfWeek;
        });
    }

    filterByMonth(payments, monthString) {
        const [year, month] = monthString.split('-');
        return payments.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate.getFullYear() == year && paymentDate.getMonth() == (month - 1);
        });
    }

    filterByCourse(payments, courseId) {
        return payments.filter(payment => {
            if (!payment.monthPayments || payment.monthPayments.length === 0) {
                // Check legacy months field
                if (payment.months && payment.months.length > 0) {
                    return payment.months.some(monthId => {
                        const month = this.months.find(m => (m._id || m.id) === monthId);
                        if (month) {
                            const monthCourseId = month.courseId?._id || month.courseId;
                            return monthCourseId === courseId;
                        }
                        return false;
                    });
                }
                return false;
            }

            return payment.monthPayments.some(mp => {
                const monthId = mp.monthId?._id || mp.monthId;
                const month = this.months.find(m => (m._id || m.id) === monthId);
                if (month) {
                    const monthCourseId = month.courseId?._id || month.courseId;
                    return monthCourseId === courseId;
                }
                return false;
            });
        });
    }

    filterBySpecificMonth(payments, monthId) {
        return payments.filter(payment => {
            if (payment.monthPayments && payment.monthPayments.length > 0) {
                return payment.monthPayments.some(mp => {
                    const mpMonthId = mp.monthId?._id || mp.monthId;
                    return mpMonthId === monthId;
                });
            }
            
            // Check legacy months field
            if (payment.months && payment.months.length > 0) {
                return payment.months.includes(monthId);
            }
            
            return false;
        });
    }

    getStartOfWeek(year, week) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

    displayReport(payments, reportType) {
        const reportResults = document.getElementById('reportResults');
        if (!reportResults) return;

        if (payments.length === 0) {
            reportResults.innerHTML = '<div class="no-results"><h3>No payments found for the selected criteria</h3></div>';
            return;
        }

        let totalRevenue = 0;
        let totalDiscount = 0;
        let reportHTML = `
            <div class="report-header">
                <h3>Payment Report - ${this.getReportTitle(reportType)}</h3>
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="label">Total Payments:</span>
                        <span class="value">${payments.length}</span>
                    </div>
                </div>
            </div>
            <div class="report-table-container">
                <div class="table-wrapper">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th class="date-col">Date</th>
                                <th class="invoice-col">Invoice #</th>
                                <th class="student-col">Student</th>
                                <th class="courses-col">Courses/Months</th>
                                <th class="amount-col">Amount Paid</th>
                                <th class="discount-col">Discount</th>
                                <th class="received-col">Received By</th>
                                <th class="reference-col">Reference</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        payments.forEach(payment => {
            totalRevenue += payment.paidAmount || 0;
            totalDiscount += payment.discountAmount || 0;

            const paymentDate = new Date(payment.createdAt).toLocaleDateString();
            const coursesMonths = this.getPaymentCoursesMonths(payment);

            reportHTML += `
                <tr class="report-row">
                    <td class="date-cell">${paymentDate}</td>
                    <td class="invoice-cell">
                        <span class="invoice-number">${Utils.escapeHtml(payment.invoiceNumber || 'N/A')}</span>
                    </td>
                    <td class="student-cell">
                        <div class="student-info">
                            <span class="student-name">${Utils.escapeHtml(payment.studentName || 'Unknown')}</span>
                        </div>
                    </td>
                    <td class="courses-cell">
                        <div class="courses-list">${coursesMonths}</div>
                    </td>
                    <td class="amount-cell">
                        <span class="amount-paid">৳${(payment.paidAmount || 0).toFixed(2)}</span>
                    </td>
                    <td class="discount-cell">
                        <span class="discount-amount">৳${(payment.discountAmount || 0).toFixed(2)}</span>
                    </td>
                    <td class="received-cell">
                        <span class="received-by">${Utils.escapeHtml(payment.receivedBy || 'N/A')}</span>
                    </td>
                    <td class="reference-cell">
                        <span class="reference-info">${Utils.escapeHtml(payment.reference || 'N/A')}</span>
                    </td>
                </tr>
            `;
        });

        reportHTML += `
                    </tbody>
                </table>
            </div>
            <div class="report-footer">
                <div class="summary-totals">
                    <div class="total-item">
                        <span class="label">Total Revenue:</span>
                        <span class="value">৳${totalRevenue.toFixed(2)}</span>
                    </div>
                    <div class="total-item">
                        <span class="label">Total Discounts:</span>
                        <span class="value">৳${totalDiscount.toFixed(2)}</span>
                    </div>
                    <div class="total-item">
                        <span class="label">Net Revenue:</span>
                        <span class="value">৳${(totalRevenue + totalDiscount).toFixed(2)}</span>
                    </div>
                </div>
                <button onclick="window.reportsManager.exportReport()" class="btn btn-secondary">Export CSV</button>
            </div>
        `;

        reportResults.innerHTML = reportHTML;
        this.currentReportData = payments;
    }

    getPaymentCoursesMonths(payment) {
        let coursesMonths = '';
        
        if (payment.monthPayments && payment.monthPayments.length > 0) {
            const courseGroups = {};
            
            payment.monthPayments.forEach(mp => {
                const monthId = mp.monthId?._id || mp.monthId;
                const month = this.months.find(m => (m._id || m.id) === monthId);
                
                if (month) {
                    const courseId = month.courseId?._id || month.courseId;
                    const course = this.courses.find(c => (c._id || c.id) === courseId);
                    
                    if (course) {
                        if (!courseGroups[course.name]) {
                            courseGroups[course.name] = [];
                        }
                        courseGroups[course.name].push(month.name);
                    }
                }
            });
            
            coursesMonths = Object.entries(courseGroups)
                .map(([courseName, months]) => `<span class="course-tag">${courseName}: ${months.join(', ')}</span>`)
                .join(' ');
        } else if (payment.months && payment.months.length > 0) {
            // Handle legacy months field
            const courseGroups = {};
            
            payment.months.forEach(monthId => {
                const month = this.months.find(m => (m._id || m.id) === monthId);
                
                if (month) {
                    const courseId = month.courseId?._id || month.courseId;
                    const course = this.courses.find(c => (c._id || c.id) === courseId);
                    
                    if (course) {
                        if (!courseGroups[course.name]) {
                            courseGroups[course.name] = [];
                        }
                        courseGroups[course.name].push(month.name);
                    }
                }
            });
            
            coursesMonths = Object.entries(courseGroups)
                .map(([courseName, months]) => `<span class="course-tag">${courseName}: ${months.join(', ')}</span>`)
                .join(' ');
        }
        
        return coursesMonths || '<span class="course-tag">N/A</span>';
    }

    getReportTitle(reportType) {
        const reportDate = document.getElementById('reportDate').value;
        const reportCourse = document.getElementById('reportCourse').value;
        
        switch (reportType) {
            case 'date':
                return reportDate ? `Date: ${reportDate}` : 'All Dates';
            case 'week':
                return reportDate ? `Week: ${reportDate}` : 'All Weeks';
            case 'month':
                return reportDate ? `Month: ${reportDate}` : 'All Months';
            case 'course':
                if (reportCourse) {
                    const course = this.courses.find(c => (c._id || c.id) === reportCourse);
                    return course ? `Course: ${course.name}` : 'Course Report';
                }
                return 'All Courses';
            default:
                return 'All Payments';
        }
    }

    exportReport() {
        if (!this.currentReportData || this.currentReportData.length === 0) {
            Utils.showToast('No data to export', 'warning');
            return;
        }

        const csvData = [];
        csvData.push(['Date', 'Invoice #', 'Student', 'Courses/Months', 'Amount Paid', 'Discount', 'Received By', 'Reference']);

        this.currentReportData.forEach(payment => {
            const paymentDate = new Date(payment.createdAt).toLocaleDateString();
            const coursesMonths = this.getPaymentCoursesMonths(payment).replace(/<br>/g, '; ');

            csvData.push([
                paymentDate,
                payment.invoiceNumber || 'N/A',
                payment.studentName || 'Unknown',
                coursesMonths || 'N/A',
                (payment.paidAmount || 0).toFixed(2),
                (payment.discountAmount || 0).toFixed(2),
                payment.receivedBy || 'N/A',
                payment.reference || 'N/A'
            ]);
        });

        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        Utils.showToast('Report exported successfully', 'success');
    }

    async generateDiscountReport() {
        const reportType = document.getElementById('discountReportType').value;
        const reportDate = document.getElementById('discountReportDate').value;
        const reportCourse = document.getElementById('discountReportCourse').value;
        
        let filteredPayments = this.payments.filter(payment => 
            payment.discountAmount && payment.discountAmount > 0
        );

        // Apply filters
        switch (reportType) {
            case 'date':
                if (reportDate) {
                    filteredPayments = this.filterByDate(filteredPayments, reportDate);
                }
                break;
            case 'course':
                if (reportCourse) {
                    filteredPayments = this.filterByCourse(filteredPayments, reportCourse);
                }
                break;
            case 'student':
                // Group by student could be implemented here
                break;
        }

        this.displayDiscountReport(filteredPayments, reportType);
    }

    displayDiscountReport(payments, reportType) {
        const discountReportResults = document.getElementById('discountReportResults');
        if (!discountReportResults) return;

        if (payments.length === 0) {
            discountReportResults.innerHTML = '<div class="no-results"><h3>No discount payments found for the selected criteria</h3></div>';
            return;
        }

        let totalDiscountGiven = 0;
        let reportHTML = `
            <div class="report-header">
                <h3>Discount Report - ${this.getDiscountReportTitle(reportType)}</h3>
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="label">Total Discount Payments:</span>
                        <span class="value">${payments.length}</span>
                    </div>
                </div>
            </div>
            <div class="report-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Invoice #</th>
                            <th>Student</th>
                            <th>Courses/Months</th>
                            <th>Original Amount</th>
                            <th>Discount Amount</th>
                            <th>Discount Type</th>
                            <th>Final Amount</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        payments.forEach(payment => {
            totalDiscountGiven += payment.discountAmount || 0;
            const originalAmount = (payment.paidAmount || 0) + (payment.discountAmount || 0);
            const paymentDate = new Date(payment.createdAt).toLocaleDateString();
            const coursesMonths = this.getPaymentCoursesMonths(payment);

            reportHTML += `
                <tr>
                    <td>${paymentDate}</td>
                    <td>${Utils.escapeHtml(payment.invoiceNumber || 'N/A')}</td>
                    <td>${Utils.escapeHtml(payment.studentName || 'Unknown')}</td>
                    <td>${coursesMonths}</td>
                    <td>৳${originalAmount.toFixed(2)}</td>
                    <td>৳${(payment.discountAmount || 0).toFixed(2)}</td>
                    <td>${payment.discountType || 'fixed'}</td>
                    <td>৳${(payment.paidAmount || 0).toFixed(2)}</td>
                </tr>
            `;
        });

        reportHTML += `
                    </tbody>
                </table>
            </div>
            <div class="report-footer">
                <div class="summary-totals">
                    <div class="total-item">
                        <span class="label">Total Discount Given:</span>
                        <span class="value">৳${totalDiscountGiven.toFixed(2)}</span>
                    </div>
                </div>
                <button onclick="window.reportsManager.exportDiscountReport()" class="btn btn-secondary">Export CSV</button>
            </div>
        `;

        discountReportResults.innerHTML = reportHTML;
        this.currentDiscountReportData = payments;
    }

    getDiscountReportTitle(reportType) {
        const reportDate = document.getElementById('discountReportDate').value;
        const reportCourse = document.getElementById('discountReportCourse').value;
        
        switch (reportType) {
            case 'date':
                return reportDate ? `Date: ${reportDate}` : 'All Dates';
            case 'course':
                if (reportCourse) {
                    const course = this.courses.find(c => (c._id || c.id) === reportCourse);
                    return course ? `Course: ${course.name}` : 'Course Report';
                }
                return 'All Courses';
            case 'student':
                return 'By Student';
            default:
                return 'All Discounts';
        }
    }

    exportDiscountReport() {
        if (!this.currentDiscountReportData || this.currentDiscountReportData.length === 0) {
            Utils.showToast('No data to export', 'warning');
            return;
        }

        const csvData = [];
        csvData.push(['Date', 'Invoice #', 'Student', 'Courses/Months', 'Original Amount', 'Discount Amount', 'Discount Type', 'Final Amount']);

        this.currentDiscountReportData.forEach(payment => {
            const originalAmount = (payment.paidAmount || 0) + (payment.discountAmount || 0);
            const paymentDate = new Date(payment.createdAt).toLocaleDateString();
            const coursesMonths = this.getPaymentCoursesMonths(payment).replace(/<br>/g, '; ');

            csvData.push([
                paymentDate,
                payment.invoiceNumber || 'N/A',
                payment.studentName || 'Unknown',
                coursesMonths || 'N/A',
                originalAmount.toFixed(2),
                (payment.discountAmount || 0).toFixed(2),
                payment.discountType || 'fixed',
                (payment.paidAmount || 0).toFixed(2)
            ]);
        });

        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `discount_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        Utils.showToast('Discount report exported successfully', 'success');
    }
}

// Global reports manager instance
window.reportsManager = new ReportsManager();
