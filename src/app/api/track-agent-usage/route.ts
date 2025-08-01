import { NextRequest, NextResponse } from "next/server";
import { Paid } from "@paid-ai/paid-node";
import { getClient, SignalData } from "../utils/client";

async function signalWithRecordBulk(usageData: SignalData) {
  const signal: Paid.Signal = {
    event_name: usageData.event_name,
    agent_id: usageData.external_agent_id,
    customer_id: usageData.external_customer_id,
    data: {
      costData: {
        vendor: "OpenAI",
        amount: 0.0001,
        currency: "USD",
      }
    }
  }

  const client = await getClient();
  await client.usage.recordBulk({ signals: [signal] });
}

async function signalWithTrace(usageData: SignalData) {
  const client = await getClient();

  async function sendSignal() {
    client.signal(usageData.event_name)
  }

  await client.trace(usageData.external_customer_id, async () => {
    await sendSignal()
  }, usageData.external_agent_id)
}

export async function POST(request: NextRequest) {
  try {
    const usageData = await request.json();
    await signalWithTrace(usageData)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
  }
}

