import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import NewsletterForm from './NewsletterForm';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white font-teko">A</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-teko">
                AUTO<span className="text-red-600">PARTS</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm mb-6">
              Tu tienda de confianza para repuestos y piezas de automóviles. Calidad garantizada al mejor precio.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-zinc-800 flex items-center justify-center hover:border-red-600 hover:bg-red-600/10 transition-colors">
                <Facebook className="w-4 h-4 text-zinc-500 hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 border border-zinc-800 flex items-center justify-center hover:border-red-600 hover:bg-red-600/10 transition-colors">
                <Instagram className="w-4 h-4 text-zinc-500 hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 border border-zinc-800 flex items-center justify-center hover:border-red-600 hover:bg-red-600/10 transition-colors">
                <Twitter className="w-4 h-4 text-zinc-500 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white font-teko uppercase tracking-wider mb-6">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl('Shop')} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Tienda
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Shop') + '?sale_type=detal'} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Venta al Detal
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Shop') + '?sale_type=mayor'} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Venta al Mayor
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Admin')} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold text-white font-teko uppercase tracking-wider mb-6">
              Categorías
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl('Shop') + '?category=engine'} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Motor
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Shop') + '?category=brakes'} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Frenos
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Shop') + '?category=suspension'} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Suspensión
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Shop') + '?category=electrical'} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Eléctrico
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Shop') + '?category=tires'} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  Neumáticos
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-white font-teko uppercase tracking-wider mb-6">
              Newsletter
            </h3>
            <p className="text-zinc-500 text-sm mb-4">
              Suscríbete para recibir ofertas exclusivas y novedades.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-sm">
              © 2026 AutoParts Pro. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-zinc-600 hover:text-white text-sm transition-colors">Términos</a>
              <a href="#" className="text-zinc-600 hover:text-white text-sm transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
