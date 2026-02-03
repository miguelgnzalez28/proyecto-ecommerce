import React from 'react';

const variants = {
  default: 'bg-neutral-900 text-white hover:bg-neutral-800',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
  outline: 'border border-neutral-200',
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
