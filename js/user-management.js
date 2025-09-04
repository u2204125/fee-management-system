class UserManagementManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.bindEvents();
        this.refresh();
    }

    bindEvents() {
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
            });
        }
    }

    refresh() {
        this.displayUsers();
    }

    displayUsers() {
        const users = window.authManager.getAllUsers();
        const usersList = document.getElementById('usersList');
        
        if (!usersList) return;

        if (users.length === 0) {
            usersList.innerHTML = '<p class="text-center">No users found</p>';
            return;
        }

        const currentUser = window.authManager.getCurrentUser();
        
        usersList.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <h4>${user.username}</h4>
                    <span class="user-role ${user.role.toLowerCase()}">${user.role}</span>
                </div>
                <div class="user-actions">
                    ${this.canManageUser(currentUser, user) ? `
                        <button class="btn btn-small btn-outline" onclick="userManagementManager.editUser('${user.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="userManagementManager.deleteUser('${user.id}')">Delete</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    canManageUser(currentUser, targetUser) {
        if (!currentUser || currentUser.role !== 'developer') return false;
        if (currentUser.id === targetUser.id) return false; // Can't manage self
        return true;
    }

    async addUser() {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        const role = document.getElementById('newUserRole').value;
        const name = document.getElementById('newUserName')?.value.trim() || username;

        if (!username || !password || !role) {
            Utils.showToast('Please fill all fields', 'error');
            return;
        }

        const result = await window.authManager.addUser(username, password, role, name);
        
        if (result.success) {
            Utils.showToast('User created successfully!', 'success');
            document.getElementById('addUserForm').reset();
            this.refresh();
        } else {
            Utils.showToast(result.message, 'error');
        }
    }

    editUser(userId) {
        const users = window.authManager.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            Utils.showToast('User not found', 'error');
            return;
        }

        const editForm = `
            <form id="editUserForm">
                <div class="form-group">
                    <label for="editUsername">Username</label>
                    <input type="text" id="editUsername" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label for="editPassword">New Password (leave blank to keep current)</label>
                    <input type="password" id="editPassword">
                </div>
                <div class="form-group">
                    <label for="editRole">Role</label>
                    <select id="editRole" required>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="developer" ${user.role === 'developer' ? 'selected' : ''}>Developer</option>
                    </select>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Update User</button>
                    <button type="button" class="btn btn-outline" onclick="navigationManager.closeModal(document.getElementById('editModal'))">Cancel</button>
                </div>
            </form>
        `;

        window.navigationManager.showModal('editModal', 'Edit User', editForm);

        document.getElementById('editUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUser(userId);
        });
    }

    async updateUser(userId) {
        const username = document.getElementById('editUsername').value.trim();
        const password = document.getElementById('editPassword').value.trim();
        const role = document.getElementById('editRole').value;

        if (!username || !role) {
            Utils.showToast('Please fill all required fields', 'error');
            return;
        }

        const updates = { username, role };
        if (password) {
            updates.password = password;
        }

        const result = await window.authManager.updateUser(userId, updates);
        
        if (result.success) {
            Utils.showToast('User updated successfully!', 'success');
            window.navigationManager.closeModal(document.getElementById('editModal'));
            this.refresh();
        } else {
            Utils.showToast(result.message, 'error');
        }
    }

    async deleteUser(userId) {
        const users = window.authManager.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            Utils.showToast('User not found', 'error');
            return;
        }

        Utils.confirm(`Are you sure you want to delete user "${user.username}"?`, async () => {
            const result = await window.authManager.deleteUser(userId);
            
            if (result.success) {
                Utils.showToast('User deleted successfully!', 'success');
                this.refresh();
            } else {
                Utils.showToast(result.message, 'error');
            }
        });
    }
}

// Global user management manager instance
window.userManagementManager = new UserManagementManager();

class UserManagementManager2 {
    constructor() {
        this.currentUser = null;
        this.init().catch(console.error);
    }

    async init() {
        this.currentUser = await window.authManager?.getCurrentUser();
        await this.refresh();
        this.bindEvents();
    }

    bindEvents() {
        const createForm = document.getElementById('create-user-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createUser().catch(error => {
                    console.error('Error creating user:', error);
                    this.showMessage('Failed to create user', 'error');
                });
            });
        }
    }

    async refresh() {
        await this.displayUsers();
    }

    async displayUsers() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const users = await response.json();

            if (users.length === 0) {
                usersList.innerHTML = '<p>No users found</p>';
                return;
            }

            usersList.innerHTML = users.map(user => `
                <div class="user-card">
                    <h4>${user.username}</h4>
                    <p>Role: ${user.role}</p>
                    <p>Name: ${user.name || user.username}</p>
                    <p>Created: ${new Date(user.createdAt).toLocaleDateString()}</p>
                    <div class="user-actions">
                        ${this.canManageUser(user) ? `
                            <button onclick="userManagementManager.editUser('${user._id}')" class="btn btn-edit">Edit</button>
                            <button onclick="userManagementManager.deleteUser('${user._id}')" class="btn btn-delete">Delete</button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching users:', error);
            usersList.innerHTML = '<p class="error">Error loading users</p>';
        }
    }

    canManageUser(user) {
        if (!this.currentUser) return false;
        if (this.currentUser._id === user._id) return false; // Can't manage self
        
        // Role hierarchy: Developer > Admin > Manager
        const roleHierarchy = { 'manager': 1, 'admin': 2, 'developer': 3 };
        return roleHierarchy[this.currentUser.role.toLowerCase()] > roleHierarchy[user.role.toLowerCase()];
    }

    async createUser() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.getElementById('role').value;
        const name = document.getElementById('name')?.value.trim() || username;

        if (!username || !password || !role) {
            this.showMessage('Please fill all required fields', 'error');
            return;
        }

        // Check permissions
        if (!this.canCreateRole(role)) {
            this.showMessage('You do not have permission to create this role', 'error');
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    role,
                    name,
                    createdBy: this.currentUser ? this.currentUser._id : 'system'
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create user');
            }

            this.showMessage('User created successfully!', 'success');
            document.getElementById('create-user-form').reset();
            await this.refresh();
        } catch (error) {
            console.error('Error creating user:', error);
            this.showMessage(error.message || 'Failed to create user', 'error');
        }
    }

    canCreateRole(role) {
        if (!this.currentUser) return false;
        
        switch (this.currentUser.role.toLowerCase()) {
            case 'developer':
                return true; // Can create any role
            case 'admin':
                return role.toLowerCase() !== 'developer'; // Cannot create Developer
            default:
                return false; // Manager cannot create users
        }
    }

    async editUser(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const user = await response.json();
            
            if (!user) {
                this.showMessage('User not found', 'error');
                return;
            }

            // Create edit form
            const editForm = document.createElement('div');
            editForm.className = 'modal';
            editForm.innerHTML = `
                <div class="modal-content">
                    <h3>Edit User</h3>
                    <form id="edit-user-form">
                        <div class="form-group">
                            <label for="edit-username">Username:</label>
                            <input type="text" id="edit-username" value="${user.username}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-name">Name:</label>
                            <input type="text" id="edit-name" value="${user.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-password">New Password (leave blank to keep current):</label>
                            <input type="password" id="edit-password">
                        </div>
                        <div class="form-group">
                            <label for="edit-role">Role:</label>
                            <select id="edit-role" required>
                                <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                ${this.currentUser.role === 'developer' ? 
                                    `<option value="developer" ${user.role === 'developer' ? 'selected' : ''}>Developer</option>` : ''
                                }
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Update User</button>
                            <button type="button" onclick="this.closest('.modal').remove()" class="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(editForm);

            editForm.querySelector('#edit-user-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateUser(userId, editForm);
            });
        } catch (error) {
            console.error('Error loading user details:', error);
            this.showMessage('Failed to load user details', 'error');
        }
    }

    async updateUser(userId, editForm) {
        const username = editForm.querySelector('#edit-username').value.trim();
        const name = editForm.querySelector('#edit-name').value.trim();
        const password = editForm.querySelector('#edit-password').value.trim();
        const role = editForm.querySelector('#edit-role').value;

        if (!username || !name || !role) {
            this.showMessage('Please fill all required fields', 'error');
            return;
        }

        try {
            const updates = { username, name, role };
            if (password) {
                updates.password = password;
            }

            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user');
            }

            this.showMessage('User updated successfully!', 'success');
            editForm.remove();
            await this.refresh();
        } catch (error) {
            console.error('Error updating user:', error);
            this.showMessage(error.message || 'Failed to update user', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete user');
            }

            this.showMessage('User deleted successfully!', 'success');
            await this.refresh();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showMessage(error.message || 'Failed to delete user', 'error');
        }
    }

    showMessage(message, type) {
        // Create or update message display
        let messageDiv = document.getElementById('message-display');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'message-display';
            messageDiv.className = 'message';
            document.querySelector('.container').prepend(messageDiv);
        }

        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userManagementManager = new UserManagementManager();
});