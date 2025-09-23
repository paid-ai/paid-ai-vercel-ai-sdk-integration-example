import { PaymentProvider } from '../core/payment-provider';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// this import of stripe doesn't mean that integrators are forced to depend on stripe, since if they select another provider
// this implementation file will never be included in the source distribution

export class StripeProvider implements PaymentProvider {
  name = 'stripe';
  private Components: any = {};
  private Hooks: any = {};

  async initialize(publishableKey: string) {
    const { loadStripe } = await import('@stripe/stripe-js');
    return loadStripe(publishableKey);
  }

  getComponents() {
    if (!this.Components.Elements) {
      this.Components.Elements = Elements;
      this.Components.PaymentElement = PaymentElement;
    }
    return this.Components;
  }

  getHooks() {
    if (!this.Hooks.usePaymentProvider) {
      this.Hooks.usePaymentProvider = useStripe;
      this.Hooks.useElements = useElements;
    }
    return this.Hooks;
  }

  getElementsOptions() {
    return {
      appearance: {
        theme: 'stripe',
      },
      mode: "setup",
      currency: "gbp",
    };
  }

  async createConfirmationToken(stripe: any, elements: any) {
    return stripe.createConfirmationToken({ elements });
  }

  async handleNextAction(stripe: any, params: { clientSecret: string }) {
    return stripe.handleNextAction(params);
  }

  async submitElements(elements: any) {
    return elements.submit();
  }
}
