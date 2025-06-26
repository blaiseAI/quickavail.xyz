import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700 bg-white'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <span
      className={classes}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge }; 