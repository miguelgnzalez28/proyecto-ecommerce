import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Shield, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background" data-testid="hero-section">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1624893101114-c0a7c3bfe3de?w=1920"
          alt="Motor de alto rendimiento"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-red-600 text-white text-xs uppercase tracking-widest font-bold mb-6"
            >
              Repuestos de Calidad 2026
            </motion.span>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none mb-6 font-teko uppercase tracking-tight">
              <span className="block">Precisión.</span>
              <span className="block text-red-600">Rendimiento.</span>
              <span className="block">Máximo.</span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-lg mb-8 leading-relaxed">
              Repuestos y piezas premium para entusiastas que exigen lo mejor. 
              Componentes de calidad que garantizan rendimiento y confiabilidad.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl("Shop")}>
                <Button className="px-8 py-6 bg-red-600 hover:bg-red-700 text-white font-bold text-base uppercase tracking-wider rounded-none group" data-testid="hero-shop-btn">
                  Ver Catálogo
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={createPageUrl("Shop") + "?sale_type=mayor"}>
                <Button variant="outline" className="px-8 py-6 border-2 border-zinc-700 hover:border-white text-white font-bold text-base uppercase tracking-wider rounded-none bg-transparent" data-testid="hero-wholesale-btn">
                  Compra al Mayor
                </Button>
              </Link>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-zinc-800">
              <div className="text-center">
                <Wrench className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Calidad Premium</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Garantía</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Envío Nacional</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-red-600" />
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"
                alt="Auto deportivo"
                className="w-full h-auto"
              />
            </div>
            
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-8 -left-8 bg-zinc-900 border border-zinc-800 p-6"
            >
              <p className="text-4xl font-bold text-white font-teko">10,000+</p>
              <p className="text-sm text-zinc-500 uppercase tracking-wider">Piezas Entregadas</p>
            </motion.div>
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute top-8 -right-4 bg-red-600 p-4"
            >
              <p className="text-xs text-white uppercase tracking-wider font-bold">Detal</p>
              <p className="text-xs text-white uppercase tracking-wider font-bold">& Mayor</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
