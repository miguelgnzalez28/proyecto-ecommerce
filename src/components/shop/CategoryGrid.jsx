import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Wrench, CircleDot, Car, Zap, Settings, Boxes } from 'lucide-react';

const categories = [
  {
    id: 'engine',
    name: 'Motor',
    description: 'Filtros, bujías, correas',
    icon: Settings,
    image: 'https://images.unsplash.com/photo-1764537432322-dad234b0848d?w=500',
  },
  {
    id: 'brakes',
    name: 'Frenos',
    description: 'Pastillas, discos, líquidos',
    icon: CircleDot,
    image: 'https://images.unsplash.com/photo-1733309730239-1d2b723eb807?w=500',
  },
  {
    id: 'suspension',
    name: 'Suspensión',
    description: 'Amortiguadores, muelles',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1581719795311-a65c33239f8a?w=500',
  },
  {
    id: 'electrical',
    name: 'Eléctrico',
    description: 'Baterías, alternadores, luces',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500',
  },
  {
    id: 'tires',
    name: 'Neumáticos',
    description: 'Llantas, rines, accesorios',
    icon: CircleDot,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  },
  {
    id: 'tools',
    name: 'Herramientas',
    description: 'Equipos y accesorios',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1708745427274-d5de5122fd57?w=500',
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-24 bg-zinc-950" data-testid="category-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white font-teko uppercase tracking-tight mb-4">
            Categorías
          </h2>
          <p className="text-zinc-500 max-w-lg">
            Encuentra todo lo que necesitas para mantener tu vehículo en óptimas condiciones.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`${createPageUrl('Shop')}?category=${category.id}`}
                  className="group block relative h-48 overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-colors duration-300"
                  data-testid={`category-${category.id}`}
                >
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                  </div>
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <Icon className="w-6 h-6 text-red-600 mb-2" />
                    <h3 className="text-lg font-bold text-white font-teko uppercase tracking-wider">
                      {category.name}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
