import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight, Activity, ShieldCheck, Stethoscope } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Signup = () => {
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Brand & Visuals (Identical to Login) */}
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
                    <h2 className="text-4xl font-bold mb-6 leading-tight">Join the Future of Healthcare.</h2>
                    <p className="text-teal-100 text-lg leading-relaxed mb-8">
                        Create your account to access AI-driven clinic management tools, streamlined patient workflows, and more.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                            <ShieldCheck className="w-6 h-6 mb-3 text-teal-200" />
                            <h3 className="font-semibold">Enterprise Security</h3>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                            <Stethoscope className="w-6 h-6 mb-3 text-teal-200" />
                            <h3 className="font-semibold">For Modern Clinics</h3>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-teal-200">
                    © 2026 ClinicDesk AI. All rights reserved.
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 mt-2">Enter your details to register your clinic.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Dr. Jane Doe"
                                    icon={User}
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Clinic Name</label>
                                <Input
                                    id="clinic"
                                    type="text"
                                    placeholder="City Health Clinic"
                                    icon={Building}
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                />
                            </div>

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
                                <label className="text-sm font-medium text-gray-700">Password</label>
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
                            Create Account
                        </Button>
                    </form>

                    <div className="pt-6 text-center border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Already have an account? <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
