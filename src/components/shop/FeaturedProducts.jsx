import React from 'react';
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FeaturedProducts({ products, onAddToCart }) {
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-4">
              Featured Products
            </h2>
            <p className="text-neutral-500 max-w-md">
              Top-rated parts chosen by automotive experts
            </p>
          </div>
          <Link 
            to={createPageUrl("Shop")}
            className="inline-flex items-center gap-2 text-neutral-900 font-medium hover:gap-4 transition-all"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
