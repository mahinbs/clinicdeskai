import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = ({
    label,
    error,
    icon: Icon,
    className,
    id,
    type = 'text',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                        <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500" />
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    className={twMerge(
                        clsx(
                            'block w-full py-3 px-3 rounded-xl border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500',
                            'focus:border-teal-500 focus:ring-teal-500/20 focus:ring-4 focus:outline-none focus:bg-white transition-all duration-300',
                            Icon && 'pl-10',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 animate-shake',
                            props.disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
                            className
                        )
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-500 animate-pulse">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
