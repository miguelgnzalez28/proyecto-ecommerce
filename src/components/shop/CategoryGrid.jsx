import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    name: "Engine Parts",
    slug: "engine",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600",
    count: "200+ items"
  },
  {
    name: "Brakes",
    slug: "brakes",
    image: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=600",
    count: "150+ items"
  },
  {
    name: "Suspension",
    slug: "suspension",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
    count: "180+ items"
  },
  {
    name: "Performance",
    slug: "performance",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
    count: "220+ items"
  }
];

export default function CategoryGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-neutral-500 max-w-md mx-auto">
            Find the perfect parts for your vehicle
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`${createPageUrl("Shop")}?category=${category.slug}`}>
                <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-white mb-1">{category.name}</h3>
                        <p className="text-white/70 text-sm">{category.count}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-5 h-5 text-neutral-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
