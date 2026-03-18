import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordStrength from '../components/auth/PasswordStrength';
import api from '../services/api';

const ResetPassword = () => {
    const location = useLocation();
    
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tokenParam = query.get('token');
        if (!tokenParam) {
            setError('Missing password reset token. Please request a new link.');
        } else {
            setToken(tokenParam);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!token) {
            setError('Missing token');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword
            });
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may be expired or invalid.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout 
                title="Password successfully reset" 
                description="Your password has been changed successfully. You can now sign in with your new password."
            >
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="pt-4">
                        <Link to="/login">
                            <Button className="w-full">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            title="Reset Password" 
            description="Choose a new, secure password for your account."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                
                <div className="relative">
                    <Input
                        label="New Password"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        icon={<Lock className="w-5 h-5" />}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <PasswordStrength password={newPassword} />
                </div>

                <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <Button type="submit" isLoading={isLoading} disabled={!token} className="mt-6">
                    Reset Password
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;
