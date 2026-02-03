import React from 'react';
import NewsletterForm from './NewsletterForm';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h3 className="text-3xl font-light mb-4">
              Stay in the Loop
            </h3>
            <p className="text-neutral-400 mb-8 max-w-md">
              Subscribe for exclusive deals, new parts, and automotive tips from our experts.
            </p>
            <NewsletterForm source="footer" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><Link to={createPageUrl("Shop")} className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to={`${createPageUrl("Shop")}?category=engine`} className="hover:text-white transition-colors">Engine Parts</Link></li>
                <li><Link to={`${createPageUrl("Shop")}?category=brakes`} className="hover:text-white transition-colors">Brakes</Link></li>
                <li><Link to={`${createPageUrl("Shop")}?category=performance`} className="hover:text-white transition-colors">Performance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-neutral-800">
          <p className="text-neutral-500 text-sm mb-4 md:mb-0">
            © 2026 AUTOPARTS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
