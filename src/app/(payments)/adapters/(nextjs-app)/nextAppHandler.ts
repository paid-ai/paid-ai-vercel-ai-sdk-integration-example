import { createPaidSetupIntentHandler, PaidSetupConfig, swapPaymentMethodHandler } from '../../core/setup-intent-route-handler';
import {
  listPaymentMethodsHandler,
  deletePaymentMethodHandler as coreDeletePaymentMethodHandler,
  getStripePaymentMethodHandler,
  CardManagementConfig
} from '../../core/card-management-route-handler';


export function postSetupIntentHandler(config?: PaidSetupConfig) {
  return async function POST(request: Request) {
    const { NextResponse } = await import('next/server');

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => headers[key] = value);

    return createPaidSetupIntentHandler(
      { body, headers, method: 'POST' as const },
      {
        json: (data, status = 200) => NextResponse.json(data, { status }),
        error: (message, status) => NextResponse.json({ error: message }, { status }),
      },
      config
    );
  };
}

export function getPaymentMethodsHandler(config?: CardManagementConfig) {
  return async function GET(request: Request) {
    const { NextResponse } = await import('next/server');

    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => headers[key] = value);

    return listPaymentMethodsHandler(
      { body: null, headers, method: 'GET' as const, params: { customerId } },
      {
        json: (data, status = 200) => NextResponse.json(data, { status }),
        error: (message, status) => NextResponse.json({ error: message }, { status }),
      },
      config
    );
  };
}

export function deletePaymentMethodHandler(config?: CardManagementConfig) {
  return async function DELETE(request: Request) {
    const { NextResponse } = await import('next/server');

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { customerId, paymentMethodId } = body;

    const paidPaymentMethodId = paymentMethodId;
    if (!customerId || !paidPaymentMethodId) {
      return NextResponse.json({ error: 'customerId and paymentMethodId are required' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => headers[key] = value);

    return coreDeletePaymentMethodHandler(
      { body: null, headers, method: 'DELETE' as const, params: { customerId, paidPaymentMethodId } },
      {
        json: (data, status = 200) => NextResponse.json(data, { status }),
        error: (message, status) => NextResponse.json({ error: message }, { status }),
      },
      config
    );
  };
}

export function getPaymentMethodHandler(config?: CardManagementConfig) {
  return async function GET(request: Request) {
    const { NextResponse } = await import('next/server');

    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');
    const paidPaymentMethodId = url.searchParams.get('paymentMethodId');

    if (!customerId || !paidPaymentMethodId) {
      return NextResponse.json({ error: 'customerId and paymentMethodId are required' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => headers[key] = value);

    return getStripePaymentMethodHandler(
      { body: null, headers, method: 'GET' as const, params: { customerId, paidPaymentMethodId } },
      {
        json: (data, status = 200) => NextResponse.json(data, { status }),
        error: (message, status) => NextResponse.json({ error: message }, { status }),
      },
      config
    );
  };
}

export function putPaymentMethodHandler(config?: CardManagementConfig) {
  return async function POST(request: Request) {
    const { NextResponse } = await import('next/server');

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { customerId, oldPaidPaymentMethodId, confirmationToken, metadata } = body;

    if (!customerId || !oldPaidPaymentMethodId || !confirmationToken) {
      return NextResponse.json({ error: 'customerId, oldPaidPaymentMethodId, and confirmationToken are required' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => headers[key] = value);

    return swapPaymentMethodHandler(
      { body, headers, method: 'POST' as const },
      {
        json: (data, status = 200) => NextResponse.json(data, { status }),
        error: (message, status) => NextResponse.json({ error: message }, { status }),
      },
      config
    );
  };
}
