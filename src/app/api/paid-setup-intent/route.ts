import { NextRequest, NextResponse } from 'next/server';

const PAID_API_URL = process.env.PAID_API_URL;
const PAID_API_KEY = process.env.PAID_API_KEY;
const PAID_ORG_ID = process.env.PAID_ORG_ID;

export async function POST(request: NextRequest) {
  try {
    const { customerId, confirmationToken, metadata } = await request.json();

    if (!customerId || !confirmationToken) {
      return NextResponse.json(
        { error: 'Customer ID and confirmation token are required' },
        { status: 400 }
      );
    }

    if (!PAID_API_KEY) {
      console.error('PAID_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch(`${PAID_API_URL}/api/organizations/${PAID_ORG_ID}/payments/setup-intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        confirmationToken,
        metadata: metadata || {}
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Paid setup intent:', errorText);
      return NextResponse.json(
        { error: 'Failed to create setup intent with Paid' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling Paid API:', error);
    return NextResponse.json(
      { error: 'Failed to process payment setup' },
      { status: 500 }
    );
  }
}
