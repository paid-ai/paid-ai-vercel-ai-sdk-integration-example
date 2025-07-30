import { PaidClient } from "@paid-ai/paid-node";

let client: PaidClient | null = null;
let isInitialized: boolean = false;

export async function getClient(): Promise<PaidClient> {
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

  return client;
}

export interface SignalData {
  external_customer_id: string
  external_agent_id: string
  event_name: string
}

