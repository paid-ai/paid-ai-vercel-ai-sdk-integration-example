# Paid.ai Payment Setup

Add Stripe payment collection to your app with a single React component.

## Quick Integration

```typescript
import { PaidPaymentSetupPage } from '@paid/payment-setup';
import { StripeProvider } from '@paid/payment-setup/stripe';

function PaymentSetup() {
  const provider = new StripeProvider();
  
  const handleSuccess = (result) => {
    // Payment method saved - redirect to main app or elsewhere
    router.push('/');
  };

  return (
    <PaidPaymentSetupPage
      customerID={paidCustomerId} // likely collected during sign-up
      publishableKey={process.env.STRIPE_PUBLISHABLE_KEY}
      provider={provider}
      onSuccess={handleSuccess}
    />
  );
}
```

Redirect to this PaymentSetup page whenever you need to collect card payment.

## Setup
Set environment variables:
```bash
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # Your Stripe publishable key
PAID_API_KEY=your_paid_api_key      # From app.paid.ai
```
