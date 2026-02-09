import React from 'react';

const variants = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    gray: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

const sizes = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-0.5 text-[10px]',
    lg: 'px-3 py-1 text-xs'
};

export default function Badge({ children, variant = 'indigo', size = 'md', className = '' }) {
    return (
        <span className={`inline-flex items-center rounded-full font-bold uppercase border ${variants[variant] || variants.indigo} ${sizes[size] || sizes.md} ${className}`}>
            {children}
        </span>
    );
}
