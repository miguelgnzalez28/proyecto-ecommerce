import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">User Not Registered</h1>
        <p className="text-neutral-600 mb-6">
          Your account is not registered. Please contact support to complete your registration.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
