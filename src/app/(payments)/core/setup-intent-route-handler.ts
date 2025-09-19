// paid-setup-handler.ts - Framework agnostic core handler

import { getOrganizationId } from "./utils";
import { paidConfig } from "../../paid.config";

export interface SetupIntentRequestContext {
  body: SetupIntentRequest;
  headers: Record<string, string>;
  method: 'POST';
}

export interface ResponseContext {
  json: (data: any, status?: number) => any;
  error: (message: string, status: number) => any;
}

export interface PaidSetupConfig {
  paidApiUrl?: string;
  paidApiKey?: string;
  returnUrl?: string;
}

export interface SwapPaymentMethodRequest {
  customerId: string;
  oldPaidPaymentMethodId: string;
  confirmationToken: string;
  metadata?: Record<string, any>;
}

export interface SwapPaymentMethodRequestContext {
  body: SwapPaymentMethodRequest;
  headers: Record<string, string>;
  method: 'POST';
}

export interface SwapPaymentMethodResponse {
  data: {
    newPaymentMethod: any;
    oldPaymentMethodDeleted: boolean;
    message: string;
  };
  message: string;
}

export interface SetupIntentRequest {
  customerId: string;
  confirmationToken: string;
  metadata?: Record<string, any>;
}

export interface SetupIntentSuccessResponse {
  data: {
    setupIntent: {
      id: string;
      client_secret: string;
      status: string;
      usage: string;
      customer: string;
    };
    message: string;
  };
}

export interface SetupIntentErrorResponse {
  error: string;
  status: number;
}

async function createSetupIntent(
  organizationId: string,
  customerId: string,
  confirmationToken: string,
  paidApiUrl: string,
  paidApiKey: string,
  returnUrl: string,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  try {
    const setupIntentResponse = await fetch(
      `${paidApiUrl}/api/organizations/${organizationId}/payments/setup-intents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paidApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          confirmationToken,
          metadata,
          returnUrl,
        }),
      }
    );

    if (!setupIntentResponse.ok) {
      const errorText = await setupIntentResponse.text();
      console.error('Failed to create setup intent:', errorText);
      return {
        success: false,
        error: 'Failed to create setup intent with Paid',
        status: setupIntentResponse.status
      };
    }

    const data = await setupIntentResponse.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return {
      success: false,
      error: 'Failed to create setup intent',
      status: 500
    };
  }
}

/**
 * Generic handler for creating Paid setup intents
 * Framework-agnostic implementation
 */
export async function createPaidSetupIntentHandler(
  request: SetupIntentRequestContext,
  response: ResponseContext,
  config: PaidSetupConfig = {}
): Promise<Response> {
  if (request.method !== 'POST') {
    return response.error('Method not allowed', 405);
  }

  const {
    paidApiUrl = process.env.PAID_API_URL || 'https://api.agentpaid.io',
    paidApiKey = process.env.PAID_API_KEY || paidConfig.paidApiKey,
    returnUrl = process.env.PAID_RETURN_URL || 'https://paid.ai/blog'
  } = config;

  const { customerId, confirmationToken, metadata } = request.body;

  if (!customerId || !confirmationToken) {
    return response.error('Customer ID and confirmation token are required', 400);
  }

  if (!paidApiKey) {
    console.error('PAID_API_KEY is not configured');
    return response.error('Server configuration error', 500);
  }

  try {
    const organizationId = await getOrganizationId(paidApiUrl, paidApiKey);
    if (!organizationId) {
      return response.error('Organization not found', 500);
    }

    const result = await createSetupIntent(
      organizationId,
      customerId,
      confirmationToken,
      paidApiUrl,
      paidApiKey,
      returnUrl,
      metadata || {}
    );

    if (!result.success) {
      return response.error(result.error || 'Failed to create setup intent', result.status || 500);
    }

    return response.json(result.data, 200);

  } catch (error) {
    console.error('Error calling Paid API:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return response.error('Network error: Unable to reach Paid API', 503);
    }

    return response.error('Failed to process payment setup', 500);
  }
}

/**
 * Handler for swapping payment methods atomically
 * Creates new payment method first, then deletes old one
 */
export async function swapPaymentMethodHandler(
  request: SwapPaymentMethodRequestContext,
  response: ResponseContext,
  config: PaidSetupConfig = {}
): Promise<Response> {
  if (request.method !== 'POST') {
    return response.error('Method not allowed', 405);
  }

  const {
    paidApiUrl = process.env.PAID_API_URL || 'https://api.agentpaid.io',
    paidApiKey = process.env.PAID_API_KEY || paidConfig.paidApiKey,
    returnUrl = process.env.PAID_RETURN_URL || 'https://paid.ai/blog',
  } = config;

  const { customerId, oldPaidPaymentMethodId, confirmationToken, metadata } = request.body;

  if (!customerId || !oldPaidPaymentMethodId || !confirmationToken || !paidApiKey) {
    return response.error('Missing required parameters', 400);
  }

  try {
    const organizationId = await getOrganizationId(paidApiUrl, paidApiKey);
    if (!organizationId) {
      return response.error('Organization not found', 500);
    }

    // Step 1: Add new payment method via setup intent
    const setupResult = await createSetupIntent(
      organizationId,
      customerId,
      confirmationToken,
      paidApiUrl,
      paidApiKey,
      returnUrl,
      metadata || {}
    );

    if (!setupResult.success) {
      return response.error(setupResult.error || 'Failed to add new payment method', setupResult.status || 500);
    }

    // Step 2: Delete old payment method only if new one was added successfully
    let oldPaymentMethodDeleted = false;
    try {
      const deleteResponse = await fetch(
        `${paidApiUrl}/api/organizations/${organizationId}/customer/${customerId}/payment-methods/${oldPaidPaymentMethodId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${paidApiKey}` },
        }
      );

      if (deleteResponse.ok) {
        oldPaymentMethodDeleted = true;
      } else {
        console.warn('Failed to delete old payment method, but new one was added successfully');
      }
    } catch (deleteError) {
      console.warn('Error deleting old payment method:', deleteError);
    }

    return response.json({
      data: {
        newPaymentMethod: setupResult.data,
        oldPaymentMethodDeleted,
        message: oldPaymentMethodDeleted
          ? 'Payment method swapped successfully'
          : 'New payment method added, but failed to remove old one',
      },
      message: 'Payment method swap completed',
    }, 200);

  } catch (error) {
    console.error('Error in swap payment method:', error);
    return response.error('Failed to swap payment method', 500);
  }
}
