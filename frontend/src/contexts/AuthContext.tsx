import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { User, AuthResponse } from '../types/auth.types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => {},
    logout: () => {},
    setUser: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/profile');
                    // Explicitly map fields so is2faEnabled is included
                    setUser({
                        id: res.data.id,
                        username: res.data.username,
                        email: res.data.email,
                        is2faEnabled: res.data.is2faEnabled ?? false,
                    });
                } catch (error) {
                    console.error('Failed to load user profile', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    const login = (data: AuthResponse) => {
        if (!data.requires2fa) {
             localStorage.setItem('token', data.token);
             localStorage.setItem('refreshToken', data.refreshToken);
             setUser({
                 id: data.id,
                 username: data.username,
                 email: data.email,
                 is2faEnabled: data.is2faEnabled,
             });
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
