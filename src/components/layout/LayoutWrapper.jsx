import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, ChevronRight } from 'lucide-react';

const LayoutWrapper = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-y-auto lg:h-full lg:block shadow-2xl lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-30 transition-all">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/30">
                            C
                        </div>
                        <span className="font-bold text-lg text-gray-900 tracking-tight">ClinicDesk <span className="text-teal-600">AI</span></span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2.5 -mr-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8 scroll-smooth w-full max-w-[1600px] mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default LayoutWrapper;
