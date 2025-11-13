import React, { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/client';
import { UserProfile, UserRole } from '../types';

interface AuthState {
  user?: UserProfile;
  token?: string;
  isLoading: boolean;
  login: (nationalId: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

export type RegisterPayload = {
  role: UserRole;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  password: string;
  skills: string[]; // สำหรับอาสาสมัคร
  biography: string; // สำหรับอาสาสมัคร
  disabilityType?: string; // สำหรับผู้พิการ
  additionalNeeds?: string[]; // สำหรับผู้พิการ
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile>();
  const [token, setToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (nationalId: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(nationalId, password);
      setUser(response.user);
      setToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      await api.register({ ...payload });
      await login(payload.nationalId, payload.password);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await api.getProfile(user.id);
    setUser(profile);
  };

  const logout = () => {
    setUser(undefined);
    setToken(undefined);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      refreshProfile,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
