import { Paid, PaidClient } from "@paid-ai/paid-node";
import { paidConfig } from "../../paid.config";

interface CompleteCustomerData {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  metadata: Record<string, any>;
}

export interface CustomerData {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

export interface CreateCustomerRequest {
  customerData?: CustomerData;
  agentId?: string;
  orderConfig?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    currency?: string;
    orderLineName?: string;
    orderLineDescription?: string;
  };
}

export interface CreateCustomerResponse {
  customerId: string;
  externalId: string;
  contactId?: string;
  orderId?: string;
}

export interface RequestContext {
  body: any;
  headers: Record<string, string>;
  method: string;
}

export interface ResponseContext {
  json: (data: any, status?: number) => any;
  error: (message: string, status: number) => any;
}

function generateOrderDefaults(orderConfig?: {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
  orderLineName?: string;
  orderLineDescription?: string;
}) {
  const startDate = orderConfig?.startDate || new Date().toISOString().split('T')[0];
  const duration = 9999; // Default duration in days
  const endDate = orderConfig?.endDate ||
    new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    name: orderConfig?.name || 'Agent subscription',
    description: orderConfig?.description || 'Annual subscription for agent services',
    startDate,
    endDate,
    currency: orderConfig?.currency || 'GBP',
    orderLineName: orderConfig?.orderLineName || 'Agent subscription order line',
    orderLineDescription: orderConfig?.orderLineDescription || '',
  };
}

function generatePlaceholders(data: CustomerData): CompleteCustomerData {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);

  return {
    email: data.email || `user_${timestamp}@example.com`,
    name: data.name || `User ${randomId}`,
    firstName: data.firstName || data.name?.split(' ')[0] || 'Joe',
    lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || 'Bloggs',
    company: data.company || '',
    phone: data.phone || '',
    address: {
      line1: data.address?.line1 || '123 Placeholder Street',
      line2: data.address?.line2 || '',
      city: data.address?.city || 'London',
      state: data.address?.state || 'London',
      zipCode: data.address?.zipCode || '94105',
      country: data.address?.country || 'UK',
    },
    metadata: data.metadata || {},
  };
}

/**
 * Generic handler for creating Paid customers
 * Framework-agnostic implementation with flexible field support
 */
export async function createCustomerHandler(
  request: RequestContext,
  response: ResponseContext,
): Promise<any> {
  if (request.method !== 'POST') {
    return response.error('Method not allowed', 405);
  }

  const paidApiKey = process.env.PAID_API_KEY || paidConfig.paidApiKey;
  const paidApiURL = process.env.PAID_API_URL || "https://api.agentpaid.io";

  if (!paidApiKey) {
    console.error('PAID_API_KEY is not configured');
    return response.error('Server configuration error', 500);
  }

  try {
    const requestData = request.body as CreateCustomerRequest;
    const customerData = requestData.customerData || {};
    const dataFilledIn: CompleteCustomerData = generatePlaceholders(customerData);

    const externalId = crypto.randomUUID();

    const paidClient = new PaidClient({ token: paidApiKey, baseUrl: `${paidApiURL}/api/v1` });

    let customer;
    try {
      customer = await paidClient.customers.create({
        name: dataFilledIn.name,
        externalId: externalId,
        billingAddress: {
          line1: dataFilledIn.address.line1,
          line2: dataFilledIn.address.line2,
          city: dataFilledIn.address.city,
          state: dataFilledIn.address.state,
          zipCode: dataFilledIn.address.zipCode,
          country: dataFilledIn.address.country,
        },
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer in Paid system');
    }

    let contact;
    try {
      const salutation = Paid.Salutation.Mr;

      contact = await paidClient.contacts.create({
        customerExternalId: externalId,
        salutation: salutation as any,
        firstName: dataFilledIn.firstName,
        lastName: dataFilledIn.lastName,
        email: dataFilledIn.email,
        phone: dataFilledIn.phone,
        billingStreet: dataFilledIn.address.line1,
        billingCity: dataFilledIn.address.city,
        billingCountry: dataFilledIn.address.country,
        billingPostalCode: dataFilledIn.address.zipCode,
      });
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact in Paid system');
    }

    if (!contact.id) {
      throw new Error('Contact created but missing ID');
    }

    let order;
    const agentId = requestData.agentId;

    // Create order if agent ID is provided
    if (agentId) {
      const completeOrderConfig = generateOrderDefaults(requestData.orderConfig);

      try {
        order = await paidClient.orders.create({
          customerId: customer.id,
          customerExternalId: externalId,
          billingContactId: contact.id,
          name: completeOrderConfig.name,
          description: completeOrderConfig.description,
          startDate: completeOrderConfig.startDate,
          endDate: completeOrderConfig.endDate,
          currency: completeOrderConfig.currency,
          orderLines: [{
            agentExternalId: agentId,
            name: completeOrderConfig.orderLineName,
            description: completeOrderConfig.orderLineDescription,
          }]
        });

        if (!order.id) {
          throw new Error('no order id');
        }

        await paidClient.orders.activate(order.id);
      } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('failed to create order');
      }
    }

    // Return success response
    const responseData: CreateCustomerResponse = {
      customerId: customer.id,
      externalId: externalId,
      contactId: contact.id,
      orderId: order?.id,
    };

    return response.json(responseData, 201);

  } catch (error) {
    console.error('Error in customer creation handler:', error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return response.error('Network error: Unable to reach Paid API', 503);
    }

    // Return specific error message if available
    const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
    return response.error(errorMessage, 500);
  }
}
