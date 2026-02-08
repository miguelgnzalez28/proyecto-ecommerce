import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/base44Client';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    if (!name.trim()) return 'El nombre es requerido';
    if (!nameRegex.test(name)) return 'El nombre solo puede contener letras';
    if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'El correo es requerido';
    if (!emailRegex.test(email)) return 'Correo electrónico inválido';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'name') {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    } else if (name === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === 'password') {
      if (value.length > 0 && value.length < 6) {
        setErrors((prev) => ({ ...prev, password: 'Mínimo 6 caracteres' }));
      } else {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else if (formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    } else if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    let passwordError = '';
    let confirmPasswordError = '';

    if (!formData.password) {
      passwordError = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      passwordError = 'Mínimo 6 caracteres';
    }

    if (!formData.confirmPassword) {
      confirmPasswordError = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      confirmPasswordError = 'Las contraseñas no coinciden';
    }

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (nameError || emailError || passwordError || confirmPasswordError) {
      toast('Por favor corrige los errores', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(response.user);
      localStorage.setItem('token', response.access_token);
      toast('¡Cuenta creada exitosamente!', 'success');
      navigate('/');
    } catch (error) {
      toast(error.message || 'Error al crear la cuenta', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12" data-testid="register-page">
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
              Crear Cuenta
            </h1>
            <p className="text-zinc-500 mt-2">
              Regístrate para comenzar a comprar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Nombre Completo
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Juan Pérez"
                  required
                  data-testid="register-name-input"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Correo Electrónico
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="tu@email.com"
                  required
                  data-testid="register-email-input"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Contraseña
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  required
                  data-testid="register-password-input"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Confirmar Contraseña
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 bg-zinc-800 border-zinc-700 focus:border-red-600 rounded-none h-12 text-white placeholder:text-zinc-600 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Repite tu contraseña"
                  required
                  data-testid="register-confirm-password-input"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-none"
              data-testid="register-submit-btn"
            >
              {isLoading ? 'Creando cuenta...' : (
                <>
                  Crear Cuenta
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-red-500 font-medium hover:text-red-400">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
