// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.initialized = false;
        this.initPromise = this.init();
    }

    async init() {
        try {
            await this.loadUsers();
            await this.ensureDefaultUsers();
            this.initialized = true;
        } catch (error) {
            console.error('AuthManager initialization error:', error);
            this.initialized = true; // Mark as initialized even on error
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                this.users = await response.json();
            } else {
                this.users = [];
            }
        } catch (e) {
            console.error('Error loading users:', e);
            this.users = [];
        }
    }

    async ensureDefaultUsers() {
        // Only create default users if no users exist
        if (this.users.length === 0) {
            await this.createDefaultUsers();
            console.log('Created default demo users');
        } else {
            console.log('Existing users found, skipping default user creation');
        }
    }

    async createDefaultUsers() {
        // Create default users with plain text passwords for demo
        const defaultUsers = [
            {
                username: 'admin',
                password: 'admin123', // Plain text for demo
                role: 'admin',
                name: 'Administrator'
            },
            {
                username: 'manager',
                password: 'manager123', // Plain text for demo
                role: 'manager',
                name: 'Manager'
            },
            {
                username: 'developer',
                password: 'dev123', // Plain text for demo
                role: 'developer',
                name: 'Developer'
            }
        ];

        for (const user of defaultUsers) {
            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
                if (response.ok) {
                    const newUser = await response.json();
                    this.users.push(newUser);
                }
            } catch (e) {
                console.error('Error creating default user:', e);
            }
        }
        console.log('Default users created:', this.users.map(u => ({ username: u.username, role: u.role })));
    }

    async login(username, password) {
        console.log('Login attempt:', { username, password });

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                // User session is now stored server-side
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        this.currentUser = null;
        
        // Force a page reload to clear any cached state
        window.location.reload();
    }

    async getCurrentUser() {
        // Wait for initialization to complete
        if (!this.initialized) {
            console.log('Waiting for AuthManager initialization...');
            await this.initPromise;
            console.log('AuthManager initialization complete');
        }

        if (!this.currentUser) {
            try {
                console.log('Checking session with server...');
                const response = await fetch('/api/auth/session', {
                    credentials: 'include'
                });
                console.log('Session check response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Session data received:', data);
                    this.currentUser = data.user;
                } else {
                    console.log('Session check failed with status:', response.status);
                    this.currentUser = null;
                }
            } catch (error) {
                console.error('Error checking session:', error);
                this.currentUser = null;
            }
        }
        console.log('Returning current user:', this.currentUser);
        return this.currentUser;
    }

    hasPermission(requiredRoles) {
        if (!this.currentUser) return false;
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.includes(this.currentUser.role);
    }

    async addUser(username, password, role, name = '') {
        // Check if user exists
        const existingUser = this.users.find(u => u.username === username);
        if (existingUser) {
            return { success: false, message: 'Username already exists' };
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role, name })
            });

            const data = await response.json();

            if (response.ok) {
                this.users.push(data);
                return { success: true, user: data };
            } else {
                return { success: false, message: data.message || 'Failed to create user' };
            }
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, message: 'Failed to create user' };
        }
    }

    async updateUser(id, updates) {
        // Check if username already exists (for other users)
        if (updates.username && this.users.find(u => u.username === updates.username && u._id !== id)) {
            return { success: false, message: 'Username already exists' };
        }
        
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (response.ok) {
                const userIndex = this.users.findIndex(u => u._id === id);
                if (userIndex !== -1) {
                    this.users[userIndex] = data;
                }
                return { success: true, user: data };
            } else {
                return { success: false, message: data.message || 'Failed to update user' };
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, message: 'Failed to update user' };
        }
    }

    async deleteUser(id) {
        const userIndex = this.users.findIndex(u => u._id === id);
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        // Prevent deleting the last developer
        const user = this.users[userIndex];
        if (user.role === 'developer') {
            const developerCount = this.users.filter(u => u.role === 'developer').length;
            if (developerCount <= 1) {
                return { success: false, message: 'Cannot delete the last developer account' };
            }
        }

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.users.splice(userIndex, 1);
                return { success: true };
            } else {
                const data = await response.json();
                return { success: false, message: data.message || 'Failed to delete user' };
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, message: 'Failed to delete user' };
        }
    }

    getAllUsers() {
        return this.users.map(user => ({
            id: user._id,
            username: user.username,
            role: user.role,
            name: user.name
        }));
    }
}

// Global auth manager instance
window.authManager = new AuthManager();