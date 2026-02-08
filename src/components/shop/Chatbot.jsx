import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/api/base44Client';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '¡Hola! Bienvenido a AutoParts Pro. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.chatbot.query(input);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.response,
        redirectWhatsapp: response.redirect_whatsapp,
        whatsappNumber: response.whatsapp_number,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsappRedirect = (number) => {
    if (number) {
      window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg z-50 transition-colors"
        onClick={() => setIsOpen(true)}
        data-testid="chatbot-toggle"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-zinc-900 border border-zinc-800 shadow-2xl z-50 flex flex-col"
            data-testid="chatbot-window"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white font-teko">A</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">AutoParts Asistente</h3>
                  <p className="text-xs text-green-500">En línea</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
                data-testid="chatbot-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.redirectWhatsapp && message.whatsappNumber && (
                      <button
                        onClick={() => handleWhatsappRedirect(message.whatsappNumber)}
                        className="mt-2 flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Contactar por WhatsApp
                      </button>
                    )}
                    {message.redirectWhatsapp && !message.whatsappNumber && (
                      <p className="mt-2 text-xs text-zinc-400">
                        (Número de WhatsApp no configurado)
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-10 text-white placeholder:text-zinc-500"
                  data-testid="chatbot-input"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-none h-10 px-4"
                  data-testid="chatbot-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
