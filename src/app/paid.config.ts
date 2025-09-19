export interface PaidConfig {
  agentId: string;
  paidApiKey: string;
  publishableKey: string;
}

export const paidConfig: PaidConfig = {
  agentId: process.env.PAID_AGENT_ID || "default-agent-id",
  paidApiKey: process.env.PAID_API_KEY || "default-paid-api-key", 
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "default-publishable-key",
};