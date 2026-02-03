import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // No auth logic, just redirect
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                {/* Background is handled by body but we can add overlay if needed */}
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan shadow-lg shadow-primary-500/30">
                        <h1 className="text-3xl font-bold text-white tracking-tight px-2">CD</h1>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-100 tracking-tight">ClinicDesk AI</h1>
                    <p className="text-slate-400 font-medium mt-2">Sign in to your intelligent workspace</p>
                </div>

                <Card className="shadow-2xl border-white/10 backdrop-blur-xl bg-slate-900/40">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
                        </div>

                        <div className="space-y-5">
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
                            className="shadow-neon mt-2"
                        >
                            Sign In
                        </Button>

                        <div className="text-center pt-2">
                            <span className="text-sm text-slate-400">Don't have an account? </span>
                            <Link to="/signup" className="text-sm font-bold text-primary-400 hover:text-primary-300 hover:underline">
                                Create an account
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;
