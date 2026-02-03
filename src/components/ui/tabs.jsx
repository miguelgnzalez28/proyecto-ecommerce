import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className = '' }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-lg bg-neutral-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  const { value: selectedValue, setValue } = useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      onClick={() => setValue(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-white text-neutral-900 shadow-sm'
          : 'text-neutral-600 hover:text-neutral-900'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { value: selectedValue } = useContext(TabsContext);
  
  if (selectedValue !== value) return null;

  return <div className={className}>{children}</div>;
}
