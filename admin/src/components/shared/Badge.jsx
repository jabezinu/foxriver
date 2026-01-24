import React from 'react';

const variants = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-gray-50 text-gray-500 border-gray-100',
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
