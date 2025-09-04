import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '../utils/client';
import { Paid } from '@paid-ai/paid-node';
import { AGENT_ID } from '@/app/constants';

export async function POST(request: NextRequest) {
  try {
    debugger;
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    const paidClient = await getClient();

    // paidClient.agents.create({
    //   name: "agent",
    //   description: "bleep bloop",
    //   externalId: AGENT_ID,
    // });

    const customerID = crypto.randomUUID();

    const customer = await paidClient.customers.create({
      name: name,
      externalId: customerID,
      billingAddress: {
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      }
    });

    const contact = await paidClient.contacts.create({
      customerExternalId: customerID,
      salutation: Paid.Salutation.Mr,
      firstName: name,
      lastName: "",
      email: email,
      billingStreet: '123 Main St',
      billingCity: 'San Francisco',
      billingCountry: 'USA',
      billingPostalCode: '94105'
    });

    if (contact.id === undefined) {
      throw Error("contact missing id");
    }

    await paidClient.orders.create({
      customerId: customer.id,
      customerExternalId: customerID,
      billingContactId: contact.id,
      name: 'agent_order',
      description: 'Annual subscription for agent',
      startDate: '2025-06-01',
      endDate: '2026-05-31',
      currency: 'USD',
      orderLines: [{
        agentExternalId: AGENT_ID,
      }]
    });

    return NextResponse.json({ customerId: customerID });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
