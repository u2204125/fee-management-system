// Dashboard Management
class DashboardManager {
    constructor() {
        this.cache = {
            students: [],
            batches: [],
            payments: [],
            activities: [],
            courses: [],
            months: []
        };
        this.init();
    }

    init() {
        this.refresh();
        this.createTestActivityIfNeeded();
    }

    async createTestActivityIfNeeded() {
        try {
            // Check if any activities exist
            const response = await fetch('/api/activities');
            if (response.ok) {
                const activities = await response.json();
                if (activities.length === 0 && window.activityService) {
                    // Create a welcome activity if none exist
                    await window.activityService.addActivity(
                        'system_started',
                        'Welcome to Break The Fear Fee Management System',
                        { timestamp: new Date().toISOString() }
                    );
                }
            }
        } catch (error) {
            console.error('Error creating test activity:', error);
        }
    }

    async refresh() {
        await this.updateStats();
        await this.loadRecentActivities();
    }

    async updateStats() {
        try {
            // Fetch all required data in parallel
            const [studentsRes, batchesRes, paymentsRes, coursesRes, monthsRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/batches'),
                fetch('/api/payments'),
                fetch('/api/courses'),
                fetch('/api/months')
            ]);

            if (!studentsRes.ok || !batchesRes.ok || !paymentsRes.ok || !coursesRes.ok || !monthsRes.ok) {
                console.error('Failed to fetch dashboard data');
                return;
            }

            this.cache.students = await studentsRes.json();
            this.cache.batches = await batchesRes.json();
            this.cache.payments = await paymentsRes.json();
            this.cache.courses = await coursesRes.json();
            this.cache.months = await monthsRes.json();

            // Update UI with fetched data
            this.updateUIStats();

        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    updateUIStats() {
        // Total students
        document.getElementById('totalStudents').textContent = this.cache.students.length;

        // Total batches
        document.getElementById('totalBatches').textContent = this.cache.batches.length;

        // This month's revenue
        const thisMonth = this.getThisMonthPayments(this.cache.payments);
        const monthlyRevenue = thisMonth.reduce((sum, payment) => sum + payment.paidAmount, 0);
        document.getElementById('monthlyRevenue').textContent = Utils.formatCurrency(monthlyRevenue);

        // Pending fees
        const pendingFees = this.calculatePendingFees(this.cache.students, this.cache.payments, this.cache.courses, this.cache.months);
        document.getElementById('pendingFees').textContent = Utils.formatCurrency(pendingFees);
    }

    getThisMonthPayments(payments) {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        return payments.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= thisMonth && paymentDate < nextMonth;
        });
    }

    calculatePendingFees(students, payments, courses, months) {
        let totalPending = 0;

        students.forEach(student => {
            const studentPayments = payments.filter(p => p.studentId === student._id || p.studentId === student.id);
            
            // Get detailed month payment information
            const monthPaymentDetails = this.getMonthPaymentDetails(student._id || student.id, payments);

            // Calculate total due for student based on enrolled courses and starting months
            let unpaidDue = 0;

            if (student.enrolledCourses && student.enrolledCourses.length > 0) {
                student.enrolledCourses.forEach(enrollment => {
                    // Handle both populated and non-populated course data
                    const courseId = enrollment.courseId || enrollment._id || enrollment;
                    const course = courses.find(c => c._id === courseId || c.id === courseId);
                    
                    if (course) {
                        const allCourseMonths = months.filter(month => 
                            month.courseId === course._id || month.courseId === course.id
                        ).sort((a, b) => (a.monthNumber || 0) - (b.monthNumber || 0));
                        
                        if (enrollment.startingMonthId) {
                            const startingMonth = months.find(m => m._id === enrollment.startingMonthId || m.id === enrollment.startingMonthId);
                            const endingMonth = enrollment.endingMonthId ? months.find(m => m._id === enrollment.endingMonthId || m.id === enrollment.endingMonthId) : null;
                            
                            if (startingMonth) {
                                // Only include months from starting month onwards
                                let applicableMonths = allCourseMonths.filter(month => 
                                    (month.monthNumber || 0) >= (startingMonth.monthNumber || 0)
                                );
                                
                                // If ending month is specified, filter out months after it
                                if (endingMonth) {
                                    applicableMonths = applicableMonths.filter(month => 
                                        (month.monthNumber || 0) <= (endingMonth.monthNumber || 0)
                                    );
                                }
                                
                                applicableMonths.forEach(month => {
                                    // Calculate remaining due after payments and discounts
                                    const monthPayment = monthPaymentDetails[month._id || month.id];
                                    if (!monthPayment) {
                                        // No payment made for this month
                                        unpaidDue += month.payment || 0;
                                    } else {
                                        // Calculate remaining due after payments and discounts
                                        const totalCovered = monthPayment.totalPaid + monthPayment.totalDiscount;
                                        const remainingDue = Math.max(0, (month.payment || 0) - totalCovered);
                                        unpaidDue += remainingDue;
                                    }
                                });
                            }
                        }
                    }
                });
            }

            totalPending += unpaidDue;
        });

        return totalPending;
    }

    getMonthPaymentDetails(studentId, payments) {
        const details = {};
        
        payments.filter(p => p.studentId === studentId).forEach(payment => {
            if (payment.monthPayments && Array.isArray(payment.monthPayments)) {
                payment.monthPayments.forEach(monthPayment => {
                    const monthId = monthPayment.monthId;
                    if (!details[monthId]) {
                        details[monthId] = { totalPaid: 0, totalDiscount: 0 };
                    }
                    details[monthId].totalPaid += monthPayment.paidAmount || 0;
                    details[monthId].totalDiscount += monthPayment.discount || 0;
                });
            }
        });
        
        return details;
    }

    async loadRecentActivities() {
        try {
            console.log('Loading recent activities...');
            const response = await fetch('/api/activities');
            console.log('Activities response status:', response.status);
            
            if (!response.ok) {
                console.error('Failed to fetch activities, status:', response.status);
                this.showErrorActivities();
                return;
            }

            const allActivities = await response.json();
            console.log('All activities loaded:', allActivities.length);
            const activities = allActivities.slice(0, 10); // Get latest 10 activities
            this.cache.activities = activities;

            const activitiesContainer = document.getElementById('recentActivities');

            if (activities.length === 0) {
                console.log('No activities found, showing empty state');
                this.showEmptyActivities();
                return;
            }

            console.log('Displaying', activities.length, 'activities');
            activitiesContainer.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        ${this.getActivityIcon(activity.type)}
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.description}</div>
                        <div class="activity-time">${Utils.getRelativeTime(activity.timestamp)} by ${activity.user}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent activities:', error);
            this.showErrorActivities();
        }
    }

    showEmptyActivities() {
        const activitiesContainer = document.getElementById('recentActivities');
        activitiesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No recent activities</p>
                <small>Activities will appear here when you start using the system</small>
                <button onclick="window.dashboardManager.createTestActivity()" class="btn btn-sm" style="margin-top: 12px;">Create Test Activity</button>
            </div>
        `;
    }

    async createTestActivity() {
        try {
            if (window.activityService) {
                await window.activityService.addActivity(
                    'test_activity',
                    'Test activity created from dashboard',
                    { timestamp: new Date().toISOString() }
                );
                Utils.showToast('Test activity created!', 'success');
                // Refresh activities after creating test
                setTimeout(() => this.loadRecentActivities(), 500);
            } else {
                Utils.showToast('Activity service not available', 'error');
            }
        } catch (error) {
            console.error('Error creating test activity:', error);
            Utils.showToast('Failed to create test activity', 'error');
        }
    }

    showErrorActivities() {
        const activitiesContainer = document.getElementById('recentActivities');
        activitiesContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>Error loading activities</p>
                <button onclick="window.dashboardManager.loadRecentActivities()" class="btn btn-sm">Retry</button>
            </div>
        `;
    }

    getActivityIcon(activityType) {
        const iconMap = {
            'batch_created': '📚',
            'batch_updated': '✏️',
            'batch_deleted': '🗑️',
            'course_created': '📖',
            'course_updated': '✏️',
            'course_deleted': '🗑️',
            'month_created': '📅',
            'month_updated': '✏️',
            'month_deleted': '🗑️',
            'institution_created': '🏫',
            'institution_updated': '✏️',
            'institution_deleted': '🗑️',
            'student_added': '👤',
            'student_updated': '✏️',
            'student_deleted': '🗑️',
            'payment_received': '💰'
        };

        return iconMap[activityType] || '📄';
    }
}

// Global dashboard manager instance
window.dashboardManager = new DashboardManager();
