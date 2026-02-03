import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, title, className, padding = "p-6", noPadding = false, actions }) => {
    return (
        <div className={twMerge(
            clsx(
                'glass-card rounded-2xl relative overflow-hidden',
                className
            )
        )}>
            {title && (
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-heading font-semibold text-lg text-slate-100 tracking-wide text-gradient">
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
