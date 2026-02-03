import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/lib/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validación de nombre: solo letras, espacios, guiones y apóstrofes
  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    if (!name.trim()) {
      return 'El nombre es requerido';
    }
    if (!nameRegex.test(name)) {
      return 'El nombre solo puede contener letras, espacios, guiones y apóstrofes';
    }
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  };

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'El correo electrónico es requerido';
    }
    if (!emailRegex.test(email)) {
      return 'Por favor ingresa un correo electrónico válido';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar en tiempo real
    if (name === 'name') {
      setErrors(prev => ({ ...prev, name: validateName(value) }));
    } else if (name === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (name === 'password') {
      if (value.length > 0 && value.length < 6) {
        setErrors(prev => ({ ...prev, password: 'La contraseña debe tener al menos 6 caracteres' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
      // Validar confirmación de contraseña si ya tiene valor
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else if (formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    } else if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    let passwordError = '';
    let confirmPasswordError = '';

    if (!formData.password) {
      passwordError = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      passwordError = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      confirmPasswordError = 'Por favor confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      confirmPasswordError = 'Las contraseñas no coinciden';
    }

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Si hay errores, no enviar el formulario
    if (nameError || emailError || passwordError || confirmPasswordError) {
      toast('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.user);
        toast('¡Registro exitoso!', 'success');
        navigate('/');
      } else {
        toast(data.message || 'Error en el registro', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast('Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <CardTitle className="text-3xl font-light">
              Crear Cuenta
            </CardTitle>
            <p className="text-neutral-500 mt-2">
              Regístrate para comenzar a comprar repuestos
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
                  Nombre Completo
                </Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 rounded-lg border-neutral-200 focus:border-red-600 focus:ring-red-600 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                  Correo Electrónico
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 rounded-lg border-neutral-200 focus:border-red-600 focus:ring-red-600 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                  Contraseña
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 rounded-lg border-neutral-200 focus:border-red-600 focus:ring-red-600 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                  Confirmar Contraseña
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 rounded-lg border-neutral-200 focus:border-red-600 focus:ring-red-600 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    placeholder="Confirma tu contraseña"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-base"
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
              <p className="text-sm text-neutral-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-red-600 font-medium hover:text-red-700">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
