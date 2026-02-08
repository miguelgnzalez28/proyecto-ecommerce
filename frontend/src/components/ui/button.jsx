import React from 'react';

const variants = {
  default: 'bg-neutral-900 text-white hover:bg-neutral-800',
  ghost: 'hover:bg-neutral-100',
  outline: 'border border-neutral-200 hover:bg-neutral-50',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  asChild,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50';
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { className: classes, ...props });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
