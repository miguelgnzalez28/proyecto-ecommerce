import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    };
    checkAuth();
  }, []);

  const handleShopClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      base44.auth.redirectToLogin(createPageUrl("Shop"));
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-stone-50 via-white to-amber-50/30">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-stone-100/50 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-neutral-900 text-white text-xs uppercase tracking-widest rounded-full mb-6">
              Performance Parts 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-light text-neutral-900 leading-[1.1] mb-6">
              Power Your
              <span className="block font-semibold">Driving Passion</span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-md mb-8 leading-relaxed">
              Premium auto parts and accessories for enthusiasts who demand the best. 
              Quality components that deliver performance and reliability.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link to={createPageUrl("Shop")}>
                  <Button className="px-8 py-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-base group">
                    Shop Parts
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={handleShopClick}
                  className="px-8 py-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-base group"
                >
                  Login to Shop
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
              <Button variant="outline" className="px-8 py-6 rounded-full border-neutral-300 hover:bg-neutral-100 font-medium text-base">
                Our Story
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -left-8 bottom-20 bg-white p-6 rounded-2xl shadow-xl"
            >
              <p className="text-3xl font-semibold text-neutral-900">10,000+</p>
              <p className="text-sm text-neutral-500">Parts Delivered</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
