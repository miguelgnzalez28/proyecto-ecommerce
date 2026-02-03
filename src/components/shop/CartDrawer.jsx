import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove }) {
  const subtotal = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-3 text-xl font-semibold">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-auto py-6">
          <AnimatePresence>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600 mb-2">Your cart is empty</p>
                <p className="text-sm text-neutral-400">Add items to get started</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-neutral-50 rounded-2xl"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0">
                      <img
                        src={item.product_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-neutral-900 truncate">{item.product_name}</h4>
                      <p className="text-neutral-600 mt-1">${item.product_price?.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-white rounded-full px-1 py-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {items.length > 0 && (
          <SheetFooter className="border-t pt-4 flex-col gap-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link to={createPageUrl("Checkout")} className="w-full" onClick={onClose}>
              <Button className="w-full py-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-base">
                Proceed to Checkout
              </Button>
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
