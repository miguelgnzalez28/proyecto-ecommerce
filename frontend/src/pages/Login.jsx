import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/base44Client';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Por favor completa todos los campos', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      login(response.user);
      localStorage.setItem('token', response.access_token);
      toast('¡Bienvenido de vuelta!', 'success');
      navigate('/');
    } catch (error) {
      toast(error.message || 'Credenciales inválidas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 border border-zinc-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white font-teko">A</span>
            </div>
            <h1 className="text-3xl font-bold text-white font-teko uppercase tracking-wider">
              Iniciar Sesión
            </h1>
            <p className="text-zinc-500 mt-2">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Correo Electrónico
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600"
                  placeholder="tu@email.com"
                  required
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Contraseña
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600"
                  placeholder="Tu contraseña"
                  required
                  data-testid="login-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-none"
              data-testid="login-submit-btn"
            >
              {isLoading ? 'Iniciando sesión...' : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-red-500 font-medium hover:text-red-400">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
