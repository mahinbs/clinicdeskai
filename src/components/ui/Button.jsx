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
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm';

    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-accent-cyan text-white hover:shadow-neon hover:brightness-110 border-0',
        secondary: 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white',
        outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10',
        ghost: 'text-slate-400 hover:bg-slate-800 hover:text-primary-400 shadow-none',
        danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30',
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
