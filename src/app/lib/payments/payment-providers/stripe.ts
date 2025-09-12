import { PaymentProvider } from '../core/payment-provider';

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
      const stripeReact = require('@stripe/react-stripe-js');
      this.Components.Elements = stripeReact.Elements;
      this.Components.PaymentElement = stripeReact.PaymentElement;
    }
    return this.Components;
  }

  getHooks() {
    if (!this.Hooks.usePaymentProvider) {
      const stripeReact = require('@stripe/react-stripe-js');
      this.Hooks.usePaymentProvider = stripeReact.useStripe;
      this.Hooks.useElements = stripeReact.useElements;
    }
    return this.Hooks;
  }

  getElementsOptions() {
    return {
      appearance: {
        theme: 'stripe',
      },
      mode: "setup",
      currency: "usd",
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
