'use client';

import { useState, useEffect, useMemo } from 'react';
import { StripeProvider } from '../payment-providers/stripe';
import { PaidPaymentSetupPage } from './payment-setup-page';

interface PaymentMethodListItem {
  id: string;
  createdAt: string;
  UpdatedAt: string;
  OrganizationID: string;
  CustomerID: string;
  GatewayAccountID: string;
  ExternalPaymentMethodID: string;
}

interface PaymentMethod extends PaymentMethodListItem {
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  link?: {
    email: string;
  };
  paypal?: {
    payer_email: string;
  };
}

interface CardManagementProps {
  customerId: string;
  publishableKey: string;
  listEndpoint: string;
}

interface PaidCardManagementPageProps {
  customerId: string;
  publishableKey: string;
}

export function PaidCardManagementPage({
  customerId,
  publishableKey,
}: PaidCardManagementPageProps) {
  return (
    <CardManagement
      customerId={customerId}
      publishableKey={publishableKey}
      listEndpoint="/api/paid-list-payment-methods"
    />
  );
}

function CardManagement({
  customerId,
  publishableKey,
  listEndpoint
}: CardManagementProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [replacingPaymentMethodId, setReplacingPaymentMethodId] = useState<string | null>(null);

  const provider = useMemo(() => new StripeProvider(), []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${listEndpoint}?customerId=${customerId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const listData = await response.json();
      const paymentMethodList: PaymentMethodListItem[] = listData.data || [];

      // Fetch detailed card info for each payment method
      const detailedMethods = await Promise.all(
        paymentMethodList.map(async (method) => {
          try {
            const detailResponse = await fetch(
              `/api/paid-get-payment-method?customerId=${customerId}&paymentMethodId=${method.id}`
            );

            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              const paymentMethodData = detailData.data;

              return {
                ...method,
                type: paymentMethodData?.type || 'unknown',
                card: paymentMethodData?.card ? {
                  brand: paymentMethodData.card.brand,
                  last4: paymentMethodData.card.last4,
                  exp_month: paymentMethodData.card.exp_month,
                  exp_year: paymentMethodData.card.exp_year,
                } : undefined,
                link: paymentMethodData?.link ? {
                  email: paymentMethodData.link.email,
                } : undefined,
                paypal: paymentMethodData?.paypal ? {
                  payer_email: paymentMethodData.paypal.payer_email,
                } : undefined,
              };
            }

            // Fallback if detail fetch fails
            return {
              ...method,
              type: 'unknown',
            };
          } catch {
            // Fallback for individual fetch errors
            return {
              ...method,
              type: 'unknown',
            };
          }
        })
      );

      setPaymentMethods(detailedMethods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const replacePaymentMethod = (oldPaidPaymentMethodId: string) => {
    setReplacingPaymentMethodId(oldPaidPaymentMethodId);
    setShowPaymentSetup(true);
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/paid-delete-payment-method', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment method');
      }

      await fetchPaymentMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
    }
  };

  const handlePaymentSetupSuccess = async () => {
    setShowPaymentSetup(false);
    setReplacingPaymentMethodId(null);
    await fetchPaymentMethods();
  };

  const handlePaymentSetupError = () => {
    setShowPaymentSetup(false);
    setReplacingPaymentMethodId(null);
  };

  useEffect(() => {
    if (customerId) {
      fetchPaymentMethods();
    }
  }, [customerId]);

  if (showPaymentSetup) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => {
              setShowPaymentSetup(false);
              setReplacingPaymentMethodId(null);
            }}
            className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Back to Payment Methods
          </button>
        </div>
        <PaidPaymentSetupPage
          customerID={customerId}
          publishableKey={publishableKey}
          provider={provider}
          apiEndpoint={replacingPaymentMethodId ? "/api/paid-swap-payment-method" : undefined}
          oldPaidPaymentMethodId={replacingPaymentMethodId || undefined}
          onSuccess={handlePaymentSetupSuccess}
          onError={handlePaymentSetupError}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading payment methods...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="text-red-800 font-medium">Error</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={fetchPaymentMethods}
          className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Payment Methods</h1>
      <div className="border border-gray-200 rounded-lg p-6">

        {paymentMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-6">No payment methods found</div>
            <button
              onClick={() => setShowPaymentSetup(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Payment Method
            </button>
          </div>
        )}

        {paymentMethods.length > 0 && (
          <div className="space-y-4">
            {paymentMethods.map((paymentMethod: PaymentMethod) => (
              <div
                key={paymentMethod.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      {paymentMethod.type}
                    </span>
                  </div>
                  <div>
                    {paymentMethod.type === 'card' && paymentMethod.card ? (
                      <>
                        <div className="font-medium">
                          {paymentMethod.card.brand} •••• •••• •••• {paymentMethod.card.last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
                        </div>
                      </>
                    ) : paymentMethod.type === 'link' && paymentMethod.link ? (
                      <>
                        <div className="font-medium">Link</div>
                        <div className="text-sm text-gray-500">
                          {paymentMethod.link.email}
                        </div>
                      </>
                    ) : paymentMethod.type === 'paypal' && paymentMethod.paypal ? (
                      <>
                        <div className="font-medium">PayPal</div>
                        <div className="text-sm text-gray-500">
                          {paymentMethod.paypal.payer_email}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium">{paymentMethod.type}</div>
                        <div className="text-sm text-gray-500">Payment method</div>
                      </>
                    )}
                  </div>
                </div>

                {paymentMethods.length > 1 ? (
                  <button
                    onClick={() => deletePaymentMethod(paymentMethod.id)}
                    className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    onClick={() => replacePaymentMethod(paymentMethod.id)}
                    className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    Replace
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {paymentMethods.length > 0 && (
          <div className="pt-4">
            <button
              onClick={fetchPaymentMethods}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
