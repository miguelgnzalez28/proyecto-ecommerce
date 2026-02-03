import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
            <Heart className="w-5 h-5 text-neutral-600" />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={() => onAddToCart(product)}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-full py-6 font-medium tracking-wide"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
        
        <div className="p-5">
          <p className="text-xs text-neutral-400 uppercase tracking-widest mb-2">
            {product.category}
          </p>
          <h3 className="font-medium text-neutral-900 mb-2 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-lg font-semibold text-neutral-900">
            ${product.price?.toFixed(2)}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
