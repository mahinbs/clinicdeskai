import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Stethoscope, Activity, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { currentUser } from '../data/mockData';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('doctor');

    const handleLogin = (e) => {
        e.preventDefault();
        currentUser.role = role;

        switch (role) {
            case 'master': navigate('/master'); break;
            case 'clinic_admin': navigate('/clinic'); break;
            case 'receptionist': navigate('/reception'); break;
            case 'doctor': navigate('/doctor'); break;
            default: navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Brand & Visuals */}
            <div className="hidden lg:flex lg:w-1/2 bg-teal-700 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white/30"></div>
                    <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">ClinicDesk AI</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">Streamline Your Medical Practice Today.</h2>
                    <p className="text-teal-100 text-lg leading-relaxed mb-8">
                        Experience the next generation of clinic management.
                        AI-driven workflows, smart reception, and seamless doctor-patient interactions.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                            <ShieldCheck className="w-6 h-6 mb-3 text-teal-200" />
                            <h3 className="font-semibold">Secure & HIPAA Compliant</h3>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                            <Stethoscope className="w-6 h-6 mb-3 text-teal-200" />
                            <h3 className="font-semibold">Smart Doctor Tools</h3>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-teal-200">
                    © 2026 ClinicDesk AI. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 mt-2">Please select your role and sign in to continue.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Elegant Role Selector */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Select Portal Access</label>
                            <div className="grid sm:grid-cols-3 gap-3 pt-2">
                                {['clinic_admin', 'doctor', 'receptionist'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`
                                            px-4 py-3 cursor-pointer text-sm font-medium rounded-xl border transition-all duration-200
                                            ${role === r
                                                ? 'bg-teal-50 border-teal-600 text-teal-700 shadow-sm ring-1 ring-teal-600'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                        `}
                                    >
                                        {r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@clinic.com"
                                    icon={Mail}
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">Forgot password?</a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    icon={Lock}
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            className="h-12 text-base font-semibold shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all transform active:scale-[0.98]"
                            icon={ArrowRight}
                        >
                            Sign In to Portal
                        </Button>
                    </form>

                    <div className="pt-6 text-center border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            New to ClinicDesk? <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
