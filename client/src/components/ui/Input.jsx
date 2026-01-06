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
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    className={`
            w-full px-4 py-3 rounded-xl border-2 bg-white
            placeholder-gray-400 text-gray-900
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500
            ${icon ? 'pl-11' : ''}
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-100 focus:border-primary-500 focus:ring-primary-100'
                        }
            ${className}
          `}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 ml-1 animate-slide-down">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
