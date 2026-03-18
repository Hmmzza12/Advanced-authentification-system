import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [statusText, setStatusText] = useState("Processing, taking you to your account...");
    const [errorText, setErrorText] = useState<string | null>(null);

    // Effect to navigate once authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Prevent running multiple times
        if (errorText || isAuthenticated) return;

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const error = params.get('error');

        if (error) {
            setErrorText(`OAuth Login Error: ${error}`);
            setTimeout(() => navigate(`/login?error=${encodeURIComponent(error)}`), 3000);
            return;
        }

        if (token && refreshToken) {
            // 1. Store tokens in localStorage so api.ts interceptor picks them up
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);

            // 2. Fetch the real user profile from backend
            api.get('/auth/profile')
                .then((res) => {
                    // Use the centralized login method
                    login({
                        token,
                        type: "Bearer",
                        refreshToken,
                        id: res.data.id,
                        username: res.data.username,
                        email: res.data.email,
                        is2faEnabled: res.data.is2faEnabled ?? false,
                        requires2fa: false
                    });
                })
                .catch((err) => {
                    console.error("Profile fetch failed:", err);
                    setErrorText(`Failed to retrieve profile: ${err.message || "Unknown API Error"}`);
                });
        } else {
            setErrorText("Authentication tokens missing from the URL.");
        }
    }, [location, login, isAuthenticated, errorText, navigate]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
            <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                {errorText ? (
                    <div className="text-red-500 text-center">
                        <p>{errorText}</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                            Return to Login
                        </button>
                    </div>
                ) : (
                    statusText
                )}
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;

