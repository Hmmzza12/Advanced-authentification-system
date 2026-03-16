import React from 'react';

interface PasswordStrengthProps {
    password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let strengthLabel = 'Very Weak';
    let colorClass = 'bg-red-500';

    if (score >= 4) {
        strengthLabel = 'Strong';
        colorClass = 'bg-green-500';
    } else if (score >= 3) {
        strengthLabel = 'Good';
        colorClass = 'bg-yellow-400';
    } else if (score >= 2) {
        strengthLabel = 'Fair';
        colorClass = 'bg-orange-400';
    }

    return (
        <div className="w-full mt-2 mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Password strength:</span>
                <span className={`text-xs font-semibold ${colorClass.replace('bg-', 'text-')}`}>
                    {password.length === 0 ? 'None' : strengthLabel}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 flex overflow-hidden">
                <div 
                    className={`${colorClass} h-1.5 transition-all duration-300`} 
                    style={{ width: `${password.length === 0 ? 0 : Math.max(20, (score / 5) * 100)}%` }}
                ></div>
            </div>
        </div>
    );
};

export default PasswordStrength;
