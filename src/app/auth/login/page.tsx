'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    
    try {
      // Here you would implement actual login with NextAuth
      console.log('Login attempt:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any login
      if (data.email && data.password) {
        // Redirect to dashboard on success
        router.push('/dashboard');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm 
          onSubmit={handleLogin}
          isLoading={loading}
          error={error}
        />
      </div>
    </div>
  );
}