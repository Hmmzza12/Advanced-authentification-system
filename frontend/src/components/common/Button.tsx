import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
    children, 
    isLoading = false, 
    variant = 'primary', 
    fullWidth = true, 
    className = '',
    disabled,
    ...props 
}) => {
    
    let baseStyle = "font-medium rounded-lg transition-all duration-200 flex justify-center items-center py-2 px-4 shadow-sm ";
    
    if (variant === 'primary') {
        baseStyle += "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:opacity-70 dark:bg-primary-500 dark:hover:bg-primary-600 ";
    } else if (variant === 'secondary') {
        baseStyle += "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 dark:bg-dark-border dark:text-gray-100 dark:hover:bg-gray-700 ";
    } else if (variant === 'danger') {
        baseStyle += "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 ";
    }

    if (fullWidth) baseStyle += "w-full ";
    
    const isDisabled = isLoading || disabled;

    return (
        <button 
            className={`${baseStyle} ${className} ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
            disabled={isDisabled}
            {...props}
        >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {children}
        </button>
    );
};

export default Button;
