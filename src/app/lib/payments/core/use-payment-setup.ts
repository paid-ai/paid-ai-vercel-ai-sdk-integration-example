import { useState, useCallback } from 'react';
import { PaymentResult } from './types';
import { PaymentProvider } from './payment-provider';

type PaymentSetupState = {
  isProcessing: boolean;
  error: string | null;
  isComplete: boolean;
}

type UsePaymentSetupOptions = {
  customerID: string;
  provider: PaymentProvider;
  apiEndpoint: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

type UsePaymentSetupResult = {
  state: PaymentSetupState;
  setupPayment: (stripe: any, elements: any) => Promise<void>;
  resetError: () => void;
}

export function usePaymentSetup(options: UsePaymentSetupOptions): UsePaymentSetupResult {
  const {
    customerID,
    provider,
    apiEndpoint,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<PaymentSetupState>({
    isProcessing: false,
    error: null,
    isComplete: false,
  });

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setupPayment = useCallback(async (stripe: any, elements: any) => {
    if (!stripe || !elements || !customerID) {
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const { error: submitError } = await provider.submitElements(elements);
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: tokenError, confirmationToken } = await provider.createConfirmationToken(stripe, elements);

      if (tokenError) {
        throw new Error(tokenError.message || 'Failed to create confirmation token');
      }

      if (!confirmationToken) {
        throw new Error('No confirmation token received');
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerID,
          confirmationToken: confirmationToken.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment with Paid');
      }

      const paidResponse = await response.json();

      const si = paidResponse?.data?.setup_intent;
      let finalStatus = si?.status || 'succeeded';

      if (si?.status === 'requires_action') {
        const { error: nextErr } = await provider.handleNextAction(stripe, {
          clientSecret: si.client_secret,
        });
        if (nextErr) {
          throw new Error(nextErr.message || 'Authentication failed');
        }
        finalStatus = 'succeeded';
      }

      const result: PaymentResult = {
        confirmationToken: confirmationToken.id,
        setupIntentStatus: finalStatus,
        setupIntentClientSecret: si?.client_secret,
      };

      setState(prev => ({ ...prev, isProcessing: false, isComplete: true }));

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment setup failed';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        isComplete: false
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [customerID, provider, apiEndpoint, onSuccess, onError]);

  return {
    state,
    setupPayment,
    resetError,
  };
}
