import React from 'react';

export interface PaymentProvider {
  name: string;

  // Initialize the provider (like loadStripe)
  initialize(publishableKey: string): Promise<any>;

  // Get provider-specific components
  getComponents(): {
    Elements: React.ComponentType<any>;
    PaymentElement: React.ComponentType<any>;
  };

  // Get Elements options for the provider
  getElementsOptions(): any;

  // Get provider hooks
  getHooks(): {
    usePaymentProvider: () => any;  // replaces useStripe
    useElements: () => any;
  };

  // Provider methods matching Stripe's API
  createConfirmationToken(provider: any, elements: any): Promise<{
    error?: { message?: string };
    confirmationToken?: { id: string };
  }>;

  handleNextAction(provider: any, params: { clientSecret: string }): Promise<{
    error?: { message?: string };
  }>;

  submitElements(elements: any): Promise<{
    error?: { message?: string };
  }>;
}
