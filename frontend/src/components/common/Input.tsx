import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className = '', ...props }, ref) => {
    return (
        <div className="w-full flex flex-col mb-4 relative">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="relative flex items-center">
                {icon && (
                    <div className="absolute left-3 text-gray-400 dark:text-gray-500">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`input-field ${icon ? 'pl-10' : 'pl-4'} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">
                    {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
