import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart, showWholesale = false }) {
  const hasWholesalePrice = product.price_wholesale && product.price_wholesale < product.price;
  const canSellWholesale = product.sale_type === 'mayor' || product.sale_type === 'both';
  const canSellRetail = product.sale_type === 'detal' || product.sale_type === 'both';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      data-testid={`product-card-${product.id}`}
    >
      <Card className="group relative overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-red-600 transition-colors duration-300 rounded-none">
        <div className="relative aspect-square overflow-hidden bg-zinc-950">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1689204778500-329b194714f8?w=600'}
            alt={product.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                Destacado
              </span>
            )}
            {hasWholesalePrice && canSellWholesale && (
              <span className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                Mayor disponible
              </span>
            )}
          </div>
          
          {/* Quick Add Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2">
            {canSellRetail && (
              <Button
                onClick={() => onAddToCart(product, 'detal')}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-none py-3 font-bold uppercase tracking-wider text-xs"
                data-testid={`add-to-cart-detal-${product.id}`}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Agregar (Detal)
              </Button>
            )}
            {canSellWholesale && hasWholesalePrice && showWholesale && (
              <Button
                onClick={() => onAddToCart(product, 'mayor')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-none py-3 font-bold uppercase tracking-wider text-xs border border-zinc-700"
                data-testid={`add-to-cart-mayor-${product.id}`}
              >
                <Tag className="w-4 h-4 mr-2" />
                Agregar (Mayor)
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-xs text-red-600 uppercase tracking-widest mb-1 font-bold">
            {product.category}
          </p>
          <h3 className="font-bold text-white mb-2 line-clamp-1 font-teko text-xl uppercase tracking-wide">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-white">
              ${product.price?.toFixed(2)}
            </p>
            {hasWholesalePrice && canSellWholesale && (
              <p className="text-sm text-zinc-500">
                Mayor: ${product.price_wholesale?.toFixed(2)}
              </p>
            )}
          </div>
          {product.inventory !== undefined && product.inventory <= 10 && product.inventory > 0 && (
            <p className="text-xs text-yellow-500 mt-2">
              Solo {product.inventory} disponibles
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
