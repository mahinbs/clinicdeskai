import React, { useState } from 'react';
import { DollarSign, Download, CreditCard, Calendar } from 'lucide-react';
import { revenueData } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Revenue = () => {
    const [dateRange, setDateRange] = useState('This Month');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Revenue</h1>
                    <p className="text-sm text-gray-500 mt-1">Financial performance overview</p>
                </div>
                <Button variant="outline" icon={Download}>Export Report</Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-900 text-white border-transparent">
                    <p className="text-gray-400 text-sm font-medium">Total Revenue (Today)</p>
                    <p className="text-3xl font-bold mt-2">$1,450.00</p>
                    <div className="mt-4 flex items-center text-sm text-green-400">
                        <span>+5% from yesterday</span>
                    </div>
                </Card>
                <Card>
                    <p className="text-gray-500 text-sm font-medium">This Week</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">$8,240.00</p>
                </Card>
                <Card>
                    <p className="text-gray-500 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">$34,500.00</p>
                </Card>
            </div>

            {/* Transactions List */}
            <Card title="Recent Transactions" noPadding>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {revenueData.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            {transaction.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {transaction.patient}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                                            {transaction.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                        {transaction.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Revenue;
