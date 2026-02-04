import React, { useState, useEffect } from 'react';
import { api } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/shop/ProductCard';
import CartDrawer from '@/components/shop/CartDrawer';
import Footer from '@/components/shop/Footer';
import Chatbot from '@/components/shop/Chatbot';
import { ShoppingBag, Menu, X, Filter, Settings, LogOut } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/AuthContext';

export default function Shop() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSaleType = searchParams.get('sale_type') || 'all';

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [saleType, setSaleType] = useState(initialSaleType);
  const [sortBy, setSortBy] = useState('newest');
  const [sessionId] = useState(() => localStorage.getItem('session_id') || `session_${Date.now()}`);

  useEffect(() => {
    localStorage.setItem('session_id', sessionId);
  }, [sessionId]);

  useEffect(() => {
    setCategory(searchParams.get('category') || 'all');
    setSaleType(searchParams.get('sale_type') || 'all');
  }, [searchParams]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.products.list(),
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => api.cart.get(sessionId),
  });

  const filteredProducts = products
    .filter((p) => category === 'all' || p.category === category)
    .filter((p) => {
      if (saleType === 'all') return true;
      return p.sale_type === saleType || p.sale_type === 'both';
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const addToCart = async (product, type = 'detal') => {
    const price = type === 'mayor' && product.price_wholesale ? product.price_wholesale : product.price;

    const existingItem = cartItems.find(
      (item) => item.product_id === product.id && item.sale_type === type
    );

    if (existingItem) {
      await api.cart.update(existingItem.id, { quantity: existingItem.quantity + 1 });
    } else {
      await api.cart.add({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        product_price: price,
        quantity: 1,
        session_id: sessionId,
        sale_type: type,
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

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'engine', label: 'Motor' },
    { value: 'brakes', label: 'Frenos' },
    { value: 'suspension', label: 'Suspensión' },
    { value: 'electrical', label: 'Eléctrico' },
    { value: 'tires', label: 'Neumáticos' },
    { value: 'tools', label: 'Herramientas' },
  ];

  const saleTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'detal', label: 'Detal' },
    { value: 'mayor', label: 'Mayor' },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="shop-page">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white font-teko">A</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-teko">
                AUTO<span className="text-red-600">PARTS</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to={createPageUrl('Shop')}
                className="text-sm font-medium text-white uppercase tracking-wider border-b-2 border-red-600 pb-1"
              >
                Tienda
              </Link>
              <Link
                to={createPageUrl('Shop') + '?sale_type=detal'}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Detal
              </Link>
              <Link
                to={createPageUrl('Shop') + '?sale_type=mayor'}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Mayor
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Admin')} className="hidden md:flex w-10 h-10 hover:bg-zinc-800 items-center justify-center transition-colors">
                <Settings className="w-5 h-5 text-zinc-400" />
              </Link>
              <button
                onClick={logout}
                className="hidden md:flex w-10 h-10 hover:bg-zinc-800 items-center justify-center transition-colors"
              >
                <LogOut className="w-5 h-5 text-zinc-400" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                data-testid="shop-cart-btn"
              >
                <ShoppingBag className="w-5 h-5 text-zinc-400" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-800 bg-zinc-900"
            >
              <div className="px-4 py-6 space-y-4">
                <Link to={createPageUrl('Shop')} className="block text-lg font-medium text-white uppercase tracking-wider">Tienda</Link>
                <Link to={createPageUrl('Shop') + '?sale_type=detal'} className="block text-lg font-medium text-zinc-400 uppercase tracking-wider">Detal</Link>
                <Link to={createPageUrl('Shop') + '?sale_type=mayor'} className="block text-lg font-medium text-zinc-400 uppercase tracking-wider">Mayor</Link>
                <Link to={createPageUrl('Admin')} className="block text-lg font-medium text-zinc-400 uppercase tracking-wider">Admin</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-zinc-950 py-16 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white font-teko uppercase tracking-tight mb-4">
              {saleType === 'mayor' ? 'Venta al Mayor' : saleType === 'detal' ? 'Venta al Detal' : 'Catálogo de Productos'}
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl">
              {saleType === 'mayor'
                ? 'Precios especiales para distribuidores y compras en volumen'
                : 'Encuentra todo lo que necesitas para tu vehículo'}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-zinc-800 bg-zinc-950 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-zinc-600" />
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Filtros:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                        category === cat.value
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                      data-testid={`filter-${cat.value}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Select value={saleType} onValueChange={setSaleType}>
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {saleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-white">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="newest" className="text-white">Más recientes</SelectItem>
                    <SelectItem value="price-low" className="text-white">Precio: Menor</SelectItem>
                    <SelectItem value="price-high" className="text-white">Precio: Mayor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800">
                    <Skeleton className="w-full aspect-square bg-zinc-800" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-1/4 bg-zinc-800" />
                      <Skeleton className="h-6 w-3/4 bg-zinc-800" />
                      <Skeleton className="h-6 w-1/2 bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-zinc-500">
                    Mostrando <span className="font-bold text-white">{filteredProducts.length}</span> productos
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      showWholesale={saleType === 'mayor' || saleType === 'all'}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-12 h-12 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white font-teko uppercase mb-2">No hay productos</h3>
                <p className="text-zinc-500 mb-6">Intenta ajustar los filtros</p>
                <Button
                  onClick={() => {
                    setCategory('all');
                    setSaleType('all');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-none uppercase tracking-wider font-bold"
                >
                  Ver Todos
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

      <Chatbot />
    </div>
  );
}
