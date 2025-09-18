'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePaidCustomer } from '@/app/(customer)/core/use-customer-creation';
import { APPLICATION_AGENT_ID } from '@/app/constants';

interface LoginFormData {
  name: string;
  email: string;
  password: string;
}


export default function Signup() {
  const [formData, setFormData] = useState<LoginFormData>({
    name: '',
    email: '',
    password: ''
  });
  const router = useRouter();
  const { signup, isLoggedIn } = useAuth();

  const { state: customerState, createCustomerAccount } = usePaidCustomer({
    agentId: APPLICATION_AGENT_ID,
    onSuccess: () => {
      router.push('/payment-setup');
    },
  });

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      return;
    }

    try {
      const result = await createCustomerAccount({
        email: formData.email,
        name: formData.name,
      });

      if (!result) return;

      const userData = {
        customerId: result.customerId,
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      await signup(userData);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-8 text-center">Sign Up</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900"
            placeholder="Enter your name"
            required
          />
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900"
            placeholder="Enter your password"
            required
          />
        </div>

        {customerState.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {customerState.error}
          </div>
        )}

        <button
          type="submit"
          disabled={customerState.isCreating || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {customerState.isCreating ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
