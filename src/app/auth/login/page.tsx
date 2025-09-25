'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      // call NextAuth credential provider; do NOT redirect automatically
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      // res contains ok/error fields when redirect:false
      if (res?.error) {
        setError(res.error || 'Login failed');
      } else {
        // successful sign in — navigation AFTER session cookie is set
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <LoginForm onSubmit={handleLogin} isLoading={loading} error={error} />
    </div>
  );
}