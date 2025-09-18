import { UserData } from "../types";

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  customerId?: string;
  paymentMethodId?: string;
  confirmationTokenId?: string;
  paymentProcessed?: boolean;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

interface SerializedStore {
  users: User[];
  sessions: Session[];
}

const COOKIE_NAME = 'multi_user_store';
const COOKIE_MAX_AGE = 31536000; // 1 year

class CookieBackedUserStore {
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  private emailToUserId = new Map<string, string>();
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.loadFromCookie();
    }
  }

  private loadFromCookie(): void {
    try {
      const cookieValue = this.getCookie(COOKIE_NAME);
      if (!cookieValue) return;

      const data: SerializedStore = JSON.parse(decodeURIComponent(cookieValue));

      for (const user of data.users) {
        this.users.set(user.id, user);
        this.emailToUserId.set(user.email, user.id);
      }

      const now = new Date();
      for (const session of data.sessions) {
        if (new Date(session.expiresAt) > now) {
          this.sessions.set(session.token, session);
        }
      }
    } catch (error) {
      console.warn('Failed to load user store from cookie:', error);
    }
  }

  private saveToCookie(): void {
    if (!this.isClient) return;

    try {
      const data: SerializedStore = {
        users: Array.from(this.users.values()),
        sessions: Array.from(this.sessions.values())
      };

      const serialized = encodeURIComponent(JSON.stringify(data));
      this.setCookie(COOKIE_NAME, serialized, COOKIE_MAX_AGE);
    } catch (error) {
      console.warn('Failed to save user store to cookie:', error);
    }
  }

  private getCookie(name: string): string | null {
    if (!this.isClient) return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private setCookie(name: string, value: string, maxAge: number): void {
    if (!this.isClient) return;

    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  }

  async createUser(customerId: string, email: string, name: string, password: string): Promise<User> {
    if (this.emailToUserId.has(email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: customerId,
      email,
      name,
      password,
      createdAt: new Date().toISOString(),
    };

    this.users.set(customerId, user);
    this.emailToUserId.set(email, customerId);
    this.saveToCookie();

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const userId = this.emailToUserId.get(email);
    if (!userId) return null;

    const user = this.users.get(userId);
    if (!user) return null;

    const isValidPassword = user.password === password;
    return isValidPassword ? user : null;
  }

  getUserByEmail(email: string): User | null {
    const userId = this.emailToUserId.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password' | 'createdAt'>>): User | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    this.saveToCookie();
    return updatedUser;
  }

  createSession(userId: string): Session {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const session: Session = {
      token,
      userId,
      expiresAt,
    };

    this.sessions.set(token, session);
    this.saveToCookie();
    this.setCurrentSessionToken(token);
    return session;
  }

  getSession(token: string): Session | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(token);
      this.saveToCookie();
      return null;
    }

    return session;
  }

  deleteSession(token: string): void {
    this.sessions.delete(token);
    this.clearCurrentSessionToken();
    this.saveToCookie();
  }

  getUserBySession(token: string): User | null {
    const session = this.getSession(token);
    if (!session) return null;

    return this.getUserById(session.userId);
  }

  userToUserData(user: User): UserData {
    return {
      customerId: user.customerId || user.id,
      name: user.name,
      email: user.email,
      paymentMethodId: user.paymentMethodId,
      password: user.password,
    };
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.emailToUserId.clear();
    if (this.isClient) {
      this.setCookie(COOKIE_NAME, '', 0); // Delete cookie
    }
  }

  // Get current session token from cookies (for active user)
  getCurrentSessionToken(): string | null {
    return this.getCookie('session_token');
  }

  // Set current session token in cookies
  setCurrentSessionToken(token: string): void {
    this.setCookie('session_token', token, COOKIE_MAX_AGE);
  }

  // Clear current session token
  clearCurrentSessionToken(): void {
    this.setCookie('session_token', '', 0);
  }

  // Get currently logged in user
  getCurrentUser(): User | null {
    const sessionToken = this.getCurrentSessionToken();
    return sessionToken ? this.getUserBySession(sessionToken) : null;
  }

  deleteUser(userID: string): void {
    const user = this.getUserById(userID);
    if (!user) return;
    this.users.delete(userID);

    this.emailToUserId.delete(user.email);

    const userSessions = this.sessions.values().filter((session) => session.userId === userID).toArray();
    for (const session of userSessions) {
      this.deleteSession(session.token);
    }

    this.saveToCookie();
  }
}

export const userStore = new CookieBackedUserStore();
