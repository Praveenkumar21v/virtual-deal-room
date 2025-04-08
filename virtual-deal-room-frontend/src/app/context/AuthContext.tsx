'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, register, logout, getMe } from '../lib/api';
import { User } from '../lib/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios'; 

interface ApiErrorResponse {
  message?: string;
}

type AuthError = AxiosError<ApiErrorResponse>;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'buyer' | 'seller') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser ] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser  = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; 

      setIsLoading(true);
      try {
        const { data } = await getMe();
        setUser (data.data);
      } catch (err) {
        const error = err as AuthError; 
        console.error('Failed to fetch user:', error);
        toast.error('Failed to retrieve user data. Please log in again.');
        localStorage.removeItem('token');
        setUser (null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser ();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await login(email, password);
      localStorage.setItem('token', data.token);
      setUser ({
        _id: data.data?._id || 'temp',
        email,
        role: data.role as 'buyer' | 'seller',
      });
      toast.success('Logged in successfully!');
    } catch (err) {
      const error = err as AuthError; 
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    role: 'buyer' | 'seller'
  ) => {
    setIsLoading(true);
    try {
      const { data } = await register(email, password, role);
      localStorage.setItem('token', data.token);
      setUser ({
        _id: data.data?._id || 'temp',
        email,
        role,
      });
      toast.success('Registered and logged in successfully!');
    } catch (err) {
      const error = err as AuthError; 
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      localStorage.removeItem('token');
      setUser (null);
      toast.success('Logged out successfully!');
    } catch (err) {
      const error = err as AuthError; 
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login: handleLogin, register: handleRegister, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};