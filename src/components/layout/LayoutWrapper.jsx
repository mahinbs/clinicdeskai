import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const LayoutWrapper = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-y-auto lg:h-full lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">ClinicDesk AI</span>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-slate-400 hover:text-primary-400 transition-colors focus:outline-none"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default LayoutWrapper;
