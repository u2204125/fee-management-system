'use client';

import { useQuery } from 'react-query';
import { paymentsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Shield, TrendingDown } from 'lucide-react';

export default function DiscountReports() {
  const { hasPermission } = useAuth();

  // Check permissions
  if (!hasPermission(['admin', 'developer'])) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  // Queries
  const { data: discountedPayments = [], isLoading } = useQuery('discounted-payments', () => 
    paymentsApi.getDiscounted().then(res => res.data)
  );

  const totalDiscountGiven = discountedPayments.reduce((sum: number, payment: any) => 
    sum + (payment.discountAmount || 0), 0
  );

  const totalOriginalAmount = discountedPayments.reduce((sum: number, payment: any) => 
    sum + (payment.paidAmount + payment.discountAmount), 0
  );

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discount Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">View and analyze discount payments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6 text-center">
          <TrendingDown className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{discountedPayments.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Discounted Payments</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-red-500">৳{totalDiscountGiven.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Discount Given</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-blue-500">৳{totalOriginalAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Original Amount</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-green-500">
            {totalOriginalAmount > 0 ? ((totalDiscountGiven / totalOriginalAmount) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Discount Rate</div>
        </div>
      </div>

      {/* Discounted Payments Table */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discounted Payments</h3>
        </div>
        
        {discountedPayments.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No discounted payments found</p>
          </div>
        ) : (
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
                    Original Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Final Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {discountedPayments.map((payment: any) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ৳{(payment.paidAmount + payment.discountAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -৳{payment.discountAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ৳{payment.paidAmount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}