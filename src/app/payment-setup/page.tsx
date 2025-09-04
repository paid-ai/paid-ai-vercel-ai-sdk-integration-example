'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/app/contexts/AuthContext';
import { setUserData } from '@/app/utils/cookies';

const stripePromise = loadStripe('pk_test_51S2vuZ8wBPYbZq7jCxOkFwHVRN7wBnZaymul9w0uRaZgNlEE3GZg4XLYy0JrSqut1bxVJhKOEk4Cv49f3NmKYInl002Nm1h0lP');

function PaymentFormContent() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { userData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !userData) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: tokenError, confirmationToken } = await stripe.createConfirmationToken({
        elements,
      });

      if (tokenError) {
        throw new Error(tokenError.message || 'Failed to create confirmation token');
      }

      if (confirmationToken) {
        console.log('Confirmation token created:', confirmationToken.id);

        const response = await fetch('/api/paid-setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: userData.customerId,
            confirmationToken: confirmationToken.id,
            metadata: {
              email: userData.email,
              name: userData.name,
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to process payment with Paid');
        }

        const paidResponse = await response.json();
        console.log('Paid setup intent response:', paidResponse);

        if (userData) {
          const updatedUserData = {
            ...userData,
            confirmationTokenId: confirmationToken.id,
            paymentProcessed: true
          };
          setUserData(updatedUserData);
        }

        router.push('/');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment setup failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Payment Details
        </label>
        <div className="p-3 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Save Payment Method'}
      </button>
    </form>
  );
}

export default function PaymentSetup() {
  const router = useRouter();
  const { isLoggedIn, userData } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !userData) {
      router.push('/sign-up');
      return;
    }
  }, [isLoggedIn, userData, router]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-8 text-center">Setup Payment</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center">
        Add a payment method to complete your account setup
      </p>

      <Elements
        stripe={stripePromise}
        options={{
          appearance: {
            theme: 'stripe',
          },
          mode: "setup",
          currency: "usd",
        }}
      >
        <PaymentFormContent />
      </Elements>
    </div>
  );
}
