import { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordStrength from './PasswordStrength';
import api from '../../services/api';

const SignupForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // clear errors on type
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email address';
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!formData.terms) errors.terms = 'You must accept the terms and conditions';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!validate()) return;
        
        setIsLoading(true);
        try {
            await api.post('/auth/signup', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            navigate('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            <Input
                label="Username"
                name="username"
                type="text"
                placeholder="johndoe"
                icon={<UserIcon className="w-5 h-5" />}
                value={formData.username}
                onChange={handleChange}
                error={validationErrors.username}
            />
            <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@example.com"
                icon={<Mail className="w-5 h-5" />}
                value={formData.email}
                onChange={handleChange}
                error={validationErrors.email}
            />
            <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={handleChange}
                error={validationErrors.password}
            />
            
            <PasswordStrength password={formData.password} />

            <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={validationErrors.confirmPassword}
            />

            <div className="flex items-center mt-2">
                <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    I agree to the <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">Terms</a> and <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">Privacy Policy</a>
                </label>
            </div>
            {validationErrors.terms && <span className="text-red-500 text-xs">{validationErrors.terms}</span>}

            <Button type="submit" isLoading={isLoading} className="mt-6">
                Create Account
            </Button>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
                    Sign in
                </Link>
            </p>
        </form>
    );
};

export default SignupForm;
