import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/base44Client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast('Por favor completa todos los campos', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // For admin login, we use the username as email
      const response = await api.auth.login({ email: username, password });
      
      // Check if user is admin
      if (response.user.role !== 'admin') {
        toast('Credenciales de administrador inválidas', 'error');
        setIsLoading(false);
        return;
      }
      
      login(response.user);
      localStorage.setItem('token', response.access_token);
      toast('¡Bienvenido Administrador!', 'success');
      navigate('/admin');
    } catch (error) {
      toast(error.message || 'Credenciales inválidas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 border border-zinc-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white font-teko uppercase tracking-wider">
              Panel de Administración
            </h1>
            <p className="text-zinc-500 mt-2">
              Acceso exclusivo para administradores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Usuario
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600"
                  placeholder="admin"
                  required
                  data-testid="admin-username-input"
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
                  placeholder="••••••••••"
                  required
                  data-testid="admin-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-none"
              data-testid="admin-login-submit-btn"
            >
              {isLoading ? 'Verificando...' : (
                <>
                  Acceder al Panel
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
