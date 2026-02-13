import React, { useState, useEffect } from 'react';
import { DollarSign, Download, CreditCard, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getClinicDashboardStats, getClinicRevenue } from '../utils/database';

const formatCurrency = (n) => (n != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) : '—');

const Revenue = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clinicId = profile?.clinic_id;

  useEffect(() => {
    if (!clinicId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().split('T')[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const [s, t] = await Promise.all([
          getClinicDashboardStats(clinicId, startOfMonth, today),
          getClinicRevenue(clinicId, startOfMonth, today),
        ]);
        setStats(s);
        setTransactions(t || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clinicId]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Revenue</h1>
          <p className="text-sm text-gray-500 mt-1">Financial performance overview</p>
        </div>
        <Button variant="outline" icon={Download}>Export Report</Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-teal-700 text-white border-0 shadow-lg overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
          <div className="relative z-10">
            <p className="text-teal-100 text-sm font-semibold uppercase tracking-wider">Total Revenue (Period)</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(stats?.total_earnings)}</p>
            <div className="mt-4 text-sm text-teal-100 font-medium">
              Cash: {formatCurrency(stats?.cash_earnings)} • UPI: {formatCurrency(stats?.upi_earnings)}
            </div>
          </div>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats?.completed_appointments ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">appointments</p>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{formatCurrency(stats?.pending_payments)}</p>
          <p className="text-xs text-gray-500 mt-1">payments</p>
        </Card>
      </div>

      <Card title="Recent Transactions" noPadding className="border border-gray-200 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No transactions in this period.</td>
                </tr>
              ) : (
                transactions.slice(0, 20).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{tx.invoice_number || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        {tx.payment_mode || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{formatCurrency(tx.total_amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Revenue;
