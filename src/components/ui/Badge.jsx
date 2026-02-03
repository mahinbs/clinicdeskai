import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Badge = ({
    children,
    className,
    variant = 'neutral',
    size = 'md',
    showDot = false,
    ...props
}) => {
    const variants = {
        primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
        success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        neutral: 'bg-slate-700/50 text-slate-300 border-slate-600',
    };

    const dotColors = {
        neutral: 'bg-slate-400',
        primary: 'bg-primary-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    // Fallback for mapped variants from old code
    const getStrictVariant = (v) => {
        if (['active'].includes(v)) return 'primary';
        if (['inactive'].includes(v)) return 'neutral';
        return v;
    };

    const resolvedKey = variants[variant] ? variant : getStrictVariant(variant);
    const resolvedClass = variants[resolvedKey] || variants.neutral;
    const resolvedDotColor = dotColors[resolvedKey] || dotColors.neutral;

    return (
        <span
            className={twMerge(
                clsx(
                    "inline-flex items-center font-medium rounded-full shadow-sm",
                    resolvedClass,
                    sizes[size],
                    className
                )
            )}
            {...props}
        >
            {showDot && (
                <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", resolvedDotColor)} />
            )}
            {children}
        </span>
    );
};

export default Badge;
