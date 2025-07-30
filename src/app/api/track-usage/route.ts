// src/app/api/track-usage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PaidClient } from "@paid-ai/paid-node";

let client: any = null;
let isInitialized = false;

async function ensureInitialized() {
  if (!client) {
    try {
      // Use dynamic import to avoid bundling issues
      client = new PaidClient({ token: "050d3549-54c6-4e7e-9ddc-ea87007dc915" });
    } catch (error) {
      console.error('Failed to initialize PaidClient:', error);
      throw new Error('PaidClient initialization failed');
    }
  }

  if (!isInitialized) {
    await client.initializeTracing();
    isInitialized = true;
  }

  debugger;
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const usageData = await request.json();
    await client.usage.recordBulk(usageData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
  }
}

