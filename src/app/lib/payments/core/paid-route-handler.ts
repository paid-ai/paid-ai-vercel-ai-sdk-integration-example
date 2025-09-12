// paid-setup-handler.ts - Framework agnostic core handler

export interface RequestContext {
  body: any;
  headers: Record<string, string>;
  method: string;
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

export interface SetupIntentRequest {
  customerId: string;
  confirmationToken: string;
  metadata?: Record<string, any>;
}

export interface SetupIntentResponse {
  data?: any;
  error?: string;
}

/**
 * Generic handler for creating Paid setup intents
 * Framework-agnostic implementation
 */
export async function createPaidSetupIntentHandler(
  request: RequestContext,
  response: ResponseContext,
  config: PaidSetupConfig = {}
): Promise<any> {
  // Validate HTTP method
  if (request.method !== 'POST') {
    return response.error('Method not allowed', 405);
  }

  const {
    paidApiUrl = process.env.PAID_API_URL || 'https://api.agentpaid.io',
    paidApiKey = process.env.PAID_API_KEY || "blah",
    returnUrl = process.env.PAID_RETURN_URL || 'https://paid.ai/blog'
  } = config;

  try {
    // Parse and validate request body
    const { customerId, confirmationToken, metadata } = request.body as SetupIntentRequest;

    if (!customerId || !confirmationToken) {
      return response.error('Customer ID and confirmation token are required', 400);
    }

    if (!paidApiKey) {
      console.error('PAID_API_KEY is not configured');
      return response.error('Server configuration error', 500);
    }

    // Get organization ID from Paid API
    const orgResponse = await fetch(`${paidApiUrl}/api/organizations/organizationId`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paidApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!orgResponse.ok) {
      const errorText = await orgResponse.text();
      console.error('Failed to get orgId:', errorText);
      return response.error('Failed to create setup intent with Paid', orgResponse.status);
    }

    const orgData = await orgResponse.json();
    const organizationId = orgData.data?.organizationId;

    if (!organizationId) {
      console.error('Organization ID not found in response');
      return response.error('Invalid organization response', 500);
    }

    // Create setup intent with Paid
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
          metadata: metadata || {},
          returnUrl,
        }),
      }
    );

    if (!setupIntentResponse.ok) {
      const errorText = await setupIntentResponse.text();
      console.error('Failed to create Paid setup intent:', errorText);
      return response.error('Failed to create setup intent with Paid', setupIntentResponse.status);
    }

    const data = await setupIntentResponse.json();
    return response.json(data, 200);

  } catch (error) {
    console.error('Error calling Paid API:', error);

    // Check if it's a network error or parsing error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return response.error('Network error: Unable to reach Paid API', 503);
    }

    return response.error('Failed to process payment setup', 500);
  }
}
