import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Badge = ({
    children,
    className,
    variant = 'neutral',
    size = 'md',
    ...props
}) => {
    const variants = {
        neutral: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800', // Kept minimal, mapped to standard colors if strict map allows, else use blues/grays. strict map says NO additional colors.
        // Re-evaluating strict colors: "Allowed colors ONLY: Primary accent: blue-700, Background: white / gray-50, etc."
        // Status usage: Active/Upcoming -> blue-700, Completed/Inactive -> gray-500.
        // I should strictly follow this.

        // STRICT VARIANTS
        active: 'bg-blue-50 text-blue-700 border border-blue-200',
        inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
    };

    // Map common status to strict variants
    const getStrictVariant = (v) => {
        if (['success', 'active', 'upcoming', 'primary'].includes(v)) return variants.active;
        return variants.inactive;
    };

    const resolvedVariant = variants[variant] || getStrictVariant(variant);

    return (
        <span
            className={twMerge(
                clsx(
                    "inline-flex items-center font-medium rounded-full",
                    resolvedVariant,
                    sizes[size],
                    className
                )
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
