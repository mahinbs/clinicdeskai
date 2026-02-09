import React, { useState } from 'react';
import { DollarSign, Download, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { revenueData } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Revenue = () => {
    const [dateRange, setDateRange] = useState('This Month');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Revenue</h1>
                    <p className="text-sm text-gray-500 mt-1">Financial performance overview</p>
                </div>
                <Button variant="outline" icon={Download}>Export Report</Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-teal-700 text-white border-0 shadow-lg overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700"></div>

                    <div className="relative z-10">
                        <p className="text-teal-100 text-sm font-semibold uppercase tracking-wider">Total Revenue (Today)</p>
                        <p className="text-4xl font-bold mt-2">$1,450.00</p>
                        <div className="mt-4 flex items-center text-sm text-teal-100 font-medium">
                            <TrendingUp className="w-4 h-4 mr-1.5" />
                            <span>+5% from yesterday</span>
                        </div>
                    </div>
                </Card>

                <Card className="border border-gray-200 bg-white shadow-sm">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">This Week</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">$8,240.00</p>
                </Card>
                <Card className="border border-gray-200 bg-white shadow-sm">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">This Month</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">$34,500.00</p>
                </Card>
            </div>

            {/* Transactions List */}
            <Card title="Recent Transactions" noPadding className="border border-gray-200 shadow-sm bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {revenueData.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            {transaction.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {transaction.patient}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                                            {transaction.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                        {transaction.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div >
    );
};

export default Revenue;
