import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useMemo } from 'react';

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
  const location = useLocation();
  const token = useMemo(() => localStorage.getItem('token'), [location.pathname]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  console.log("🔍 ProtectedRoute - URL:", location.pathname, "Token:", token ? "✅ EXISTS" : "❌ MISSING");

  // If no token, redirect to login
  if (!token) {
    console.warn("❌ No token! Redirecting to /admin/login");
    return <Navigate to="/admin/login" replace />;
  }

  // Token exists, render children
  console.log("✅ Token valid, rendering protected content");
  return <>{children}</>;
};
