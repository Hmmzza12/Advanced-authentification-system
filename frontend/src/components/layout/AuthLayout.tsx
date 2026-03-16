import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, description }) => {
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full relative z-10 glass-panel p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center shadow-inner">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>
                
                {children}

            </div>
            
            {/* Dark mode switch handled at App level, here we just show the form */}
        </div>
    );
};

export default AuthLayout;
