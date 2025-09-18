'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { userStore } from '../utils/userStore';
import { LoginFormData, UserData } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  isLoading: boolean;
  signup: (userData: UserData) => Promise<void>;
  login: (userData: LoginFormData) => Promise<boolean>;
  logout: () => void;
  deleteCurrentUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setLoginState = useCallback(() => {
    const user = userStore.getCurrentUser();
    if (!user) {
      setIsLoggedIn(false)
      setUserData(null);
      return;
    }

    setIsLoggedIn(true);
    setUserData(userStore.userToUserData(user));
  }, [setIsLoggedIn, setUserData, userStore])

  useEffect(() => {
    setLoginState();
    setIsLoading(false);
  }, []);

  const signup = async (userData: UserData) => {
    const user = await userStore.createUser(userData.customerId, userData.email, userData.name, userData.password);
    userStore.createSession(user.id);
    setLoginState();
  };

  const login = async (userData: LoginFormData) => {
    const userAuth = await userStore.authenticateUser(userData.email, userData.password);
    if (!userAuth) return false;
    const user = userStore.getUserByEmail(userData.email);
    if (!user) return false;
    userStore.createSession(user.id);
    setLoginState();
    return true;
  }

  const logout = () => {
    const sessionToken = userStore.getCurrentSessionToken();
    if (!sessionToken) return;
    userStore.deleteSession(sessionToken);
    setLoginState();
  };

  const deleteCurrentUser = () => {
    const user = userStore.getCurrentUser();
    if (!user) return false;
    userStore.deleteUser(user.id);
    setLoginState();
    return true;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, isLoading, signup, logout, login, deleteCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
