import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminToken, getCustomerToken } from '../../utils/tokenUtils';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute Component
 * Check: if admin token OR customer token exists, allow access
 * Otherwise redirect to login
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const adminToken = getAdminToken();
  const customerToken = getCustomerToken();
  const isAuthenticated = !!adminToken || !!customerToken;

  if (!isAuthenticated) {
    console.log("🔐 ProtectedRoute: No token (admin or customer) - redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  const tokenType = adminToken ? "[ADMIN]" : "[CUSTOMER]";
  console.log(`✅ ProtectedRoute: ${tokenType} Token exists - rendering content`);
  return <>{children}</>;
};
