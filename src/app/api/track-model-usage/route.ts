import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../utils/client";

export async function POST(request: NextRequest) {
  try {
    const usageData = await request.json();
    debugger;
    await trackCostManually()

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
  }
}
