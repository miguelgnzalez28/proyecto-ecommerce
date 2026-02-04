import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/api/base44Client';
import { toast } from '@/components/ui/toaster';
import { ArrowRight, Check } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await api.subscribers.create({ email, source: 'newsletter' });
      setIsSubscribed(true);
      toast('¡Te has suscrito exitosamente!', 'success');
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (error) {
      toast(error.message || 'Error al suscribirse', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="newsletter-form">
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 bg-zinc-900 border-zinc-800 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600"
          required
          data-testid="newsletter-email-input"
        />
        <Button
          type="submit"
          disabled={isLoading || isSubscribed}
          className="px-4 bg-red-600 hover:bg-red-700 text-white rounded-none h-12"
          data-testid="newsletter-submit-btn"
        >
          {isSubscribed ? (
            <Check className="w-5 h-5" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
