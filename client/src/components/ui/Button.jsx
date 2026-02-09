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
        primary: 'bg-gradient-to-r from-violet-400 to-violet-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:from-violet-300 hover:to-violet-500 focus:ring-violet-500 uppercase tracking-wider',
        secondary: 'bg-zinc-800 text-white shadow-lg border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 focus:ring-zinc-600 uppercase tracking-widest',
        outline: 'border-2 border-violet-400 text-violet-400 hover:bg-violet-500/10 focus:ring-violet-500 uppercase tracking-widest',
        ghost: 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white focus:ring-zinc-700',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-red-500/40 focus:ring-red-600 uppercase tracking-wider',
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
