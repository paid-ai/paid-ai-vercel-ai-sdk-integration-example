import { createCustomerHandler } from '../../core/create-customer-handler';

export function postCustomerHandler() {
  return async function POST(request: any) {
    const { NextResponse } = await import('next/server');

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });

    return createCustomerHandler(
      {
        body,
        headers,
        method: request.method || 'POST',
      },
      {
        json: (data, status = 200) => NextResponse.json(data, { status }),
        error: (message, status) => NextResponse.json({ error: message }, { status }),
      },
    );
  };
}
