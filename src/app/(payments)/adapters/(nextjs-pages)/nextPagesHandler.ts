import { createPaidSetupIntentHandler, PaidSetupConfig } from "../../core/setup-intent-route-handler";
import {
  listPaymentMethodsHandler,
  deletePaymentMethodHandler,
  getStripePaymentMethodHandler,
  CardManagementConfig
} from '../../core/card-management-route-handler';

export function createNextPagesSetupIntentHandler(config?: PaidSetupConfig) {
  return async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    return createPaidSetupIntentHandler(
      {
        body: req.body,
        headers: req.headers,
        method: req.method,
      },
      {
        json: (data, status = 200) => res.status(status).json(data),
        error: (message, status) => res.status(status).json({ error: message }),
      },
      config
    );
  };
}

export function createNextPagesListPaymentMethodsHandler(config?: CardManagementConfig) {
  return async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { customerId } = req.query as { customerId: string };
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }

    return listPaymentMethodsHandler(
      {
        body: null,
        headers: req.headers,
        method: req.method,
        params: { customerId },
      },
      {
        json: (data, status = 200) => res.status(status).json(data),
        error: (message, status) => res.status(status).json({ error: message }),
      },
      config
    );
  };
}

export function createNextPagesDeletePaymentMethodHandler(config?: CardManagementConfig) {
  return async function handler(req: any, res: any) {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { customerId, paymentMethodId } = req.query as { customerId: string; paymentMethodId: string };
    const paidPaymentMethodId = paymentMethodId;
    if (!customerId || !paidPaymentMethodId) {
      return res.status(400).json({ error: 'customerId and paymentMethodId are required' });
    }

    return deletePaymentMethodHandler(
      {
        body: req.body,
        headers: req.headers,
        method: req.method,
        params: { customerId, paidPaymentMethodId },
      },
      {
        json: (data, status = 200) => res.status(status).json(data),
        error: (message, status) => res.status(status).json({ error: message }),
      },
      config
    );
  };
}

export function createNextPagesStripePaymentMethodHandler(config?: CardManagementConfig) {
  return async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { customerId, paidPaymentMethodId } = req.query as { customerId: string; paidPaymentMethodId: string };
    if (!customerId || !paidPaymentMethodId) {
      return res.status(400).json({ error: 'customerId and paymentMethodId are required' });
    }

    return getStripePaymentMethodHandler(
      {
        body: null,
        headers: req.headers,
        method: req.method,
        params: { customerId, paidPaymentMethodId },
      },
      {
        json: (data, status = 200) => res.status(status).json(data),
        error: (message, status) => res.status(status).json({ error: message }),
      },
      config
    );
  };
}

