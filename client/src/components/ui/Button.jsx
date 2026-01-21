import React from 'react';
import logo from '../../assets/logo.png';

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
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow hover:shadow-glow-strong hover:from-primary-400 hover:to-primary-500 focus:ring-primary-500',
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
                    <img 
                        src={logo} 
                        alt="Loading" 
                        className="w-5 h-5 object-contain animate-pulse -ml-1 mr-2"
                    />
                    Loading...
                </>
            ) : children}
        </button>
    );
};

export default Button;
