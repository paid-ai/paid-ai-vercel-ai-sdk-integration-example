import { createContext, useContext } from 'react';
import { PaymentProvider } from './payment-provider';

const PaymentProviderContext = createContext<PaymentProvider | null>(null);

export function usePaymentProvider() {
  const context = useContext(PaymentProviderContext);
  if (!context) {
    throw new Error('usePaymentProvider must be used within PaymentProviderContext');
  }
  const hooks = context.getHooks();
  return hooks.usePaymentProvider();
}

export function usePaymentElements() {
  const context = useContext(PaymentProviderContext);
  if (!context) {
    throw new Error('usePaymentElements must be used within PaymentProviderContext');
  }
  const hooks = context.getHooks();
  return hooks.useElements();
}

export const PaymentProviderContextProvider = PaymentProviderContext.Provider;
