import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  isLoading?: boolean;
}

/**
 * ProtectedRoute Component
 * Checks if user has valid authentication token
 * If not, redirects to login page
 * If loading, shows spinner
 */
export const ProtectedRoute = ({ children, isLoading = false }: ProtectedRouteProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Check token on mount
  useEffect(() => {
    const newToken = localStorage.getItem('token');
    console.log("� ProtectedRoute check - Token:", newToken ? "✅ EXISTS" : "❌ MISSING");
    setToken(newToken);
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Wait for mount to check token
  if (!mounted) {
    return null;
  }

  // If no token, redirect to login
  if (!token) {
    console.warn("❌ No token found, redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  // Token exists, render children
  console.log("✅ Token valid, rendering protected content");
  return <>{children}</>;
};



