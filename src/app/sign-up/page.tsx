'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getCookie } from '@/app/utils/cookies';

interface LoginFormData {
  name: string;
  email: string;
}

const createCustomer = async (email: string, name: string) => {
  const response = await fetch('/api/create-customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create customer');
  }

  const data = await response.json();
  return data.customerId;
};

export default function Signup() {
  const [formData, setFormData] = useState<LoginFormData>({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Check if account already exists (cookie set)
    const stripeCustomerId = getCookie('stripe_customer_id');
    if (stripeCustomerId) {
      router.push('/login');
    }
  }, [router]);

  const handleSignup = async (formData: LoginFormData): Promise<void> => {
    const customerId = await createCustomer(formData.email, formData.name);
    const userData = {
      customerId,
      name: formData.name,
      email: formData.email
    };

    login(userData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    await handleSignup(formData);
    router.push('/payment-setup');
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

        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
