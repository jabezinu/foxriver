import React from 'react';

export default function PageHeader({ title, subtitle, extra }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
            </div>
            {extra && (
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {extra}
                </div>
            )}
        </div>
    );
}
