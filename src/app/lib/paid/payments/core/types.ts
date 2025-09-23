export interface PaymentResult {
  confirmationToken: string;
  setupIntentStatus: string;
  setupIntentClientSecret?: string;
}
