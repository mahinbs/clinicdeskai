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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">ClinicDesk AI</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Doctor Dashboard</p>
                </div>

                <Card className="shadow-sm">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-lg font-medium text-gray-900">Welcome Back</h2>
                            <p className="text-sm text-gray-500">Sign in to your account</p>
                        </div>

                        <div className="space-y-4">
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
                        >
                            Sign In
                        </Button>

                        <div className="text-center pt-2">
                            <span className="text-sm text-gray-600">Don't have an account? </span>
                            <Link to="/signup" className="text-sm font-medium text-blue-700 hover:text-blue-800">
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
