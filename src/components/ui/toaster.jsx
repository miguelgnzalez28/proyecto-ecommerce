import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Global toast state management
let toastListeners = [];
let toasts = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function toast(message, type = 'info', duration = 3000) {
  const id = Date.now() + Math.random();
  const newToast = { id, message, type };
  
  toasts = [...toasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    }, duration);
  }

  return id;
}

export function useToast() {
  return { toast };
}

export function Toaster() {
  const [toastList, setToastList] = useState([]);

  useEffect(() => {
    const listener = (newToasts) => {
      setToastList(newToasts);
    };
    
    toastListeners.push(listener);
    setToastList([...toasts]);

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toastList.map((toastItem) => (
          <Toast key={toastItem.id} toast={toastItem} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast: toastItem, onRemove }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`min-w-[300px] max-w-md p-4 rounded-lg border shadow-lg pointer-events-auto ${bgColors[toastItem.type] || bgColors.info}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[toastItem.type] || icons.info}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900">{toastItem.message}</p>
        </div>
        <button
          onClick={() => onRemove(toastItem.id)}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
