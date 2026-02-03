import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Building2, Shield, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";

export default function Checkout() {
  const navigate = useNavigate();
  const [sessionId] = useState(() => localStorage.getItem('session_id') || `session_${Date.now()}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => base44.entities.CartItem.filter({ session_id: sessionId }),
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate(createPageUrl("Shop"));
      toast('Your cart is empty', 'info');
    }
  }, [cartItems.length, navigate, orderComplete]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async () => {
    // Validate required fields
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || 
        !formData.city || !formData.state || !formData.zip) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    if (formData.paymentMethod === 'card' && (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc)) {
      toast('Please fill in all payment details', 'error');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create order
      const order = await base44.entities.Order.create({
        customer_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.product_price
        })),
        total: total,
        status: 'pending',
        shipping_address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country
        },
        payment_method: formData.paymentMethod,
        payment_status: 'completed'
      });

      // Subscribe to newsletter
      try {
        await base44.entities.EmailSubscriber.create({
          email: formData.email,
          subscribed_at: new Date().toISOString(),
          source: 'checkout',
          is_active: true
        });
      } catch (error) {
        // Ignore subscription errors
        console.warn('Failed to subscribe email:', error);
      }

      // Clear cart
      for (const item of cartItems) {
        await base44.entities.CartItem.delete(item.id);
      }

      refetchCart();
      setIsProcessing(false);
      setOrderComplete(true);
      toast('Order placed successfully!', 'success');
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      toast('Failed to place order. Please try again.', 'error');
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900 mb-3">Order Confirmed!</h1>
          <p className="text-neutral-600 mb-8">
            Thank you for your purchase. We've sent a confirmation email to {formData.email}
          </p>
          <Link to={createPageUrl("Home")}>
            <Button className="px-8 py-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl("Home")} className="text-2xl font-bold tracking-tight text-neutral-900">
              <span className="text-red-600">AUTO</span>PARTS
            </Link>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Shield className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-12">
        <Link 
          to={createPageUrl("Shop")} 
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="space-y-8">
            {/* Contact */}
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm text-neutral-600">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1.5 rounded-lg border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Shipping */}
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm text-neutral-600">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1.5 rounded-lg border-neutral-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm text-neutral-600">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1.5 rounded-lg border-neutral-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm text-neutral-600">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1.5 rounded-lg border-neutral-200"
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm text-neutral-600">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1.5 rounded-lg border-neutral-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm text-neutral-600">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1.5 rounded-lg border-neutral-200"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip" className="text-sm text-neutral-600">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="mt-1.5 rounded-lg border-neutral-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm text-neutral-600">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1.5 rounded-lg border-neutral-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Payment Method</h2>
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                className="space-y-3"
              >
                <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'card' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 text-neutral-600" />
                    Credit / Debit Card
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'paypal' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                    <span className="text-blue-600 font-bold text-sm">PayPal</span>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === 'bank_transfer' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
                  <RadioGroupItem value="bank_transfer" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Building2 className="w-5 h-5 text-neutral-600" />
                    Bank Transfer
                  </Label>
                </div>
              </RadioGroup>

              {formData.paymentMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm text-neutral-600">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="mt-1.5 rounded-lg border-neutral-200"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-sm text-neutral-600">Expiry</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        className="mt-1.5 rounded-lg border-neutral-200"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvc" className="text-sm text-neutral-600">CVC</Label>
                      <Input
                        id="cardCvc"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        className="mt-1.5 rounded-lg border-neutral-200"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img
                        src={item.product_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{item.product_name}</p>
                      <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.product_price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-neutral-100">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isProcessing || cartItems.length === 0}
                className="w-full mt-6 py-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </Button>

              <p className="text-xs text-neutral-500 text-center mt-4">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
