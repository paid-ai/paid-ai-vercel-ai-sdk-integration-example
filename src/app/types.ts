export interface SignalData {
  external_customer_id: string
  external_agent_id: string
  event_name: string
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserData {
  customerId: string;
  name: string;
  email: string;
  password: string;
  paymentMethodId?: string;
}

