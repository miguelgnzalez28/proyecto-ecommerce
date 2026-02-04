import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Sheet({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange?.(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <div className="fixed inset-0 z-50 pointer-events-none">
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && child.type === SheetContent) {
                return React.cloneElement(child, { onClose: () => onOpenChange?.(false) });
              }
              return child;
            })}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SheetContent({ children, className = '', onClose, side = 'right' }) {
  const sideClasses = {
    right: 'right-0 top-0 bottom-0',
    left: 'left-0 top-0 bottom-0',
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
  };

  const animationVariants = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  };

  const variants = animationVariants[side];

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={`fixed ${sideClasses[side]} bg-white shadow-2xl pointer-events-auto ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

export function SheetHeader({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SheetTitle({ children, className = '' }) {
  return (
    <h2 className={`text-lg font-semibold text-neutral-900 ${className}`}>
      {children}
    </h2>
  );
}

export function SheetFooter({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
