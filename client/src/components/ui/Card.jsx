import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`
        bg-zinc-800/40 backdrop-blur-md rounded-2xl p-5 border border-zinc-700/50
        shadow-xl text-white
        ${hover ? 'hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] cursor-pointer transition-all duration-300 hover:-translate-y-1' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
