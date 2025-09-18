import { createCustomerHandler } from "../core/create-customer-handler";

export function createNextPagesCustomerHandler() {
  return async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    return createCustomerHandler(
      {
        body: req.body,
        headers: req.headers,
        method: req.method,
      },
      {
        json: (data, status = 200) => res.status(status).json(data),
        error: (message, status) => res.status(status).json({ error: message }),
      },
    );
  };
}
