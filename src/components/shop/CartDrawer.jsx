import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose, items = [], onUpdateQuantity, onRemove }) {
  const subtotal = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-zinc-900 border-l border-zinc-800 p-0" data-testid="cart-drawer">
        <SheetHeader className="px-6 py-4 border-b border-zinc-800">
          <SheetTitle className="text-white font-teko text-2xl uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-600" />
            Tu Carrito ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-200px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-center mb-6">Tu carrito está vacío</p>
              <Link to={createPageUrl('Shop')} onClick={onClose}>
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-none uppercase tracking-wider font-bold">
                  Ir a la Tienda
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 bg-zinc-800 border border-zinc-700"
                      data-testid={`cart-item-${item.id}`}
                    >
                      <div className="w-20 h-20 flex-shrink-0 bg-zinc-900">
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1689204778500-329b194714f8?w=200'}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-white text-sm line-clamp-1">{item.product_name}</h4>
                            {item.sale_type && (
                              <span className="text-xs text-zinc-500 uppercase">
                                {item.sale_type === 'mayor' ? 'Mayorista' : 'Detal'}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="text-zinc-500 hover:text-red-500 transition-colors"
                            data-testid={`remove-item-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-red-500 font-bold mt-1">${item.product_price?.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-700 hover:border-red-600 transition-colors"
                            data-testid={`decrease-qty-${item.id}`}
                          >
                            <Minus className="w-3 h-3 text-white" />
                          </button>
                          <span className="w-8 text-center text-white font-bold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-700 hover:border-red-600 transition-colors"
                            data-testid={`increase-qty-${item.id}`}
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t border-zinc-800 p-6 space-y-4 bg-zinc-950">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-2xl font-bold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <Link to={createPageUrl('Checkout')} onClick={onClose} className="block">
                  <Button className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-none uppercase tracking-wider font-bold text-base" data-testid="checkout-btn">
                    Proceder al Pago
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
