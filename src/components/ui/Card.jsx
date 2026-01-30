import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({
    children,
    className,
    noPadding = false,
    title,
    action,
    ...props
}) => {
    return (
        <div
            className={twMerge(
                clsx(
                    "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
                    className
                )
            )}
            {...props}
        >
            {(title || action) && (
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={clsx(!noPadding && "p-6")}>
                {children}
            </div>
        </div>
    );
};

export default Card;
