import { useState, useCallback } from 'react';
import { CustomerData, CreateCustomerResponse, CreateCustomerRequest } from './create-customer-handler';
import { paidConfig } from '../../paid.config';

export interface UseCustomerCreationOptions {
  apiEndpoint?: string;
  agentId?: string;
  orderConfig?: CreateCustomerRequest['orderConfig'];
  onSuccess?: (result: CreateCustomerResponse) => void;
  onError?: (error: string) => void;
}

export interface CustomerCreationState {
  isCreating: boolean;
  error: string | null;
  result: CreateCustomerResponse | null;
}

export interface UseCustomerCreationResult {
  state: CustomerCreationState;
  createCustomerAccount: (customerData?: CustomerData) => Promise<CreateCustomerResponse | null>;
  resetError: () => void;
  reset: () => void;
}

export async function createCustomer(
  apiEndpoint: string,
  data?: CustomerData,
  options?: {
    agentId?: string;
    orderConfig?: CreateCustomerRequest['orderConfig'];
  }
): Promise<CreateCustomerResponse> {
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerData: data,
      agentId: options?.agentId,
      orderConfig: options?.orderConfig,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create customer' }));
    throw new Error(error.error || 'Failed to create customer');
  }

  return response.json();
}

export function usePaidCustomer({
  agentId = paidConfig.agentId,
  orderConfig,
  onSuccess,
  onError,
  apiEndpoint = '/api/create-customer',
}: UseCustomerCreationOptions): UseCustomerCreationResult {

  const [state, setState] = useState<CustomerCreationState>({
    isCreating: false,
    error: null,
    result: null,
  });

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isCreating: false,
      error: null,
      result: null,
    });
  }, []);

  const createCustomerAccount = useCallback(async (customerData?: CustomerData): Promise<CreateCustomerResponse | null> => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));

    try {
      const result = await createCustomer(apiEndpoint, customerData, {
        agentId,
        orderConfig,
      });

      setState(prev => ({
        ...prev,
        isCreating: false,
        result,
      }));

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';

      setState(prev => ({
        ...prev,
        isCreating: false,
        error: errorMessage,
      }));

      if (onError) {
        onError(errorMessage);
      }

      return null;
    }
  }, [apiEndpoint, agentId, orderConfig, onSuccess, onError]);

  return {
    state,
    createCustomerAccount,
    resetError,
    reset,
  };
}
