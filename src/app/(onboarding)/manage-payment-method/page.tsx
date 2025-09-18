'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect } from 'react';
import { PaidCardManagementPage } from '@/app/(payments)/core/card-management';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51S2vuU6VZ0JAwqpDJUwAOC5fbyQo4S2axB986wbh2V9zZym2WqkraGVwhNdTFkbMtrNPt8j8oXrVAKqCqzeZlzOM00ONr4knZ6';

export default function ManagePaymentMethod() {
  const router = useRouter();
  const { isLoggedIn, userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !userData) {
      router.push('/sign-up');
    }
  }, [isLoading, userData, router]);

  return (
    isLoggedIn && userData &&
    <PaidCardManagementPage
      customerId={userData.customerId}
      publishableKey={STRIPE_PUBLISHABLE_KEY}
    />
  );
}
