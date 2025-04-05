'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  username: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateUser: (username: string, password: string) => Promise<void>;
  deleteUser: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const router = useRouter();

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedExpiry = localStorage.getItem('token_expiry');
    
    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      // Check if token is expired
      if (Date.now() > expiryTime) {
        // Token expired, log out
        logout();
        return;
      }
      
      setToken(storedToken);
      setTokenExpiry(expiryTime);
      fetchUserDetails(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Set up token refresh or expiry check
  useEffect(() => {
    if (!token || !tokenExpiry) return;
    
    // Calculate time until token expires (minus 5 minutes to be safe)
    const timeUntilExpiry = tokenExpiry - Date.now() - (5 * 60 * 1000);
    
    // If token expires in less than 5 minutes, logout now
    if (timeUntilExpiry <= 0) {
      logout();
      return;
    }
    
    // Set timeout to logout when token expires
    const logoutTimer = setTimeout(() => {
      logout();
    }, timeUntilExpiry);
    
    return () => clearTimeout(logoutTimer);
  }, [token, tokenExpiry]);

  const fetchUserDetails = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token and expiry time to localStorage
      const expiryTime = Date.now() + data.expiresIn;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token_expiry', expiryTime.toString());
      
      setToken(data.token);
      setTokenExpiry(expiryTime);
      
      // Fetch user details after successful login
      await fetchUserDetails(data.token);
      router.push('/dashboard');
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save token and expiry time to localStorage
      const expiryTime = Date.now() + data.expiresIn;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token_expiry', expiryTime.toString());
      
      setToken(data.token);
      setTokenExpiry(expiryTime);
      
      // Fetch user details after successful registration
      await fetchUserDetails(data.token);
      router.push('/dashboard');
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  const updateUser = async (username: string, password: string) => {
    if (!token) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }
      
      // Update token and expiry
      const expiryTime = Date.now() + data.expiresIn;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('token_expiry', expiryTime.toString());
      
      setToken(data.token);
      setTokenExpiry(expiryTime);
      
      if (user) {
        setUser({
          ...user,
          username: data.username
        });
      }
      
      setIsLoading(false);
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!token) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      
      // Clear user data and redirect to home
      logout();
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    setUser(null);
    setToken(null);
    setTokenExpiry(null);
    setError(null);
    router.push('/login');
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        deleteUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}