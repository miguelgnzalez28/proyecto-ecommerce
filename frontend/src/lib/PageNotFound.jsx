import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-neutral-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">Page Not Found</h2>
        <p className="text-neutral-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={createPageUrl("Home")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
