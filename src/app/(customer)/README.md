# Paid.ai Customer Creation

Add Paid.ai customer creation to your sign-up flow with a single React hook.

## Quick Integration

```typescript
import { usePaidCustomer } from '@paid/customer-creation';

function SignUpPage() {
  const { state, createCustomerAccount } = usePaidCustomer({
    agentId: 'your-agent-id',
    onSuccess: () => router.push('/payment-setup'),
  });

  const handleSignup = async (userData) => {
    // Your existing sign-up logic
    const user = await createLocalUser(userData);
    
    // Add this line to create Paid.ai customer
    await createCustomerAccount({
      name: userData.name,
      email: userData.email,
      external_id: user.id,
    });
  };

  return (
    <form onSubmit={handleSignup}>
      {/* Your existing form */}
      <button disabled={state.loading}>
        {state.loading ? 'Creating...' : 'Sign up'}
      </button>
    </form>
  );
}
```

## Setup
Set environment variables:
```bash
PAID_API_KEY=your_paid_api_key
```
