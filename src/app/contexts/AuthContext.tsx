'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserData, isLoggedIn as checkIsLoggedIn, setUserData as setUserDataCookies, setCookie, type UserData } from '@/app/utils/cookies';

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const loggedIn = checkIsLoggedIn();
    const data = getUserData();

    if (loggedIn && data) {
      setIsLoggedIn(true);
      setUserData(data);
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, []);

  const login = (userData: UserData) => {
    setIsLoggedIn(true);
    setUserData(userData);
    setUserDataCookies(userData);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setCookie('logged_in', 'false', 31536000);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
