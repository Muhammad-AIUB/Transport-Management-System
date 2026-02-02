import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { LogIn, Bus, Mail, Lock } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { login } from '../services/authApi';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  if (localStorage.getItem('token')) {
    return <Navigate to={from} replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@admin.com',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      const result = await login(data.email, data.password);

      if (result?.token) {
        localStorage.setItem('token', result.token);
        toast.success('Login successful');
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Premium glass card */}
        <div className="bg-navy-800/50 backdrop-blur-xl rounded-2xl shadow-glass-lg border border-white/5 p-8 md:p-10">
          {/* Logo and header */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-linear-to-br from-primary-500 to-primary-600 p-4 rounded-2xl shadow-premium-lg">
                <Bus className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Transport Management</h1>
            <p className="text-navy-300 text-sm mt-2">Sign in to your account</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none z-10" />
                <Input
                  type="email"
                  placeholder="Email address"
                  {...register('email')}
                  error={errors.email?.message}
                  className="pl-11"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none z-10" />
                <Input
                  type="password"
                  placeholder="Password"
                  {...register('password')}
                  error={errors.password?.message}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" isLoading={isSubmitting}>
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </form>

          {/* Demo credentials - elegant display */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
              <span className="text-xs font-medium text-navy-400 uppercase tracking-wider">Demo Access</span>
              <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
            </div>
            <div className="bg-navy-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex flex-col space-y-2 text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-navy-400 text-sm">Email:</span>
                  <code className="text-primary-400 font-mono text-sm bg-primary-500/10 px-2 py-0.5 rounded">admin@admin.com</code>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-navy-400 text-sm">Password:</span>
                  <code className="text-primary-400 font-mono text-sm bg-primary-500/10 px-2 py-0.5 rounded">admin123</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-navy-500 text-xs mt-6">
          Transport Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
