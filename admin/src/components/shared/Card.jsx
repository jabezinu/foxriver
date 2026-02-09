import React from 'react';

export default function Card({ children, title, extra, className = '', noPadding = false }) {
    return (
        <div className={`bg-zinc-900/50 backdrop-blur-md rounded-2xl shadow-xl shadow-black/20 border border-zinc-800 overflow-hidden ${className}`}>
            {(title || extra) && (
                <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
                    {title && <h3 className="font-bold text-white tracking-tight">{title}</h3>}
                    {extra}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
}
