import React from 'react';

export default function Card({ children, title, extra, className = '', noPadding = false }) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
            {(title || extra) && (
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                    {title && <h3 className="font-bold text-gray-800 tracking-tight">{title}</h3>}
                    {extra}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
}
