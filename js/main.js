// Main application initialization
class App {
    constructor() {
        this.currentUser = null;
        this.initializationComplete = false;
        // Don't start init immediately, wait for DOM to be ready
    }

    async init() {
        console.log('App initialization started');
        
        // Wait for AuthManager to be available and initialized
        let attempts = 0;
        while (!window.authManager || !window.authManager.initialized) {
            console.log('Waiting for AuthManager...', attempts);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            if (attempts > 50) { // 5 second timeout
                console.error('AuthManager initialization timeout');
                break;
            }
        }
        
        // Initialize theme
        this.initializeTheme();
        
        // Check for existing user session
        console.log('About to check user session');
        await this.checkUserSession();
        console.log('User session check completed');
        
        // Initialize login form
        this.initializeLoginForm();
        
        // Initialize theme toggle
        this.initializeThemeToggle();
        
        // Initialize logout
        this.initializeLogout();
        
        this.initializationComplete = true;
        console.log('App initialization completed');
    }

    async initializeTheme() {
        try {
            const response = await fetch('/api/settings/theme');
            const data = await response.json();
            const savedTheme = data.value || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.textContent = savedTheme === 'light' ? '🌓' : '☀️';
            }
        } catch (error) {
            console.error('Error loading theme:', error);
            // Default to light theme if unable to load
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    initializeThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', async () => {
                try {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                    
                    await fetch('/api/settings/theme', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ value: newTheme })
                    });
                    
                    document.documentElement.setAttribute('data-theme', newTheme);
                    themeToggle.textContent = newTheme === 'light' ? '🌓' : '☀️';
                } catch (error) {
                    console.error('Error saving theme:', error);
                    Utils.showToast('Failed to save theme preference', 'error');
                }
            });
        }
    }

    initializeLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    async checkUserSession() {
        console.log('Starting user session check...');
        console.log('AuthManager available:', !!window.authManager);
        
        if (!window.authManager) {
            console.log('AuthManager not available, showing login modal');
            this.showLoginModal();
            return;
        }
        
        const currentUser = await window.authManager.getCurrentUser();
        console.log('User session check result:', currentUser);
        if (currentUser) {
            this.currentUser = currentUser;
            console.log('Showing main app for user:', currentUser.username);
            this.showMainApp();
        } else {
            console.log('No valid session found, showing login modal');
            this.showLoginModal();
        }
    }

    initializeLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    async handleLogin() {
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!username || !password) {
            Utils.showToast('Please enter both username and password', 'error');
            return;
        }

        try {
            const result = await window.authManager.login(username, password);
            
            if (result.success) {
                this.currentUser = result.user;
                console.log('Login successful:', result.user);
                Utils.showToast(`Welcome back, ${result.user.name || result.user.username}!`, 'success');
                this.showMainApp();
                
                // Update user display immediately
                if (window.navigationManager && window.navigationManager.updateUserDisplay) {
                    await window.navigationManager.updateUserDisplay(result.user);
                }
                
                // Clear form
                document.getElementById('loginForm').reset();
            } else {
                Utils.showToast(result.message || 'Invalid username or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            Utils.showToast('Login failed. Please try again.', 'error');
        }
    }

    async showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        const mainApp = document.getElementById('app');
        
        if (loginModal) {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show first-time setup message if needed
            try {
                const response = await fetch('/api/settings/first-time-setup');
                const data = await response.json();
                if (data.isFirstTime && data.adminPassword) {
                    const demoCredentials = loginModal.querySelector('.demo-credentials');
                    if (demoCredentials) {
                        demoCredentials.innerHTML = `
                            <h4>🔐 First Time Setup:</h4>
                            <p><strong>Username:</strong> admin</p>
                            <p><strong>Password:</strong> ${data.adminPassword}</p>
                            <p style="color: var(--danger-color); font-weight: bold;">⚠️ Please change this password immediately after login!</p>
                        `;
                    }
                }
            } catch (error) {
                console.error('Error checking first-time setup:', error);
            }
        }
        if (mainApp) {
            mainApp.style.display = 'none';
        }
    }

    async showMainApp() {
        const loginModal = document.getElementById('loginModal');
        const mainApp = document.getElementById('app');
        
        if (loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (mainApp) {
            mainApp.style.display = 'flex';
        }
        
        // Clear first-time setup status if needed
        try {
            await fetch('/api/settings/first-time-setup', {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error clearing first-time setup:', error);
        }

        // Initialize navigation manager
        if (!window.navigationManager.isInitialized) {
            await window.navigationManager.hideLoginModal();
        }

        // Refresh dashboard
        if (window.dashboardManager) {
            await window.dashboardManager.refresh();
        }
    }

    logout() {
        Utils.confirm('Are you sure you want to logout?', () => {
            window.authManager.logout();
            this.currentUser = null;
            this.showLoginModal();
            
            // Reset navigation to dashboard
            window.navigationManager.navigateTo('dashboard');
            
            Utils.showToast('Logged out successfully', 'success');
        });
    }
}

// Global logout function
window.logout = function() {
    if (window.app) {
        window.app.logout();
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, creating App instance');
    window.app = new App();
    await window.app.init();
});