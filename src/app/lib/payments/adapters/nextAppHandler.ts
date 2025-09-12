import { createPaidSetupIntentHandler, PaidSetupConfig } from '../core/paid-route-handler';

export function createNextAppHandler(config?: PaidSetupConfig) {
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

    return createPaidSetupIntentHandler(
      {
        body,
        headers,
        method: request.method || 'POST',
      },
      {
        json: (data, status = 200) => NextResponse.json(data, { status }),
        error: (message, status) => NextResponse.json({ error: message }, { status }),
      },
      config
    );
  };
}
