'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { paymentsApi, coursesApi } from '@/lib/api';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('date');
  const [reportDate, setReportDate] = useState('');
  const [reportCourse, setReportCourse] = useState('');

  // Queries
  const { data: payments = [] } = useQuery('payments', () => 
    paymentsApi.getAll().then(res => res.data)
  );
  const { data: courses = [] } = useQuery('courses', () => 
    coursesApi.getAll().then(res => res.data)
  );

  const generateReport = () => {
    // Implement report generation logic
    console.log('Generating report:', { reportType, reportDate, reportCourse });
  };

  const exportReport = () => {
    // Implement CSV export
    console.log('Exporting report');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate and view payment reports</p>
      </div>

      {/* Report Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Reports</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="form-label">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-input"
            >
              <option value="date">By Date</option>
              <option value="week">By Week</option>
              <option value="month">By Month</option>
              <option value="course">By Course</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Date</label>
            <input
              type={reportType === 'week' ? 'week' : reportType === 'month' ? 'month' : 'date'}
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Course</label>
            <select
              value={reportCourse}
              onChange={(e) => setReportCourse(e.target.value)}
              className="form-input"
            >
              <option value="">All Courses</option>
              {courses.map((course: any) => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button onClick={generateReport} className="btn btn-primary w-full">
              <TrendingUp className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Results</h3>
          <button onClick={exportReport} className="btn btn-outline">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-primary-500">{payments.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Payments</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              ৳{payments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-orange-500">
              ৳{payments.reduce((sum: number, p: any) => sum + (p.discountAmount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Discounts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">
              ৳{payments.length > 0 ? (payments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0) / payments.length).toFixed(0) : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Payment</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Received By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments.slice(0, 10).map((payment: any) => (
                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      {payment.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {payment.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ৳{payment.paidAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {payment.receivedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}