import React, { useState, useEffect } from 'react';
import { api } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Shield, Check, Loader2, Copy, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toaster';

export default function Checkout() {
  const navigate = useNavigate();
  const [sessionId] = useState(() => localStorage.getItem('session_id') || `session_${Date.now()}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Venezuela',
    notes: '',
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => api.cart.get(sessionId),
  });

  const { data: bankConfig = {} } = useQuery({
    queryKey: ['bankConfig'],
    queryFn: () => api.config.getBank(),
  });

  const { data: companyConfig = {} } = useQuery({
    queryKey: ['companyConfig'],
    queryFn: () => api.config.getCompany(),
  });

  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      // Don't redirect immediately, wait a bit
    }
  }, [cartItems.length, orderComplete]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast('Copiado al portapapeles', 'success');
  };

  const handleSubmitOrder = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.state) {
      toast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const order = await api.orders.create({
        customer_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.product_price,
          sale_type: item.sale_type || 'detal',
        })),
        total: total,
        shipping_address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phone: formData.phone,
        },
        payment_method: 'bank_transfer',
        source: 'web',
        notes: formData.notes,
      });

      // Clear cart
      await api.cart.clear(sessionId);
      refetchCart();

      setCreatedOrder(order);
      setIsProcessing(false);
      setOrderComplete(true);
      toast('¡Pedido creado exitosamente!', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessing(false);
      toast('Error al procesar el pedido. Intenta de nuevo.', 'error');
    }
  };

  if (orderComplete && createdOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6" data-testid="order-complete">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="bg-zinc-900 border border-zinc-800 p-8">
            <div className="w-20 h-20 bg-green-600/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white font-teko uppercase tracking-wider mb-3">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-zinc-400 mb-4">
              Tu número de pedido es:
            </p>
            <p className="text-2xl font-bold text-red-500 font-mono mb-6">
              {createdOrder.order_id}
            </p>

            <div className="bg-zinc-950 border border-zinc-800 p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-yellow-500 font-bold uppercase">Importante</p>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Para completar tu pedido, realiza la transferencia a la siguiente cuenta y envía el comprobante por WhatsApp:
              </p>
              
              {bankConfig.bank_name ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Banco:</span>
                    <span className="text-white">{bankConfig.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Cuenta:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{bankConfig.account_number}</span>
                      <button onClick={() => copyToClipboard(bankConfig.account_number)} className="text-zinc-500 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Titular:</span>
                    <span className="text-white">{bankConfig.account_holder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tipo:</span>
                    <span className="text-white">{bankConfig.account_type}</span>
                  </div>
                  {bankConfig.identification && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Cédula/RIF:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{bankConfig.identification}</span>
                        <button onClick={() => copyToClipboard(bankConfig.identification)} className="text-zinc-500 hover:text-white">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm italic">
                  Datos bancarios no configurados. Contacta al vendedor.
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-lg font-bold text-white">
                  Total a transferir: <span className="text-red-500">${total.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={api.orders.getPdfUrl(createdOrder.order_id, 'ticket')}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-none uppercase tracking-wider font-bold">
                  Descargar Ticket PDF
                </Button>
              </a>
              {companyConfig.whatsapp_number && (
                <a
                  href={`https://wa.me/${companyConfig.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hola! Acabo de realizar el pedido ${createdOrder.order_id} por $${total.toFixed(2)}. Adjunto mi comprobante de pago.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-none uppercase tracking-wider font-bold">
                    Enviar Comprobante por WhatsApp
                  </Button>
                </a>
              )}
              <Link to={createPageUrl('Home')}>
                <Button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-none uppercase tracking-wider font-bold">
                  Volver a la Tienda
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="checkout-page">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white font-teko">A</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-teko">
                AUTO<span className="text-red-600">PARTS</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Shield className="w-4 h-4" />
              Checkout Seguro
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to={createPageUrl('Shop')}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Tienda
        </Link>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 mb-4">Tu carrito está vacío</p>
            <Link to={createPageUrl('Shop')}>
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-none uppercase tracking-wider font-bold">
                Ir a la Tienda
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="space-y-8">
              {/* Contact */}
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-white font-teko uppercase tracking-wider mb-6">
                  Información de Contacto
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm text-zinc-400">Nombre *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                        required
                        data-testid="checkout-firstname"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm text-zinc-400">Apellido *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                        required
                        data-testid="checkout-lastname"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm text-zinc-400">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                      required
                      data-testid="checkout-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm text-zinc-400">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                      data-testid="checkout-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-white font-teko uppercase tracking-wider mb-6">
                  Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-sm text-zinc-400">Dirección *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                      required
                      data-testid="checkout-address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm text-zinc-400">Ciudad *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                        required
                        data-testid="checkout-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm text-zinc-400">Estado *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                        required
                        data-testid="checkout-state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip" className="text-sm text-zinc-400">Código Postal</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                        data-testid="checkout-zip"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm text-zinc-400">País</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white"
                        data-testid="checkout-country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method - Bank Transfer */}
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-white font-teko uppercase tracking-wider mb-6">
                  Método de Pago
                </h2>
                <div className="flex items-center gap-4 p-4 bg-zinc-950 border-2 border-red-600">
                  <Building2 className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-white font-bold">Transferencia Bancaria</p>
                    <p className="text-sm text-zinc-500">Recibirás los datos después de confirmar el pedido</p>
                  </div>
                </div>

                {bankConfig.bank_name && (
                  <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 text-sm">
                    <p className="text-zinc-400 mb-2">Datos de la cuenta:</p>
                    <div className="space-y-1">
                      <p className="text-white">Banco: {bankConfig.bank_name}</p>
                      <p className="text-white">Cuenta: {bankConfig.account_number}</p>
                      <p className="text-white">Titular: {bankConfig.account_holder}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-zinc-900 border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-white font-teko uppercase tracking-wider mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 flex-shrink-0 bg-zinc-800">
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1689204778500-329b194714f8?w=200'}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{item.product_name}</p>
                        <p className="text-sm text-zinc-500">
                          Cant: {item.quantity} • {item.sale_type === 'mayor' ? 'Mayor' : 'Detal'}
                        </p>
                      </div>
                      <p className="font-medium text-white">${(item.product_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Envío</span>
                    <span className="text-white">{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-zinc-800">
                    <span className="text-white">Total</span>
                    <span className="text-red-500">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full mt-6 py-6 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-none"
                  data-testid="checkout-submit-btn"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    `Confirmar Pedido - $${total.toFixed(2)}`
                  )}
                </Button>

                <p className="text-xs text-zinc-600 text-center mt-4">
                  Al confirmar, aceptas nuestros términos y condiciones.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
