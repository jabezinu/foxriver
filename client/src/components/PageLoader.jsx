import React from 'react';
import logo from '../assets/logo.png';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-zinc-950 w-full h-full absolute inset-0 z-50">
    <img 
      src={logo} 
      alt="Loading" 
      className="w-24 h-24 object-contain animate-pulse"
    />
  </div>
);

export default PageLoader;
