import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/shop/ProductCard";
import CartDrawer from "@/components/shop/CartDrawer";
import Footer from "@/components/shop/Footer";
import { ShoppingBag, Menu, X, Filter, ChevronDown, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [sessionId] = useState(() => localStorage.getItem('session_id') || `session_${Date.now()}`);

  useEffect(() => {
    localStorage.setItem('session_id', sessionId);
  }, [sessionId]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => base44.entities.CartItem.filter({ session_id: sessionId }),
  });

  const filteredProducts = products
    .filter(p => category === 'all' || p.category === category)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
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

  const categories = [
    { value: 'all', label: 'All Parts' },
    { value: 'engine', label: 'Engine Parts' },
    { value: 'brakes', label: 'Brakes' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'performance', label: 'Performance' },
    { value: 'tires', label: 'Tires & Wheels' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'tools', label: 'Tools' },
    { value: 'electrical', label: 'Electrical' },
  ];

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
              <Link to={createPageUrl("Shop")} className="text-sm font-medium text-neutral-900 border-b-2 border-red-600 pb-1">
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
              <Link to={createPageUrl("Admin")} className="hidden md:flex w-10 h-10 rounded-full hover:bg-neutral-100 items-center justify-center transition-colors">
                <User className="w-5 h-5 text-neutral-600" />
              </Link>
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
                <Link to={createPageUrl("Shop")} className="block text-lg font-medium text-neutral-900">Shop</Link>
                <a href="#" className="block text-lg font-medium text-neutral-900">Parts Catalog</a>
                <a href="#" className="block text-lg font-medium text-neutral-900">Services</a>
                <Link to={createPageUrl("Admin")} className="block text-lg font-medium text-neutral-900">Admin</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-50 via-neutral-50 to-red-50 py-16">
          <div className="container mx-auto px-6 lg:px-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Shop Auto Parts
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Find everything you need to keep your vehicle running smoothly
            </p>
          </div>
        </section>

        {/* Filters and Sort */}
        <section className="border-b border-neutral-200 bg-white sticky top-20 z-40">
          <div className="container mx-auto px-6 lg:px-12 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm font-medium text-neutral-900">Filter:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        category === cat.value
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-6 lg:px-12">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <Skeleton className="w-full aspect-square" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-neutral-600">
                    Showing <span className="font-semibold text-neutral-900">{filteredProducts.length}</span> products
                    {category !== 'all' && (
                      <span> in <span className="font-semibold text-neutral-900">{categories.find(c => c.value === category)?.label}</span></span>
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-600 mb-6">
                  Try adjusting your filters or browse all products
                </p>
                <Button
                  onClick={() => setCategory('all')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  View All Products
                </Button>
              </div>
            )}
          </div>
        </section>
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
