import React from 'react';

export const Input = ({
    label,
    icon,
    error,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-bold text-zinc-400 mb-1.5 ml-1 uppercase tracking-wider text-[10px]">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    className={`
            w-full px-4 py-3.5 rounded-xl border-2 bg-zinc-900
            placeholder-zinc-600 text-white
            transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-violet-500/10
            disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800
            ${icon ? 'pl-11' : ''}
            ${error
                            ? 'border-red-900/50 focus:border-red-500 focus:ring-red-900/10'
                            : 'border-zinc-800 focus:border-violet-400 focus:ring-violet-500/10'
                        }
            ${className}
          `}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        {icon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-400 ml-1 animate-slide-down font-medium">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
