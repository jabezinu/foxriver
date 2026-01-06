import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`
        bg-white rounded-2xl p-5 border border-gray-100
        shadow-soft
        ${hover ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
