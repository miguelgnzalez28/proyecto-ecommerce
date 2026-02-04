import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className={`relative w-full overflow-auto ${className}`}>
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className = '' }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`border-b border-neutral-200 transition-colors hover:bg-neutral-50 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-neutral-500 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`p-4 align-middle ${className}`}>
      {children}
    </td>
  );
}
