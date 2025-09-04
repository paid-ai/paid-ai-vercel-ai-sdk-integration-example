export function setCookie(name: string, value: string, maxAge: number = 31536000): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export interface UserData {
  customerId: string;
  name: string;
  email: string;
  paymentMethodId?: string;
}

export function setUserData(userData: UserData): void {
  const maxAge = 31536000; // 1 year
  setCookie('stripe_customer_id', userData.customerId, maxAge);
  setCookie('user_name', userData.name, maxAge);
  setCookie('user_email', userData.email, maxAge);
  if (userData.paymentMethodId) {
    setCookie('payment_method_id', userData.paymentMethodId, maxAge);
  }
  setCookie('logged_in', 'true', maxAge);
}

export function getUserData(): UserData | null {
  const customerId = getCookie('stripe_customer_id');
  const name = getCookie('user_name');
  const email = getCookie('user_email');
  const paymentMethodId = getCookie('payment_method_id');

  if (!customerId || !name || !email) {
    return null;
  }

  return { customerId, name, email, paymentMethodId: paymentMethodId || undefined };
}

export function clearUserData(): void {
  deleteCookie('stripe_customer_id');
  deleteCookie('user_name');
  deleteCookie('user_email');
  deleteCookie('payment_method_id');
  deleteCookie('logged_in');
}

export function isLoggedIn(): boolean {
  return getCookie('logged_in') === 'true';
}
