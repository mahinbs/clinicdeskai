import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    disabled = false,
    icon: Icon,
    type = 'button',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm cursor-pointer';

    const variants = {
        primary: 'bg-teal-600 text-white hover:bg-teal-700 border border-transparent shadow-sm hover:shadow-md',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        outline: 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50',
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-none',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md border border-transparent',
    };

    const sizes = {
        sm: 'px-4 py-3 text-xs',
        md: 'px-6 py-3.5 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    return (
        <button
            type={type}
            className={twMerge(
                clsx(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && Icon && <Icon className="w-4 h-4 mr-2" />}
            {children}
        </button>
    );
};

export default Button;
