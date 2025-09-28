'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Users, Shield } from 'lucide-react';

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = useAuth();
  
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    role: '',
    name: '',
    email: '',
  });

  // Check if user has permission to access this page
  if (!hasPermission(['developer'])) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  // Queries
  const { data: users = [], isLoading } = useQuery('users', () => 
    usersApi.getAll().then(res => res.data)
  );

  // Mutations
  const createUserMutation = useMutation(usersApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      setUserData({
        username: '',
        password: '',
        role: '',
        name: '',
        email: '',
      });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const deleteUserMutation = useMutation(usersApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData.username.trim() || !userData.password.trim() || !userData.role || !userData.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    createUserMutation.mutate(userData);
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const updateUserData = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary-100 text-primary-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'developer': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system users and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New User */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New User</h3>
          </div>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => updateUserData('username', e.target.value)}
                  className="form-input"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => updateUserData('name', e.target.value)}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => updateUserData('password', e.target.value)}
                  className="form-input"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select
                  value={userData.role}
                  onChange={(e) => updateUserData('role', e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => updateUserData('email', e.target.value)}
                className="form-input"
                placeholder="Enter email address"
              />
            </div>
            
            <button
              type="submit"
              disabled={createUserMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* Existing Users */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Existing Users</h3>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user: any) => (
              <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{user.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                  {user.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">{user.email}</p>
                  )}
                </div>
                
                {currentUser?._id !== user._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteUser(user._id, user.username)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}