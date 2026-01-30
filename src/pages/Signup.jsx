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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">ClinicDesk AI</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Doctor Dashboard</p>
                </div>

                <Card className="shadow-sm">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-lg font-medium text-gray-900">Create Account</h2>
                            <p className="text-sm text-gray-500">Get started with your clinic</p>
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
                        >
                            Create Account
                        </Button>

                        <div className="text-center pt-2">
                            <span className="text-sm text-gray-600">Already have an account? </span>
                            <Link to="/login" className="text-sm font-medium text-blue-700 hover:text-blue-800">
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
