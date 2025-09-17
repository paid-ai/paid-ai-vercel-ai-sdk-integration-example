'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStore } from '@/app/utils/userStore';
import { useEffect } from 'react';
import { StripeProvider } from '@/app/(payments)/payment-providers/stripe';
import { PaymentResult } from '@/app/(payments)/core/types';
import { PaidPaymentSetupPage } from '@/app/(payments)/core/payment-setup-page';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51S2vuU6VZ0JAwqpDJUwAOC5fbyQo4S2axB986wbh2V9zZym2WqkraGVwhNdTFkbMtrNPt8j8oXrVAKqCqzeZlzOM00ONr4knZ6';

export default function PaymentSetup() {
  const router = useRouter();
  const { isLoggedIn, userData, isLoading } = useAuth();
  const provider = new StripeProvider();

  const handleSuccess = (result: PaymentResult) => {
    if (!userData) return;
    userStore.updateUser(userData?.customerId, {
      "confirmationTokenId": result.confirmationToken,
      "paymentProcessed": true,
    });
    console.log('Payment setup successful:', result);
    router.push('/');
  };

  const handleError = (error: string) => {
    console.error('Payment setup error:', error);
  };

  useEffect(() => {
    if (!isLoading && !userData) {
      router.push('/sign-up');
    }
  }, [isLoading, userData, router]);

  return (
    isLoggedIn && userData &&
    <PaidPaymentSetupPage
      customerID={userData.customerId}
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      provider={provider}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
