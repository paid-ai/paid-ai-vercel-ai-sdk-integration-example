import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../utils/client";
import { SignalData } from "@/app/types";

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

