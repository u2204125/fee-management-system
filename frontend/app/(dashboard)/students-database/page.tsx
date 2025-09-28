'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { studentsApi, batchesApi, institutionsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Filter, Download, Eye, CreditCard } from 'lucide-react';

export default function StudentsDatabase() {
  const [filters, setFilters] = useState({
    search: '',
    batch: '',
    institution: '',
    gender: '',
    paymentStatus: '',
  });

  // Queries
  const { data: students = [], isLoading } = useQuery('students', () => 
    studentsApi.getAll().then(res => res.data)
  );
  const { data: batches = [] } = useQuery('batches', () => 
    batchesApi.getAll().then(res => res.data)
  );
  const { data: institutions = [] } = useQuery('institutions', () => 
    institutionsApi.getAll().then(res => res.data)
  );

  // Filter students based on current filters
  const filteredStudents = students.filter((student: any) => {
    const matchesSearch = !filters.search || 
      student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.phone.includes(filters.search);

    const matchesBatch = !filters.batch || student.batchId?._id === filters.batch;
    const matchesInstitution = !filters.institution || student.institutionId?._id === filters.institution;
    const matchesGender = !filters.gender || student.gender === filters.gender;

    return matchesSearch && matchesBatch && matchesInstitution && matchesGender;
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      batch: '',
      institution: '',
      gender: '',
      paymentStatus: '',
    });
  };

  const exportData = () => {
    // Implement CSV export functionality
    toast.success('Export functionality will be implemented');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students Database</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all students</p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Students</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="form-input"
              placeholder="Name, ID, or phone..."
            />
          </div>
          
          <div>
            <label className="form-label">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => updateFilter('batch', e.target.value)}
              className="form-input"
            >
              <option value="">All Batches</option>
              {batches.map((batch: any) => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Institution</label>
            <select
              value={filters.institution}
              onChange={(e) => updateFilter('institution', e.target.value)}
              className="form-input"
            >
              <option value="">All Institutions</option>
              {institutions.map((institution: any) => (
                <option key={institution._id} value={institution._id}>{institution.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => updateFilter('gender', e.target.value)}
              className="form-input"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              className="form-input"
            >
              <option value="">All Students</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button onClick={clearFilters} className="btn btn-outline flex-1">
              Clear
            </button>
            <button onClick={exportData} className="btn btn-secondary">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-500">{students.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{filteredStudents.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Filtered Results</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-500">৳0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">৳0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Dues</div>
        </div>
      </div>

      {/* Students List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Students ({filteredStudents.length})
        </h3>
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-500 dark:text-gray-400">No students found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((student: any) => (
              <div key={student._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                    <p className="text-sm text-primary-500">ID: {student.studentId}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Institution:</span>
                    <span>{student.institutionId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                    <span>{student.batchId?.name || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-small btn-outline flex-1">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="btn btn-small btn-primary flex-1">
                    <CreditCard className="w-4 h-4" />
                    Pay Fee
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}