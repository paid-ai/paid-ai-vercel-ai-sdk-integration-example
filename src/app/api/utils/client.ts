import { PaidClient } from "@paid-ai/paid-node";

let client: PaidClient | null = null;
let isInitialized: boolean = false;

export async function getClient(): Promise<PaidClient> {
  if (!client) {
    const apiToken = process.env.PAID_API_TOKEN ?? "";
    if (!apiToken) {
      throw Error("must either set a PAID_API_TOKEN env variable or insert it above");
    }

    try {
      client = new PaidClient({ token: apiToken });
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
