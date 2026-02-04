import React from 'react';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturedProducts({ products = [], onAddToCart }) {
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-24 bg-background" data-testid="featured-products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-2 block">
              Lo más vendido
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-teko uppercase tracking-tight">
              Productos Destacados
            </h2>
          </div>
          <Link
            to={createPageUrl('Shop')}
            className="hidden md:flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase tracking-wider text-sm font-bold group"
            data-testid="view-all-products"
          >
            Ver Todos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} onAddToCart={onAddToCart} showWholesale={true} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to={createPageUrl('Shop')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold uppercase tracking-wider text-sm"
          >
            Ver Todos los Productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
