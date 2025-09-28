'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { referenceOptionsApi, receivedByOptionsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Settings, Shield, Users } from 'lucide-react';

export default function ReferenceManagement() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  
  const [newReference, setNewReference] = useState('');
  const [newReceivedBy, setNewReceivedBy] = useState('');

  // Check permissions
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
  const { data: referenceOptions = [] } = useQuery('reference-options', () => 
    referenceOptionsApi.getAll().then(res => res.data)
  );
  const { data: receivedByOptions = [] } = useQuery('received-by-options', () => 
    receivedByOptionsApi.getAll().then(res => res.data)
  );

  // Mutations
  const createReferenceMutation = useMutation(referenceOptionsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('reference-options');
      setNewReference('');
      toast.success('Reference option added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add reference option');
    },
  });

  const createReceivedByMutation = useMutation(receivedByOptionsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('received-by-options');
      setNewReceivedBy('');
      toast.success('Receiver option added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add receiver option');
    },
  });

  const deleteReferenceMutation = useMutation(referenceOptionsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('reference-options');
      toast.success('Reference option deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete reference option');
    },
  });

  const deleteReceivedByMutation = useMutation(receivedByOptionsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('received-by-options');
      toast.success('Receiver option deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete receiver option');
    },
  });

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReference.trim()) return;
    createReferenceMutation.mutate({ name: newReference.trim() });
  };

  const handleAddReceivedBy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceivedBy.trim()) return;
    createReceivedByMutation.mutate({ name: newReceivedBy.trim() });
  };

  const handleDeleteReference = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteReferenceMutation.mutate(id);
    }
  };

  const handleDeleteReceivedBy = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteReceivedByMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reference Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage payment reference and receiver options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manage Reference Options */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reference Options</h3>
          </div>
          
          <form onSubmit={handleAddReference} className="space-y-4 mb-6">
            <div>
              <label className="form-label">Reference Option</label>
              <input
                type="text"
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                className="form-input"
                placeholder="e.g., Cash Payment, Bank Transfer"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createReferenceMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createReferenceMutation.isLoading ? 'Adding...' : 'Add Reference'}
            </button>
          </form>

          {/* Existing Reference Options */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Existing Options</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {referenceOptions.map((option: any) => (
                <div key={option._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium">{option.name}</span>
                  <button
                    onClick={() => handleDeleteReference(option._id, option.name)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manage Received By Options */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receiver Options</h3>
          </div>
          
          <form onSubmit={handleAddReceivedBy} className="space-y-4 mb-6">
            <div>
              <label className="form-label">Receiver Name</label>
              <input
                type="text"
                value={newReceivedBy}
                onChange={(e) => setNewReceivedBy(e.target.value)}
                className="form-input"
                placeholder="e.g., John Doe, Reception Desk"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createReceivedByMutation.isLoading}
              className="w-full btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              {createReceivedByMutation.isLoading ? 'Adding...' : 'Add Receiver'}
            </button>
          </form>

          {/* Existing Received By Options */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Existing Options</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {receivedByOptions.map((option: any) => (
                <div key={option._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium">{option.name}</span>
                  <button
                    onClick={() => handleDeleteReceivedBy(option._id, option.name)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}