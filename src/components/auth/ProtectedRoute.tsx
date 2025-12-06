import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute Component
 * Simple check: if token in localStorage, allow access
 * Otherwise redirect to login
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log("🔐 ProtectedRoute: No token - redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  console.log("✅ ProtectedRoute: Token exists - rendering content");
  return <>{children}</>;
};
