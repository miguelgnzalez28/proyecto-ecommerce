import React, { createContext, useContext } from 'react';

const RadioGroupContext = createContext(null);

export function RadioGroup({ value, onValueChange, children, className = '' }) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={className} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ value, id, className = '' }) {
  const { value: selectedValue, onValueChange } = useContext(RadioGroupContext) || {};
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onValueChange?.(value)}
      className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 ${
        isSelected
          ? 'border-neutral-900 bg-neutral-900'
          : 'border-neutral-300 bg-white'
      } ${className}`}
    >
      {isSelected && (
        <div className="h-2 w-2 rounded-full bg-white" />
      )}
    </button>
  );
}
