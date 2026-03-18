import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import OTPInput from './OTPInput';
import SocialLoginButtons from './SocialLoginButtons';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [requires2FA, setRequires2FA] = useState(false);
    const [usernameFor2FA, setUsernameFor2FA] = useState('');
    
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
        rememberMe: false
    });

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('registered') === 'true') {
            setSuccessMsg('Registration successful! Please sign in.');
        }
        if (query.get('expired') === 'true') {
            setError('Your session has expired. Please sign in again.');
        }
    }, [location]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            const res = await api.post('/auth/login', {
                usernameOrEmail: formData.usernameOrEmail,
                password: formData.password
            });

            if (res.data.requires2fa) {
                 setRequires2FA(true);
                 setUsernameFor2FA(res.data.username);
                 setIsLoading(false);
                 return;
            }

            login(res.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSubmit = async (otp: string) => {
        setError(null);
        setIsLoading(true);
        try {
             const res = await api.post(`/2fa/authenticate?username=${usernameFor2FA}`, { code: otp });
             login(res.data);
             navigate('/dashboard');
        } catch (err: any) {
             setError(err.response?.data?.error || err.response?.data?.message || 'Invalid OTP code');
        } finally {
             setIsLoading(false);
        }
    };

    if (requires2FA) {
        return (
            <div className="space-y-6">
                 <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Please enter the 6-digit code from your authenticator app.
                    </p>
                </div>
                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 shadow-none" />
                        {error}
                    </div>
                )}
                <div className="py-4">
                     <OTPInput
                         length={6}
                         onComplete={(otp) => handleOTPSubmit(otp)}
                     />
                </div>
                <Button 
                     variant="secondary" 
                     onClick={() => setRequires2FA(false)}
                     disabled={isLoading}
                >
                    Back to Login
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
            {successMsg && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                    {successMsg}
                </div>
            )}
            {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
            <Input
                label="Username or Email"
                name="usernameOrEmail"
                type="text"
                placeholder="johndoe / mail@example.com"
                icon={<Mail className="w-5 h-5" />}
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
            />
            <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={handleChange}
                required
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Remember me
                    </label>
                </div>

                <div className="text-sm">
                    <Link 
                        to="/forgot-password" 
                        className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                        Forgot password?
                    </Link>
                </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="mt-6">
                Sign In
            </Button>

            <SocialLoginButtons />

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
                    Sign up
                </Link>
            </p>
        </form>
    );
};

export default LoginForm;
