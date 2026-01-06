import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`
        bg-zinc-900/95 backdrop-blur-sm rounded-2xl p-5 border border-zinc-800/80
        shadow-card text-white
        ${hover ? 'hover:border-primary-500/30 hover:shadow-glow cursor-pointer transition-all duration-300 hover:-translate-y-1' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
