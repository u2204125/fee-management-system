'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentsApi, paymentsApi, referenceOptionsApi, receivedByOptionsApi, monthsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, CreditCard, User, Phone, Building } from 'lucide-react';

export default function FeePayment() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    selectedMonths: [] as string[],
    paidAmount: '',
    discountAmount: '',
    discountType: 'fixed',
    reference: '',
    customReference: '',
    receivedBy: '',
    customReceivedBy: '',
  });

  // Queries
  const { data: referenceOptions = [] } = useQuery('reference-options', () => 
    referenceOptionsApi.getAll().then(res => res.data)
  );
  const { data: receivedByOptions = [] } = useQuery('received-by-options', () => 
    receivedByOptionsApi.getAll().then(res => res.data)
  );
  const { data: months = [] } = useQuery('months', () => 
    monthsApi.getAll().then(res => res.data)
  );

  // Mutations
  const createPaymentMutation = useMutation(paymentsApi.create, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['payments', 'students']);
      toast.success('Payment processed successfully');
      resetForm();
      // Show invoice modal here
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      // Try to find by student ID first
      let response;
      try {
        response = await studentsApi.searchByStudentId(searchTerm);
        if (response.data && response.data.length > 0) {
          const student = response.data[0];
          setSelectedStudent(student);
          toast.success('Student found');
          return;
        }
      } catch {
        // If not found by ID, search by name
        try {
          response = await studentsApi.searchByName(searchTerm);
          if (response.data && response.data.length > 0) {
            const student = response.data[0];
            setSelectedStudent(student);
            toast.success('Student found');
            return;
          }
        } catch {
          // Last resort - get all students and filter
          const allStudents = await studentsApi.getAll();
          const student = allStudents.data.find((s: any) => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.studentId === searchTerm
          );
          
          if (student) {
            setSelectedStudent(student);
            toast.success('Student found');
            return;
          }
        }
      }

      toast.error('Student not found');
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Error searching for student');
      setSelectedStudent(null);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    if (paymentData.selectedMonths.length === 0) {
      toast.error('Please select at least one month');
      return;
    }

    if (!paymentData.paidAmount || parseFloat(paymentData.paidAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (!paymentData.receivedBy && !paymentData.customReceivedBy) {
      toast.error('Please specify who received the payment');
      return;
    }

    // Prepare payment data
    const payment = {
      studentId: selectedStudent._id,
      studentName: selectedStudent.name,
      paidAmount: parseFloat(paymentData.paidAmount),
      discountAmount: parseFloat(paymentData.discountAmount) || 0,
      discountType: paymentData.discountType,
      months: paymentData.selectedMonths,
      monthPayments: paymentData.selectedMonths.map(monthId => ({
        monthId,
        paidAmount: parseFloat(paymentData.paidAmount) / paymentData.selectedMonths.length,
        discountAmount: (parseFloat(paymentData.discountAmount) || 0) / paymentData.selectedMonths.length,
      })),
      reference: paymentData.reference === 'custom' ? paymentData.customReference : paymentData.reference,
      receivedBy: paymentData.receivedBy === 'custom' ? paymentData.customReceivedBy : paymentData.receivedBy,
    };

    createPaymentMutation.mutate(payment);
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedStudent(null);
    setPaymentData({
      selectedMonths: [],
      paidAmount: '',
      discountAmount: '',
      discountType: 'fixed',
      reference: '',
      customReference: '',
      receivedBy: '',
      customReceivedBy: '',
    });
  };

  const getAvailableMonths = () => {
    if (!selectedStudent?.enrolledCourses) return [];
    
    const availableMonths: any[] = [];
    
    selectedStudent.enrolledCourses.forEach((enrollment: any) => {
      const course = enrollment.courseId;
      // Find months for this course
      const courseMonths = months.filter((month: any) => 
        month.courseId?._id === course._id || month.courseId === course._id
      );
      availableMonths.push(...courseMonths);
    });
    
    return availableMonths;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pay Fee</h1>
        <p className="text-gray-600 dark:text-gray-400">Process student fee payments</p>
      </div>

      {/* Student Search */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Find Student</h3>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input flex-1"
            placeholder="Enter Student ID or Student Name"
            required
          />
          <button type="submit" className="btn btn-primary">
            <Search className="w-4 h-4" />
            Find Student
          </button>
        </form>
      </div>

      {/* Student Information & Payment Form */}
      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Information */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Information</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Student ID:</span>
                <span className="font-medium">{selectedStudent.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span className="font-medium">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Guardian:</span>
                <span className="font-medium">{selectedStudent.guardianName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Institution:</span>
                <span className="font-medium">{selectedStudent.institutionId?.name || 'Not assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                <span className="font-medium">{selectedStudent.batchId?.name || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Payment</h3>
            </div>
            
            <form onSubmit={handleProcessPayment} className="space-y-4">
              {/* Month Selection */}
              <div>
                <label className="form-label">Select Months</label>
                {getAvailableMonths().length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {getAvailableMonths().map((month: any) => (
                      <label key={month._id} className="flex items-center space-x-2 p-2 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={paymentData.selectedMonths.includes(month._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPaymentData(prev => ({
                                ...prev,
                                selectedMonths: [...prev.selectedMonths, month._id]
                              }));
                            } else {
                              setPaymentData(prev => ({
                                ...prev,
                                selectedMonths: prev.selectedMonths.filter(id => id !== month._id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{month.name}</div>
                          <div className="text-xs text-gray-500">৳{month.payment}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    No months available. Please ensure the student is enrolled in courses with defined months.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Paid Amount (৳)</label>
                  <input
                    type="number"
                    value={paymentData.paidAmount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paidAmount: e.target.value }))}
                    className="form-input"
                    placeholder="Enter amount paid"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Discount Amount</label>
                  <input
                    type="number"
                    value={paymentData.discountAmount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, discountAmount: e.target.value }))}
                    className="form-input"
                    placeholder="Enter discount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Reference</label>
                  <select
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select Reference</option>
                    {referenceOptions.map((option: any) => (
                      <option key={option._id} value={option.name}>{option.name}</option>
                    ))}
                    <option value="custom">Custom Reference</option>
                  </select>
                  {paymentData.reference === 'custom' && (
                    <input
                      type="text"
                      value={paymentData.customReference}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, customReference: e.target.value }))}
                      className="form-input mt-2"
                      placeholder="Enter custom reference"
                    />
                  )}
                </div>
                <div>
                  <label className="form-label">Received By</label>
                  <select
                    value={paymentData.receivedBy}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, receivedBy: e.target.value }))}
                    className="form-input"
                    required
                  >
                    <option value="">Select Receiver</option>
                    {receivedByOptions.map((option: any) => (
                      <option key={option._id} value={option.name}>{option.name}</option>
                    ))}
                    <option value="custom">Custom Receiver</option>
                  </select>
                  {paymentData.receivedBy === 'custom' && (
                    <input
                      type="text"
                      value={paymentData.customReceivedBy}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, customReceivedBy: e.target.value }))}
                      className="form-input mt-2"
                      placeholder="Enter receiver name"
                      required
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={createPaymentMutation.isLoading}
                className="w-full btn btn-primary"
              >
                <CreditCard className="w-4 h-4" />
                {createPaymentMutation.isLoading ? 'Processing...' : 'Process Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}