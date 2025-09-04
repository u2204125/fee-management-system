// Navigation Manager
class NavigationManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.bindEvents();
        await this.setupRoleBasedNavigation();
    }

    bindEvents() {
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) {
                    this.navigateTo(page);
                }
            });
        });

        // Modal close events
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    async navigateTo(page) {
        // Check permissions
        const navItem = document.querySelector(`[data-page="${page}"]`);
        if (navItem && navItem.dataset.roles) {
            const requiredRoles = navItem.dataset.roles.split(',');
            if (!window.authManager.hasPermission(requiredRoles)) {
                Utils.showToast('You do not have permission to access this page', 'error');
                return;
            }
        }

        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        if (navItem) {
            navItem.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(pageElement => {
            pageElement.style.display = 'none';
        });

        // Show selected page
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.style.display = 'block';
            this.currentPage = page;
        }

        // Refresh page content
        await this.refreshPageContent(page);
    }

    async refreshPageContent(page) {
        switch (page) {
            case 'dashboard':
                window.dashboardManager?.refresh();
                break;
            case 'manage-batch':
                window.batchManager?.refresh();
                break;
            case 'manage-students':
                if (window.studentManagementManager) {
                    await window.studentManagementManager.refresh();
                }
                break;
            case 'students-database':
                window.studentsDatabaseManager?.refresh();
                break;
            case 'pay-fee':
                window.feePaymentManager?.refresh();
                break;
            case 'reports':
                window.reportsManager?.refresh();
                break;
            case 'discount-reports':
                window.reportsManager?.refresh();
                break;
            case 'user-management':
                window.userManagementManager?.refresh();
                break;
            case 'reference-management':
                window.referenceManagementManager?.refresh();
                break;
        }
    }

    async setupRoleBasedNavigation() {
        const currentUser = await window.authManager.getCurrentUser();
        if (!currentUser) return;

        document.querySelectorAll('[data-roles]').forEach(element => {
            const requiredRoles = element.dataset.roles.split(',');
            if (!window.authManager.hasPermission(requiredRoles)) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });

        // Update user info
        await this.updateUserDisplay(currentUser);
    }

    async updateUserDisplay(currentUser = null) {
        if (!currentUser) {
            currentUser = await window.authManager.getCurrentUser();
        }

        if (currentUser) {
            const userDisplay = currentUser.name || currentUser.username || 'Unknown User';
            const roleDisplay = currentUser.role || 'Unknown Role';
            document.getElementById('currentUser').textContent = `${userDisplay} (${roleDisplay})`;
        } else {
            document.getElementById('currentUser').textContent = 'Not logged in';
        }
    }

    // async navigateTo(page) {
    //     // Check permissions
    //     const navItem = document.querySelector(`[data-page="${page}"]`);
    //     const requiredRoles = navItem?.dataset.roles?.split(',') || [];
        
    //     if (!window.authManager.hasPermission(requiredRoles)) {
    //         Utils.showToast('You do not have permission to access this page', 'error');
    //         return;
    //     }

    //     // Hide all pages
    //     document.querySelectorAll('.page').forEach(p => {
    //         p.classList.remove('active');
    //     });

    //     // Show target page
    //     const targetPage = document.getElementById(page);
    //     if (targetPage) {
    //         targetPage.classList.add('active');
    //         this.currentPage = page;

    //         // Update navigation
    //         document.querySelectorAll('.nav-item').forEach(item => {
    //             item.classList.remove('active');
    //         });
    //         navItem?.classList.add('active');

    //         // Refresh page content if needed
    //         await this.refreshPageContent(page);
    //     }
    // }

    // refreshPageContent(page) {
    //     switch (page) {
    //         case 'dashboard':
    //             window.dashboardManager?.refresh();
    //             break;
    //         case 'manage-batch':
    //             window.batchManager?.refresh();
    //             break;
    //         case 'manage-students':
    //             if (window.studentManagementManager) {
    //                 await window.studentManagementManager.refresh();
    //             }
    //             break;
    //         case 'students-database':
    //             window.studentsDatabaseManager?.refresh();
    //             break;
    //         case 'pay-fee':
    //             window.feePaymentManager?.refresh();
    //             break;
    //         case 'reports':
    //             window.reportsManager?.refresh();
    //             break;
    //         case 'discount-reports':
    //             window.reportsManager?.refresh();
    //             break;
    //         case 'user-management':
    //             window.userManagementManager?.refresh();
    //             break;
    //         case 'reference-management':
    //             window.referenceManagementManager?.refresh();
    //             break;
    //     }
    // }

    showModal(modalId, title = '', content = '') {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (title) {
                const titleElement = modal.querySelector('.modal-header h3, .modal-header h2');
                if (titleElement) titleElement.textContent = title;
            }

            if (content) {
                const bodyElement = modal.querySelector('.modal-content > div:not(.modal-header)');
                if (bodyElement) bodyElement.innerHTML = content;
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        try {
            await fetch('/api/settings/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: newTheme })
            });

            document.documentElement.setAttribute('data-theme', newTheme);

            // Update theme toggle button
            const toggleBtn = document.getElementById('themeToggle');
            toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌓';
        } catch (error) {
            console.error('Error saving theme:', error);
            Utils.showToast('Failed to save theme preference', 'error');
        }
    }

    async initializeTheme() {
        try {
            const response = await fetch('/api/settings/theme');
            const data = await response.json();
            const savedTheme = data.value || 'light';
            
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            const toggleBtn = document.getElementById('themeToggle');
            toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌓';
        } catch (error) {
            console.error('Error loading theme:', error);
            // Default to light theme if unable to load
            document.documentElement.setAttribute('data-theme', 'light');
            const toggleBtn = document.getElementById('themeToggle');
            if (toggleBtn) {
                toggleBtn.textContent = '🌓';
            }
        }
    }

    logout() {
        Utils.confirm('Are you sure you want to logout?', () => {
            window.authManager.logout();
            this.showLoginModal();
        });
    }

    showLoginModal() {
        document.getElementById('app').style.display = 'none';
        document.getElementById('loginModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    async hideLoginModal() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('app').style.display = 'flex';
        document.body.style.overflow = '';
        await this.setupRoleBasedNavigation();
        this.navigateTo('dashboard');
    }
}

// Global navigation manager instance
window.navigationManager = new NavigationManager();
