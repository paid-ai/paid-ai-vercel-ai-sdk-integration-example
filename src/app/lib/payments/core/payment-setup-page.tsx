import React from 'react';
import { PaymentResult } from './types';
import { PaymentProvider } from './payment-provider';
import { PaymentProviderContextProvider, usePaymentElements, usePaymentProvider } from './payment-context';
import { usePaymentSetup } from './use-payment-setup';

type PaymentSetupConfig = {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

type PaymentSetupFormProps = {
  customerID: string;
  provider: PaymentProvider;
  publishableKey: string;
  apiEndpoint: string;
  handlers?: PaymentSetupConfig;
  className?: string;
}

type PaymentSetupPageProps = {
  customerID: string;
  provider: PaymentProvider;
  publishableKey?: string;
  apiEndpoint?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

function PaymentFormContent({
  customerID,
  provider,
  apiEndpoint,
  handlers = {},
  className = "",
}: Omit<PaymentSetupFormProps, 'publishableKey'>) {
  const paymentProvider = usePaymentProvider();
  const elements = usePaymentElements();

  const { state, setupPayment, resetError } = usePaymentSetup({
    customerID,
    provider,
    apiEndpoint,
    onSuccess: handlers.onSuccess,
    onError: handlers.onError,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProvider || !elements) {
      return;
    }

    await setupPayment(paymentProvider, elements);
  };

  const { PaymentElement } = provider.getComponents();

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
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

      {state.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-start">
            <span>{state.error}</span>
            <button
              type="button"
              onClick={resetError}
              className="ml-2 text-red-500 hover:text-red-700 text-sm"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!paymentProvider || state.isProcessing}
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.isProcessing ? 'Processing...' : 'Save Payment Method'}
      </button>
    </form>
  );
}

export function PaymentSetupForm({
  customerID,
  provider,
  publishableKey,
  apiEndpoint,
  handlers = {},
}: PaymentSetupFormProps) {
  const [providerInstance, setProviderInstance] = React.useState<any>(null);
  const { Elements } = provider.getComponents();

  React.useEffect(() => {
    provider.initialize(publishableKey).then(setProviderInstance);
  }, [provider, publishableKey]);

  if (!providerInstance) {
    return <div>Loading payment provider...</div>;
  }

  return (
    <PaymentProviderContextProvider value={provider}>
      <Elements
        stripe={providerInstance}
        options={provider.getElementsOptions()}
      >
        <PaymentFormContent
          customerID={customerID}
          provider={provider}
          apiEndpoint={apiEndpoint}
          handlers={handlers}
        />
      </Elements>
    </PaymentProviderContextProvider>
  );
}

export function PaidPaymentSetupPage({
  customerID,
  provider,
  publishableKey = "pk_live_51S2vuU6VZ0JAwqpDJUwAOC5fbyQo4S2axB986wbh2V9zZym2WqkraGVwhNdTFkbMtrNPt8j8oXrVAKqCqzeZlzOM00ONr4knZ6",
  apiEndpoint = "/api/paid-setup-intent",
  onSuccess,
  onError,
}: PaymentSetupPageProps) {

  return (
    <div className={`flex flex-col w-full max-w-md py-24 mx-auto stretch`}>
      <h1 className="text-2xl font-bold mb-8 text-center">Setup Payment</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center">
        Add a payment method to complete your account setup
      </p>

      <PaymentSetupForm
        customerID={customerID}
        provider={provider}
        publishableKey={publishableKey}
        apiEndpoint={apiEndpoint}
        handlers={{
          onSuccess,
          onError,
        }}
      />
    </div>
  );
}
