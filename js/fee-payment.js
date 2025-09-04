class FeePaymentManager {
    constructor() {
        this.isInitialized = false;
        this.eventsBound = false;
        this.currentStudent = null;
        this.selectedMonths = {};
        this.selectedCourses = [];
        this.discountDetails = {};

        // Cache for reference data
        this.batches = [];
        this.courses = [];
        this.months = [];
        this.institutions = [];
        this.referenceOptions = [];
        this.receivedByOptions = [];
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.loadDropdownOptions();
        this.refresh();
    }

    async refresh() {
        if (!this.eventsBound) {
            this.bindEvents(); // Bind events when page is actually shown
            this.eventsBound = true;
        }
        await this.loadReferenceData();
        await this.loadDropdownOptions();
    }

    async loadReferenceData() {
        try {
            // Load all reference data in parallel
            const [batchesRes, coursesRes, monthsRes, institutionsRes, refOptionsRes, receivedByRes] = await Promise.all([
                fetch('/api/batches'),
                fetch('/api/courses'),
                fetch('/api/months'),
                fetch('/api/institutions'),
                fetch('/api/reference-options'),
                fetch('/api/received-by-options')
            ]);

            this.batches = await batchesRes.json();
            this.courses = await coursesRes.json();
            this.months = await monthsRes.json();
            this.institutions = await institutionsRes.json();
            this.referenceOptions = await refOptionsRes.json();
            this.receivedByOptions = await receivedByRes.json();
        } catch (error) {
            console.error('Error loading reference data:', error);
        }
    }

    bindEvents() {
        const searchForm = document.getElementById('findStudentForm');
        const paymentForm = document.getElementById('feePaymentForm');
        
        console.log('Fee Payment - Binding events');
        console.log('Search form found:', !!searchForm);
        console.log('Payment form found:', !!paymentForm);
        
        // Remove existing event listeners to prevent duplicates
        if (searchForm && !searchForm.hasAttribute('data-events-bound')) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Search form submitted');
                await this.findStudent();
            });
            searchForm.setAttribute('data-events-bound', 'true');
        }

        if (paymentForm && !paymentForm.hasAttribute('data-events-bound')) {
            paymentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Payment form submitted');
                await this.processPayment();
            });
            paymentForm.setAttribute('data-events-bound', 'true');
        }

        // Bind paid amount change
        const paidAmountInput = document.getElementById('paidAmount');
        if (paidAmountInput) {
            paidAmountInput.addEventListener('input', () => {
                this.calculateDueAmount();
            });
        }
    }

    async loadDropdownOptions() {
        try {
            // Update reference dropdown
            const referenceSelect = document.getElementById('referenceSelect');
            if (referenceSelect) {
                referenceSelect.innerHTML = '<option value="">Select Reference</option>';
                this.referenceOptions.forEach(option => {
                    referenceSelect.innerHTML += `<option value="${option.name}">${option.name}</option>`;
                });
                referenceSelect.innerHTML += '<option value="custom">Custom Reference</option>';
            }

            // Update received by dropdown
            const receivedBySelect = document.getElementById('receivedBySelect');
            if (receivedBySelect) {
                receivedBySelect.innerHTML = '<option value="">Select Receiver</option>';
                this.receivedByOptions.forEach(option => {
                    receivedBySelect.innerHTML += `<option value="${option.name}">${option.name}</option>`;
                });
                receivedBySelect.innerHTML += '<option value="custom">Custom Receiver</option>';
            }
        } catch (error) {
            console.error('Error loading dropdown options:', error);
        }
    }

    toggleCustomReference() {
        const referenceSelect = document.getElementById('referenceSelect');
        const referenceCustom = document.getElementById('referenceCustom');
        
        if (referenceSelect.value === 'custom') {
            referenceCustom.style.display = 'block';
            referenceCustom.required = false; // Optional field
        } else {
            referenceCustom.style.display = 'none';
            referenceCustom.required = false;
            referenceCustom.value = '';
        }
    }

    toggleCustomReceivedBy() {
        const receivedBySelect = document.getElementById('receivedBySelect');
        const receivedByCustom = document.getElementById('receivedByCustom');
        
        if (receivedBySelect.value === 'custom') {
            receivedByCustom.style.display = 'block';
            receivedByCustom.required = true;
        } else {
            receivedByCustom.style.display = 'none';
            receivedByCustom.required = false;
            receivedByCustom.value = '';
        }
    }

    async findStudent() {
        const searchInput = document.getElementById('searchStudentId');        
        if (!searchInput) {
            Utils.showToast('Search input field not found', 'error');
            return;
        }
        
        const searchValue = searchInput.value.trim();        
        if (!searchValue) {
            Utils.showToast('Please enter a student ID or name', 'error');
            return;
        }

        try {
            // Fetch students from API
            const response = await fetch('/api/students');
            const students = await response.json();

            // Search by student ID first, then by name
            let student = students.find(s => s.studentId === searchValue);
            if (!student) {
                // Search by name (case insensitive)
                student = students.find(s => 
                    s.name.toLowerCase().includes(searchValue.toLowerCase())
                );
            }

            if (!student) {
                Utils.showToast('Student not found', 'error');
                this.hideStudentPaymentInfo();
                return;
            }

            this.currentStudent = student;
            this.displayStudentInfo();
            this.loadStudentCourses();
            this.showStudentPaymentInfo();
        } catch (error) {
            console.error('Error finding student:', error);
            Utils.showToast('Error searching for student', 'error');
        }
    }

    displayStudentInfo() {
        const student = this.currentStudent;
        const studentInfoDisplay = document.getElementById('studentInfoDisplay');
        
        if (studentInfoDisplay && student) {
            const institutionName = student.institutionId?.name || 'Not assigned';
            const batchName = student.batchId?.name || 'Not assigned';
            
            studentInfoDisplay.innerHTML = `
                <div class="student-info-grid">
                    <div class="info-item">
                        <label>Student ID:</label>
                        <span>${Utils.escapeHtml(student.studentId)}</span>
                    </div>
                    <div class="info-item">
                        <label>Name:</label>
                        <span>${Utils.escapeHtml(student.name)}</span>
                    </div>
                    <div class="info-item">
                        <label>Phone:</label>
                        <span>${Utils.escapeHtml(student.phone)}</span>
                    </div>
                    <div class="info-item">
                        <label>Guardian:</label>
                        <span>${Utils.escapeHtml(student.guardianName)} (${Utils.escapeHtml(student.guardianPhone)})</span>
                    </div>
                    <div class="info-item">
                        <label>Institution:</label>
                        <span>${Utils.escapeHtml(institutionName)}</span>
                    </div>
                    <div class="info-item">
                        <label>Batch:</label>
                        <span>${Utils.escapeHtml(batchName)}</span>
                    </div>
                    <div class="info-item">
                        <label>Gender:</label>
                        <span>${Utils.escapeHtml(student.gender || 'Not specified')}</span>
                    </div>
                </div>
            `;
        }
    }

    showStudentPaymentInfo() {
        const paymentInfoDiv = document.getElementById('studentPaymentInfo');
        if (paymentInfoDiv) {
            paymentInfoDiv.style.display = 'block';
        }
    }

    hideStudentPaymentInfo() {
        const paymentInfoDiv = document.getElementById('studentPaymentInfo');
        if (paymentInfoDiv) {
            paymentInfoDiv.style.display = 'none';
        }
        this.currentStudent = null;
        this.selectedCourses = [];
        this.selectedMonths = {};
        this.discountDetails = {};
    }

    loadStudentCourses() {
        const student = this.currentStudent;
        if (!student || !student.enrolledCourses) return;

        const courseSelection = document.getElementById('courseSelection');
        const monthSelection = document.getElementById('monthSelection');
        const discountSelection = document.getElementById('discountSelection');
        
        if (!courseSelection || !monthSelection) return;

        // Clear previous selections
        courseSelection.innerHTML = '';
        monthSelection.innerHTML = '';
        discountSelection.innerHTML = '';
        this.selectedCourses = [];
        this.selectedMonths = {};

        // Get month payment details for the student
        const monthPaymentDetails = student.monthPaymentDetails || {};

        // Load courses for this student
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

                        // Add course checkbox
                        const courseCheckbox = document.createElement('div');
                        courseCheckbox.className = 'checkbox-item';
                        courseCheckbox.innerHTML = `
                            <input type="checkbox" id="course-${courseId}" value="${courseId}" 
                                   onchange="feePaymentManager.toggleCourse('${courseId}')">
                            <label for="course-${courseId}">${Utils.escapeHtml(course.name)}</label>
                        `;
                        courseSelection.appendChild(courseCheckbox);

                        // Add months for this course
                        applicableMonths.forEach(month => {
                            const monthId = month._id || month.id;
                            const monthPayment = monthPaymentDetails[monthId];
                            const isPaid = monthPayment && (monthPayment.totalPaid + monthPayment.totalDiscount) >= month.payment;
                            
                            const monthCheckbox = document.createElement('div');
                            monthCheckbox.className = 'checkbox-item';
                            monthCheckbox.innerHTML = `
                                <input type="checkbox" id="month-${monthId}" value="${monthId}" 
                                       data-course="${courseId}" data-amount="${month.payment}"
                                       onchange="feePaymentManager.toggleMonth('${monthId}')"
                                       ${isPaid ? 'disabled title="Already paid"' : ''}>
                                <label for="month-${monthId}" ${isPaid ? 'class="paid-month"' : ''}>
                                    ${Utils.escapeHtml(month.name)} - ${Utils.escapeHtml(course.name)} 
                                    (৳${month.payment}) ${isPaid ? '✓ Paid' : ''}
                                </label>
                            `;
                            monthSelection.appendChild(monthCheckbox);

                            // Add to discount selection
                            if (!isPaid) {
                                const discountCheckbox = document.createElement('div');
                                discountCheckbox.className = 'checkbox-item';
                                discountCheckbox.innerHTML = `
                                    <input type="checkbox" id="discount-${monthId}" value="${monthId}" 
                                           data-course="${courseId}" data-amount="${month.payment}">
                                    <label for="discount-${monthId}">
                                        ${Utils.escapeHtml(month.name)} - ${Utils.escapeHtml(course.name)} (৳${month.payment})
                                    </label>
                                `;
                                discountSelection.appendChild(discountCheckbox);
                            }
                        });
                    }
                }
            }
        });
    }

    toggleCourse(courseId) {
        const courseCheckbox = document.getElementById(`course-${courseId}`);
        const monthCheckboxes = document.querySelectorAll(`input[data-course="${courseId}"]`);
        
        if (courseCheckbox.checked) {
            // Add course to selection
            this.selectedCourses.push(courseId);
            
            // Check all months for this course
            monthCheckboxes.forEach(checkbox => {
                if (!checkbox.disabled) {
                    checkbox.checked = true;
                    this.toggleMonth(checkbox.value);
                }
            });
        } else {
            // Remove course from selection
            this.selectedCourses = this.selectedCourses.filter(id => id !== courseId);
            
            // Uncheck all months for this course
            monthCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                this.toggleMonth(checkbox.value);
            });
        }
    }

    toggleMonth(monthId) {
        const monthCheckbox = document.getElementById(`month-${monthId}`);
        
        if (monthCheckbox.checked) {
            const amount = parseFloat(monthCheckbox.dataset.amount);
            this.selectedMonths[monthId] = amount;
        } else {
            delete this.selectedMonths[monthId];
        }
        
        this.calculateTotalAmount();
    }

    calculateTotalAmount() {
        const totalAmount = Object.values(this.selectedMonths).reduce((sum, amount) => sum + amount, 0);
        
        document.getElementById('totalAmount').value = totalAmount.toFixed(2);
        this.calculateDiscount();
    }

    calculateDiscount() {
        const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
        const discountType = document.getElementById('discountType').value;
        const discountValue = parseFloat(document.getElementById('discountAmount').value) || 0;
        
        let discountAmount = 0;
        
        if (discountValue > 0) {
            if (discountType === 'percentage') {
                discountAmount = (totalAmount * discountValue) / 100;
            } else {
                discountAmount = discountValue;
            }
        }
        
        const discountedAmount = Math.max(0, totalAmount - discountAmount);
        
        document.getElementById('discountedAmount').value = discountedAmount.toFixed(2);
        this.calculateDueAmount();
    }

    calculateDueAmount() {
        const discountedAmount = parseFloat(document.getElementById('discountedAmount').value) || 0;
        const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
        const dueAmount = Math.max(0, discountedAmount - paidAmount);
        
        document.getElementById('dueAmount').value = dueAmount.toFixed(2);
    }

    async processPayment() {
        console.log('Processing payment...');
        
        if (!this.currentStudent) {
            Utils.showToast('No student selected', 'error');
            return;
        }

        const selectedMonthIds = Object.keys(this.selectedMonths);
        if (selectedMonthIds.length === 0) {
            Utils.showToast('Please select at least one month', 'error');
            return;
        }

        const paidAmount = parseFloat(document.getElementById('paidAmount').value);
        if (paidAmount <= 0) {
            Utils.showToast('Please enter a valid paid amount', 'error');
            return;
        }

        const receivedBySelect = document.getElementById('receivedBySelect');
        const receivedByCustom = document.getElementById('receivedByCustom');
        let receivedBy = receivedBySelect.value;
        
        if (receivedBy === 'custom') {
            receivedBy = receivedByCustom.value.trim();
        }
        
        if (!receivedBy) {
            Utils.showToast('Please select who received the payment', 'error');
            return;
        }

        try {
            const referenceSelect = document.getElementById('referenceSelect');
            const referenceCustom = document.getElementById('referenceCustom');
            let reference = referenceSelect.value;
            
            if (reference === 'custom') {
                reference = referenceCustom.value.trim();
            }

            const totalAmount = parseFloat(document.getElementById('totalAmount').value);
            const discountAmount = totalAmount - parseFloat(document.getElementById('discountedAmount').value);
            const discountType = document.getElementById('discountType').value;

            // Prepare month payments
            const monthPayments = selectedMonthIds.map(monthId => {
                const month = this.months.find(m => (m._id || m.id) === monthId);
                return {
                    monthId: monthId,
                    paidAmount: this.selectedMonths[monthId], // This might need adjustment for partial payments
                    discountAmount: 0, // This might need adjustment for month-specific discounts
                    monthFee: month ? month.payment : 0
                };
            });

            // Get discount applicable months
            const discountApplicableMonths = [];
            const discountCheckboxes = document.querySelectorAll('#discountSelection input[type="checkbox"]:checked');
            discountCheckboxes.forEach(checkbox => {
                discountApplicableMonths.push(checkbox.value);
            });

            // Generate invoice number
            const invoiceNumber = this.generateInvoiceNumber();

            const payment = {
                studentId: this.currentStudent._id,
                studentName: this.currentStudent.name,
                invoiceNumber: invoiceNumber,
                paidAmount: paidAmount,
                discountAmount: discountAmount,
                discountType: discountType,
                discountApplicableMonths: discountApplicableMonths,
                months: selectedMonthIds, // legacy field
                monthPayments: monthPayments,
                reference: reference || '',
                receivedBy: receivedBy,
                notes: ''
            };

            // Save payment
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payment)
            });

            if (response.ok) {
                const savedPayment = await response.json();
                console.log('Payment saved successfully:', savedPayment);
                Utils.showToast('Payment processed successfully', 'success');
                
                // Show invoice
                this.showInvoice(savedPayment);
                
                // Reset form
                this.resetPaymentForm();
                
                // Clear current student to avoid issues
                this.currentStudent = null;
                
            } else {
                const errorData = await response.json();
                console.log('Payment error:', errorData);
                Utils.showToast(errorData.message || 'Error processing payment', 'error');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            Utils.showToast('Error processing payment', 'error');
        }
    }

    resetPaymentForm() {
        // Reset form inputs but keep search field
        const feeForm = document.getElementById('feePaymentForm');
        if (feeForm) {
            feeForm.reset();
        }
        
        // Reset selections
        this.selectedCourses = [];
        this.selectedMonths = {};
        this.discountDetails = {};
        
        // Hide payment info
        this.hideStudentPaymentInfo();
    }

    async showInvoice(payment) {
        try {
            // Get full payment details with populated references
            const response = await fetch(`/api/payments/${payment._id}`);
            const fullPayment = await response.json();
            
            if (window.invoiceManager) {
                window.invoiceManager.generateInvoice(fullPayment);
            } else {
                console.log('Invoice generated for payment:', fullPayment.invoiceNumber);
            }
        } catch (error) {
            console.error('Error generating invoice:', error);
        }
    }

    generateInvoiceNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
        
        // Format: INV-YYYYMMDD-HHMMSS-MMM
        return `INV-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
    }
}

// Global fee payment manager instance
window.feePaymentManager = new FeePaymentManager();
