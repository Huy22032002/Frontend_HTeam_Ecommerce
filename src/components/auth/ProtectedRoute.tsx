import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

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
  const token = localStorage.getItem('token');

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Token exists, render children
  return <>{children}</>;
};
