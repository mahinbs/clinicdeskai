import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, title, className, padding = "p-6", noPadding = false, actions }) => {
    return (
        <div className={twMerge(
            clsx(
                'bg-white rounded-xl border border-gray-200 shadow-sm',
                className
            )
        )}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-900">
                        {title}
                    </h3>
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
            )}
            <div className={noPadding ? '' : padding}>
                {children}
            </div>
        </div>
    );
};

export default Card;
