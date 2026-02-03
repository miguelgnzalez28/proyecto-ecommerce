import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Mail, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toaster";

export default function NewsletterForm({ source = "homepage" }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      await base44.entities.EmailSubscriber.create({
        email,
        subscribed_at: new Date().toISOString(),
        source,
        is_active: true
      });
      setIsSuccess(true);
      setEmail("");
      toast('Successfully subscribed!', 'success');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast('Failed to subscribe. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 pr-4 py-6 rounded-full border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 text-base"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className="px-8 py-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="arrow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </form>
  );
}
