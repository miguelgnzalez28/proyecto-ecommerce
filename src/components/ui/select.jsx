import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative" ref={ref}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            if (child.type === SelectTrigger || child.type === SelectContent) {
              return React.cloneElement(child, { isOpen, setIsOpen });
            }
          }
          return child;
        })}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = '', isOpen, setIsOpen }) {
  const { value } = useContext(SelectContext) || {};

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder = 'Select...' }) {
  const { value } = useContext(SelectContext) || {};
  return <span>{value || placeholder}</span>;
}

export function SelectContent({ children, className = '', isOpen }) {
  const { setIsOpen } = useContext(SelectContext) || {};

  if (!isOpen) return null;

  return (
    <div className={`absolute z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-md p-1 ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, { onSelect: () => setIsOpen?.(false) });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({ value: itemValue, children, onSelect }) {
  const { value, onValueChange, setIsOpen } = useContext(SelectContext) || {};
  const isSelected = value === itemValue;

  return (
    <div
      onClick={() => {
        onValueChange?.(itemValue);
        setIsOpen?.(false);
        onSelect?.();
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-neutral-100 focus:bg-neutral-100 ${
        isSelected ? 'bg-neutral-100' : ''
      }`}
    >
      {children}
    </div>
  );
}
