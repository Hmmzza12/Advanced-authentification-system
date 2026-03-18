import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout 
                title="Check your email" 
                description="We've sent a password reset link to your email address."
            >
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        If an account exists for <span className="font-semibold text-gray-900 dark:text-white">{email}</span>, 
                        you will receive an email with instructions shortly.
                    </p>
                    <div className="pt-4">
                        <Link to="/login">
                            <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            title="Forgot Password" 
            description="Enter your email address and we'll send you a link to reset your password."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="mail@example.com"
                    icon={<Mail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Button type="submit" isLoading={isLoading} className="mt-6">
                    Send Reset Link
                </Button>

                <div className="text-center mt-4">
                    <Link 
                        to="/login" 
                        className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;
