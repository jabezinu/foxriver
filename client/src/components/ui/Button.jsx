import React from 'react';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    loading = false,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900';

    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-black shadow-glow hover:shadow-glow-strong hover:from-primary-400 hover:to-primary-500 focus:ring-primary-500',
        secondary: 'bg-zinc-800 text-white shadow-md border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 focus:ring-zinc-600',
        outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 focus:ring-primary-500',
        ghost: 'text-zinc-400 hover:bg-zinc-800 hover:text-white focus:ring-zinc-700',
        danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/30 focus:ring-red-600',
    };

    const sizes = {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-5 py-3',
        lg: 'text-base px-6 py-4',
    };

    return (
        <button
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-inherit" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </>
            ) : children}
        </button>
    );
};

export default Button;
