import React from 'react';

const variants = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-gray-50 text-gray-500 border-gray-100',
};

export default function Badge({ children, variant = 'indigo', className = '' }) {
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${variants[variant] || variants.indigo} ${className}`}>
            {children}
        </span>
    );
}
