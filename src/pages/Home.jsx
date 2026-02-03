import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/shop/HeroSection";
import CategoryGrid from "@/components/shop/CategoryGrid";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import Footer from "@/components/shop/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
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
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => base44.entities.CartItem.filter({ session_id: sessionId }),
  });

  const addToCart = async (product) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      await base44.entities.CartItem.update(existingItem.id, {
        quantity: existingItem.quantity + 1
      });
    } else {
      await base44.entities.CartItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        product_price: product.price,
        quantity: 1,
        session_id: sessionId
      });
    }
    refetchCart();
    setIsCartOpen(true);
  };

  const updateCartQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await base44.entities.CartItem.delete(itemId);
    } else {
      await base44.entities.CartItem.update(itemId, { quantity });
    }
    refetchCart();
  };

  const removeFromCart = async (itemId) => {
    await base44.entities.CartItem.delete(itemId);
    refetchCart();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl("Home")} className="text-2xl font-bold tracking-tight text-neutral-900">
              <span className="text-red-600">AUTO</span>PARTS
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl("Shop")} className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                Shop
              </Link>
              <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                Parts Catalog
              </a>
              <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                Services
              </a>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-2 text-sm text-neutral-600">
                  <span>Hi, {user.name}</span>
                </div>
              )}
              <Link to={createPageUrl("Admin")} className="hidden md:flex w-10 h-10 rounded-full hover:bg-neutral-100 items-center justify-center transition-colors">
                <User className="w-5 h-5 text-neutral-600" />
              </Link>
              <button
                onClick={logout}
                className="hidden md:flex w-10 h-10 rounded-full hover:bg-neutral-100 items-center justify-center transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-neutral-600" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-neutral-600" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="md:hidden border-t border-neutral-100 bg-white"
            >
              <div className="container mx-auto px-6 py-6 space-y-4">
                {user && (
                  <div className="pb-2 border-b border-neutral-200">
                    <p className="text-sm text-neutral-600">Signed in as</p>
                    <p className="text-lg font-medium text-neutral-900">{user.name}</p>
                  </div>
                )}
                <Link to={createPageUrl("Shop")} className="block text-lg font-medium text-neutral-900">Shop</Link>
                <a href="#" className="block text-lg font-medium text-neutral-900">Parts Catalog</a>
                <a href="#" className="block text-lg font-medium text-neutral-900">Services</a>
                <Link to={createPageUrl("Admin")} className="block text-lg font-medium text-neutral-900">Admin</Link>
                <button
                  onClick={logout}
                  className="block text-lg font-medium text-red-600 w-full text-left"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      <main className="pt-20">
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts products={products} onAddToCart={addToCart} />
      </main>
      
      <Footer />
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
