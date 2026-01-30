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
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    className={twMerge(
                        clsx(
                            "block w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-700 focus:ring-1 focus:ring-blue-700 sm:text-sm py-2 transition-colors placeholder:text-gray-400",
                            Icon && "pl-10",
                            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
                            className
                        )
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
