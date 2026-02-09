import React, { useState } from 'react';
import { Clock, CheckCircle, Play, Users, ChevronRight } from 'lucide-react';
import { tokens as initialTokens } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const LiveQueue = () => {
    const [queue, setQueue] = useState(initialTokens);

    const updateStatus = (id, newStatus) => {
        setQueue(queue.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Live Consultation Queue</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time patient flow management</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                    </span>
                    <span className="text-sm font-medium text-teal-700">Live Updates</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Waiting List */}
                <Card title="Waiting Room" icon={Users} className="h-full border-t-4 border-t-amber-400">
                    <div className="space-y-4">
                        {queue.filter(t => t.status === 'waiting').map((token) => (
                            <div key={token.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-300 group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100">
                                        {token.id}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{token.patientName}</p>
                                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {token.time}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    icon={Play}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => updateStatus(token.id, 'with_doctor')}
                                >
                                    Call In
                                </Button>
                            </div>
                        ))}
                        {queue.filter(t => t.status === 'waiting').length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Users className="w-8 h-8 mb-2 opacity-50" />
                                <p>Waiting room is empty</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* With Doctor */}
                <div className="space-y-6">
                    <Card title="In Consultation" icon={Play} className="border-t-4 border-t-teal-500 bg-teal-50/50">
                        <div className="space-y-4">
                            {queue.filter(t => t.status === 'with_doctor').map((token) => (
                                <div key={token.id} className="p-5 rounded-xl bg-white border border-teal-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl animate-pulse">
                                                {token.id}
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{token.patientName}</p>
                                            <p className="text-xs text-teal-600 font-medium uppercase tracking-wide">With Doctor</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        icon={CheckCircle}
                                        onClick={() => updateStatus(token.id, 'completed')}
                                    >
                                        Complete
                                    </Button>
                                </div>
                            ))}
                            {queue.filter(t => t.status === 'with_doctor').length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-white/50 rounded-xl border border-dashed border-gray-200">
                                    <Play className="w-8 h-8 mb-2 opacity-50" />
                                    <p>Doctor is currently free</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recently Completed */}
                    <Card title="Recently Completed" className="opacity-80">
                        <div className="space-y-2">
                            {queue.filter(t => t.status === 'completed').slice(0, 3).map((token) => (
                                <div key={token.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs mr-3">
                                            {token.id}
                                        </div>
                                        <span className="font-medium text-gray-700">{token.patientName}</span>
                                    </div>
                                    <Badge variant="success" size="sm" showDot>Done</Badge>
                                </div>
                            ))}
                            {queue.filter(t => t.status === 'completed').length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-2">No completed sessions yet.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LiveQueue;
