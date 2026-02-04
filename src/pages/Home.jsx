import React, { useState, useEffect } from 'react';
import { api } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/shop/HeroSection";
import CategoryGrid from "@/components/shop/CategoryGrid";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import Footer from "@/components/shop/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import Chatbot from "@/components/shop/Chatbot";
import { ShoppingBag, Menu, X, User, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionId] = useState(() => localStorage.getItem('session_id') || `session_${Date.now()}`);

  useEffect(() => {
    localStorage.setItem('session_id', sessionId);
  }, [sessionId]);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.products.list(),
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => api.cart.get(sessionId),
  });

  const addToCart = async (product, saleType = 'detal') => {
    const price = saleType === 'mayor' && product.price_wholesale 
      ? product.price_wholesale 
      : product.price;
    
    const existingItem = cartItems.find(
      item => item.product_id === product.id && item.sale_type === saleType
    );
    
    if (existingItem) {
      await api.cart.update(existingItem.id, {
        quantity: existingItem.quantity + 1
      });
    } else {
      await api.cart.add({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        product_price: price,
        quantity: 1,
        session_id: sessionId,
        sale_type: saleType
      });
    }
    refetchCart();
    setIsCartOpen(true);
  };

  const updateCartQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await api.cart.remove(itemId);
    } else {
      await api.cart.update(itemId, { quantity });
    }
    refetchCart();
  };

  const removeFromCart = async (itemId) => {
    await api.cart.remove(itemId);
    refetchCart();
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-800" data-testid="main-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2" data-testid="logo-link">
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white font-teko">A</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-teko">
                AUTO<span className="text-red-600">PARTS</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl("Shop")} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider" data-testid="nav-shop">
                Tienda
              </Link>
              <Link to={createPageUrl("Shop") + "?sale_type=detal"} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider" data-testid="nav-detal">
                Detal
              </Link>
              <Link to={createPageUrl("Shop") + "?sale_type=mayor"} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider" data-testid="nav-mayor">
                Mayor
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
                  <span>Hola, {user.name}</span>
                </div>
              )}
              <Link to={createPageUrl("Admin")} className="hidden md:flex w-10 h-10 hover:bg-zinc-800 items-center justify-center transition-colors" data-testid="nav-admin">
                <Settings className="w-5 h-5 text-zinc-400" />
              </Link>
              <button
                onClick={logout}
                className="hidden md:flex w-10 h-10 hover:bg-zinc-800 items-center justify-center transition-colors"
                title="Cerrar sesión"
                data-testid="logout-btn"
              >
                <LogOut className="w-5 h-5 text-zinc-400" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                data-testid="cart-btn"
              >
                <ShoppingBag className="w-5 h-5 text-zinc-400" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs flex items-center justify-center font-bold" data-testid="cart-count">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                data-testid="mobile-menu-btn"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-800 bg-zinc-900"
              data-testid="mobile-menu"
            >
              <div className="px-4 py-6 space-y-4">
                {user && (
                  <div className="pb-4 border-b border-zinc-800">
                    <p className="text-sm text-zinc-500">Conectado como</p>
                    <p className="text-lg font-medium text-white">{user.name}</p>
                  </div>
                )}
                <Link to={createPageUrl("Shop")} className="block text-lg font-medium text-white uppercase tracking-wider">Tienda</Link>
                <Link to={createPageUrl("Shop") + "?sale_type=detal"} className="block text-lg font-medium text-zinc-400 uppercase tracking-wider">Detal</Link>
                <Link to={createPageUrl("Shop") + "?sale_type=mayor"} className="block text-lg font-medium text-zinc-400 uppercase tracking-wider">Mayor</Link>
                <Link to={createPageUrl("Admin")} className="block text-lg font-medium text-zinc-400 uppercase tracking-wider">Admin</Link>
                <button
                  onClick={logout}
                  className="block text-lg font-medium text-red-500 w-full text-left uppercase tracking-wider"
                >
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      <main className="pt-20">
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts products={products.filter(p => p.featured)} onAddToCart={addToCart} />
      </main>
      
      <Footer />
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
      />
      
      <Chatbot />
    </div>
  );
}
