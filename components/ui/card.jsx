import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-200 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-6 py-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      className={`text-xl font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-6 pb-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent }; 