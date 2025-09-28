'use client';

import { useQuery } from 'react-query';
import { studentsApi, paymentsApi, activitiesApi, invoicesApi } from '@/lib/api';
import Link from 'next/link';
import StatsCard from './StatsCard';
import RecentActivities from './RecentActivities';
import { Users, GraduationCap, DollarSign, AlertCircle, CreditCard, FileText } from 'lucide-react';

export default function Dashboard() {
  // Fetch data with proper error handling
  const { data: studentsResponse, isLoading: studentsLoading, error: studentsError } = useQuery(
    'dashboard-students', 
    () => studentsApi.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => console.error('Failed to fetch students:', error)
    }
  );
  
  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery(
    'dashboard-payments', 
    () => paymentsApi.getAll(),
    {
      staleTime: 5 * 60 * 1000,
      onError: (error) => console.error('Failed to fetch payments:', error)
    }
  );
  
  const { data: activitiesResponse, isLoading: activitiesLoading } = useQuery(
    'dashboard-activities', 
    () => activitiesApi.getAll(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
      onError: (error) => console.error('Failed to fetch activities:', error)
    }
  );

  const { data: overdueInvoicesResponse } = useQuery(
    'overdue-invoices',
    () => invoicesApi.getOverdue(),
    {
      staleTime: 5 * 60 * 1000,
      onError: (error) => console.error('Failed to fetch overdue invoices:', error)
    }
  );

  // Extract data from API responses
  const students = studentsResponse?.data?.data || studentsResponse?.data || [];
  const payments = paymentsResponse?.data?.data || paymentsResponse?.data || [];
  const activities = activitiesResponse?.data?.data || activitiesResponse?.data || [];
  const overdueInvoices = overdueInvoicesResponse?.data?.data || [];

  // Calculate this month's revenue
  const thisMonth = new Date();
  const monthlyRevenue = payments
    .filter((payment: any) => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate.getMonth() === thisMonth.getMonth() && 
             paymentDate.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((sum: number, payment: any) => sum + (payment.paidAmount || 0), 0);

  const totalRevenue = payments.reduce((sum: number, payment: any) => sum + (payment.paidAmount || 0), 0);

  const stats = [
    {
      title: 'Total Students',
      value: studentsLoading ? 'Loading...' : students.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Revenue',
      value: paymentsLoading ? 'Loading...' : `৳${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Monthly Revenue',
      value: paymentsLoading ? 'Loading...' : `৳${monthlyRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Overdue Invoices',
      value: overdueInvoices.length.toString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to Break The Fear Fee Management System</p>
      </div>

      {/* Error Handling */}
      {(studentsError as any) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">Failed to load dashboard data. Please refresh the page.</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link href="/student-management" className="block p-3 rounded-lg border border-gray-200 dark:text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary-500" />
                <span className="font-medium">Add New Student</span>
              </div>
            </Link>
            <Link href="/fee-payment" className="block p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-green-500" />
                <span className="font-medium">Process Payment</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card p-6">
          <RecentActivities activities={activities.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}