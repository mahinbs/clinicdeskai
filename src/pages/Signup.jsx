import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Signup = () => {
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan shadow-lg shadow-primary-500/30">
                        <h1 className="text-3xl font-bold text-white tracking-tight px-2">CD</h1>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-100 tracking-tight">ClinicDesk AI</h1>
                    <p className="text-slate-400 font-medium mt-2">Join the future of practice management</p>
                </div>

                <Card className="shadow-2xl border-white/10 backdrop-blur-xl bg-slate-900/40">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-100">Create Account</h2>
                        </div>

                        <div className="space-y-4">
                            <Input
                                id="name"
                                label="Full Name"
                                placeholder="Dr. Jane Doe"
                                icon={User}
                            />
                            <Input
                                id="clinic"
                                label="Clinic Name"
                                placeholder="City Health Clinic"
                                icon={Building}
                            />
                            <Input
                                id="email"
                                label="Email Address"
                                type="email"
                                placeholder="doctor@clinic.com"
                                icon={Mail}
                            />
                            <Input
                                id="password"
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={Lock}
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            icon={ArrowRight}
                            className="shadow-neon mt-4"
                        >
                            Create Account
                        </Button>

                        <div className="text-center pt-2">
                            <span className="text-sm text-slate-400">Already have an account? </span>
                            <Link to="/login" className="text-sm font-bold text-primary-400 hover:text-primary-300 hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Signup;
