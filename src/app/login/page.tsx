'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getUserData } from '@/app/utils/cookies';

interface LoginFormData {
  email: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isLoggedIn, userData, login } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (formData: LoginFormData): Promise<void> => {
    const userData = getUserData();
    if (userData && userData.email === formData.email) {
      login(userData);
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await handleLogin(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToSignup = () => {
    router.push('/sign-up');
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-8 text-center">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.email.trim()}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={goToSignup}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
