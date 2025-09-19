import { getOrganizationId } from "./utils";

export interface BaseRequestContext {
  body: any;
  headers: Record<string, string>;
  method: string;
}

export interface ListPaymentMethodsRequest extends BaseRequestContext {
  params: {
    customerId: string;
  };
}

export interface PaymentMethodRequest extends BaseRequestContext {
  params: {
    customerId: string;
    paidPaymentMethodId: string;
  };
}


export interface ResponseContext {
  json: (data: any, status?: number) => any;
  error: (message: string, status: number) => any;
}

export interface CardManagementConfig {
  paidApiUrl?: string;
  paidApiKey?: string;
  returnUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentMethodsResponse {
  data: PaymentMethod[];
  message: string;
}

export interface DeletePaymentMethodResponse {
  data: { success: boolean };
  message: string;
}

export interface StripePaymentMethodResponse {
  data: {
    id: string;
    object: string;
    card: {
      brand: string;
      checks: Record<string, string>;
      country: string;
      exp_month: number;
      exp_year: number;
      fingerprint: string;
      funding: string;
      last4: string;
    };
  };
  message: string;
}

export async function listPaymentMethodsHandler(
  request: ListPaymentMethodsRequest,
  response: ResponseContext,
  config: CardManagementConfig = {}
): Promise<Response> {
  if (request.method !== 'GET') {
    return response.error('Method not allowed', 405);
  }

  const {
    paidApiUrl = process.env.PAID_API_URL || 'https://api.agentpaid.io',
    paidApiKey = process.env.PAID_API_KEY,
  } = config;

  const { customerId } = request.params;

  if (!customerId || !paidApiKey) {
    return response.error('Missing required parameters', 400);
  }

  try {
    const organizationId = await getOrganizationId(paidApiUrl, paidApiKey);

    if (!organizationId) {
      return response.error('Organization not found', 500);
    }

    const apiResponse = await fetch(
      `${paidApiUrl}/api/organizations/${organizationId}/customer/${customerId}/payment-methods`,
      {
        headers: { 'Authorization': `Bearer ${paidApiKey}` },
      }
    );
    const data = await apiResponse.json();
    return response.json(data, apiResponse.status);
  } catch (error) {
    return response.error('Failed to fetch payment methods', 500);
  }
}

export async function deletePaymentMethodHandler(
  request: PaymentMethodRequest,
  response: ResponseContext,
  config: CardManagementConfig = {}
): Promise<Response> {
  if (request.method !== 'DELETE') {
    return response.error('Method not allowed', 405);
  }

  const {
    paidApiUrl = process.env.PAID_API_URL || 'https://api.agentpaid.io',
    paidApiKey = process.env.PAID_API_KEY,
  } = config;

  const { customerId, paidPaymentMethodId } = request.params;

  if (!customerId || !paidPaymentMethodId || !paidApiKey) {
    return response.error('Missing required parameters', 400);
  }

  try {
    const organizationId = await getOrganizationId(paidApiUrl, paidApiKey);

    if (!organizationId) {
      return response.error('Organization not found', 500);
    }

    // Check how many payment methods the customer has
    const listResponse = await fetch(
      `${paidApiUrl}/api/organizations/${organizationId}/customer/${customerId}/payment-methods`,
      {
        headers: { 'Authorization': `Bearer ${paidApiKey}` },
      }
    );

    if (!listResponse.ok) {
      return response.error('Failed to check existing payment methods', listResponse.status);
    }

    const listData = await listResponse.json();
    const paymentMethods = listData.data || [];

    if (paymentMethods.length <= 1) {
      return response.error('Cannot delete the only payment method. Please add another payment method before removing this one.', 400);
    }

    const apiResponse = await fetch(
      `${paidApiUrl}/api/organizations/${organizationId}/customer/${customerId}/payment-methods/${paidPaymentMethodId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${paidApiKey}` },
      }
    );

    const data = await apiResponse.json();
    return response.json(data, apiResponse.status);
  } catch (error) {
    return response.error('Failed to delete payment method', 500);
  }
}

export async function getStripePaymentMethodHandler(
  request: PaymentMethodRequest,
  response: ResponseContext,
  config: CardManagementConfig = {}
): Promise<Response> {
  if (request.method !== 'GET') {
    return response.error('Method not allowed', 405);
  }

  const {
    paidApiUrl = process.env.PAID_API_URL || 'https://api.agentpaid.io',
    paidApiKey = process.env.PAID_API_KEY,
  } = config;

  const { customerId, paidPaymentMethodId } = request.params;

  if (!customerId || !paidPaymentMethodId || !paidApiKey) {
    return response.error('Missing required parameters', 400);
  }

  try {
    const organizationId = await getOrganizationId(paidApiUrl, paidApiKey);

    if (!organizationId) {
      return response.error('Organization not found', 500);
    }

    const apiResponse = await fetch(
      `${paidApiUrl}/api/organizations/${organizationId}/customer/${customerId}/payment-methods/${paidPaymentMethodId}/stripe`,
      {
        headers: { 'Authorization': `Bearer ${paidApiKey}` },
      }
    );

    const data = await apiResponse.json();
    return response.json(data, apiResponse.status);
  } catch (error) {
    return response.error('Failed to fetch stripe payment method', 500);
  }
}

