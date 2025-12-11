/**
 * Utility functions for managing tokens in localStorage
 * Separates customer and admin tokens to prevent conflicts
 */

/**
 * Get the current valid token (admin token takes precedence over customer token)
 * Use this only for shared/generic API calls
 */
export const getToken = (): string | null => {
  const adminToken = localStorage.getItem("admin_token");
  const customerToken = localStorage.getItem("customer_token");
  return adminToken || customerToken || null;
};

/**
 * Get admin token - ONLY for admin API endpoints
 */
export const getAdminToken = (): string | null => {
  return localStorage.getItem("admin_token");
};

/**
 * Get customer token - ONLY for customer API endpoints
 */
export const getCustomerToken = (): string | null => {
  return localStorage.getItem("customer_token");
};

/**
 * Get current user ID (admin or customer)
 */
export const getUserId = (): string | null => {
  const adminId = localStorage.getItem("adminId");
  const customerId = localStorage.getItem("customer_id");
  return adminId || customerId || null;
};

/**
 * Get customer ID
 */
export const getCustomerId = (): string | null => {
  return localStorage.getItem("customer_id");
};

/**
 * Get admin ID
 */
export const getAdminId = (): string | null => {
  return localStorage.getItem("adminId");
};

/**
 * Check if user is logged in as admin
 */
export const isAdminLoggedIn = (): boolean => {
  return !!localStorage.getItem("admin_token");
};

/**
 * Check if user is logged in as customer
 */
export const isCustomerLoggedIn = (): boolean => {
  return !!localStorage.getItem("customer_token");
};

/**
 * Clear all tokens
 */
export const clearAllTokens = (): void => {
  localStorage.removeItem("token"); // legacy
  localStorage.removeItem("admin_token");
  localStorage.removeItem("customer_token");
  localStorage.removeItem("id"); // legacy
  localStorage.removeItem("adminId");
  localStorage.removeItem("customer_id");
};
