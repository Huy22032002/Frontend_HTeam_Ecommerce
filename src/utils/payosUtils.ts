/**
 * PayOS Payment Utilities
 * Helper functions for PayOS payment processing
 */

/**
 * Generate checksum for PayOS API requests
 * Used to verify request authenticity with PayOS
 * Note: Server-side signature verification is recommended for production
 */
export const generatePayOSChecksum = async (
  data: Record<string, any>,
  checksumKey: string
): Promise<string> => {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort();

  // Build the string to hash
  let dataString = '';
  for (const key of sortedKeys) {
    const value = data[key];
    if (value !== null && value !== undefined && value !== '') {
      dataString += `${key}=${value}&`;
    }
  }

  // Remove trailing &
  dataString = dataString.slice(0, -1);

  // Use Web Crypto API for HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(checksumKey);
  const messageData = encoder.encode(dataString);

  const key = await window.crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);

  const signature = await window.crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

/**
 * Verify PayOS webhook signature
 * Ensures webhook callback is legitimate
 */
export const verifyPayOSSignature = async (
  data: Record<string, any>,
  signature: string,
  checksumKey: string
): Promise<boolean> => {
  try {
    const calculatedSignature = await generatePayOSChecksum(data, checksumKey);
    return calculatedSignature === signature;
  } catch (error) {
    console.error('Error verifying PayOS signature:', error);
    return false;
  }
};

/**
 * Build PayOS checkout data
 * Prepares data for sending to PayOS API
 */
export const buildPayOSCheckoutData = (
  orderCode: number,
  amount: number,
  description: string,
  returnUrl: string,
  cancelUrl: string,
  expiredAt?: number
): Record<string, any> => {
  return {
    orderCode,
    amount,
    description,
    returnUrl,
    cancelUrl,
    expiredAt: expiredAt || Math.floor(Date.now() / 1000) + 3600, // 1 hour by default
  };
};

/**
 * Parse PayOS payment status
 * Converts PayOS status codes to application status
 */
export const parsePayOSStatus = (payosStatus: string): 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' => {
  const statusMap: Record<string, 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'> = {
    PENDING: 'PENDING',
    PROCESSING: 'PENDING',
    COMPLETED: 'COMPLETED',
    PAID: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'FAILED',
    FAILED: 'FAILED',
  };

  return statusMap[payosStatus] || 'PENDING';
};

/**
 * Extract order code from payment link ID
 */
export const extractOrderCodeFromPaymentLinkId = (paymentLinkId: string): number | null => {
  try {
    // PayOS format: typically contains order code
    const match = paymentLinkId.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  } catch (error) {
    console.error('Error extracting order code:', error);
    return null;
  }
};

/**
 * Format amount for PayOS (in VND cents)
 */
export const formatAmountForPayOS = (amountInVND: number): number => {
  // PayOS expects amount in the smallest currency unit
  // For VND, it's typically in whole numbers (not cents)
  return Math.floor(amountInVND);
};

/**
 * Check if payment is expired
 */
export const isPaymentExpired = (expiredAtTimestamp: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime > expiredAtTimestamp;
};

/**
 * Get payment retry count from local storage
 */
export const getPaymentRetryCount = (orderId: number): number => {
  const key = `payos_retry_${orderId}`;
  const count = localStorage.getItem(key);
  return count ? parseInt(count, 10) : 0;
};

/**
 * Increment payment retry count
 */
export const incrementPaymentRetryCount = (orderId: number, maxRetries: number = 3): boolean => {
  const key = `payos_retry_${orderId}`;
  const currentCount = getPaymentRetryCount(orderId);

  if (currentCount >= maxRetries) {
    return false; // Exceeded max retries
  }

  localStorage.setItem(key, String(currentCount + 1));
  return true;
};

/**
 * Clear payment retry count
 */
export const clearPaymentRetryCount = (orderId: number): void => {
  const key = `payos_retry_${orderId}`;
  localStorage.removeItem(key);
};

/**
 * Store PayOS payment state
 */
export const storePayOSPaymentState = (orderId: number, state: Record<string, any>): void => {
  const key = `payos_state_${orderId}`;
  localStorage.setItem(key, JSON.stringify(state));
};

/**
 * Retrieve PayOS payment state
 */
export const getPayOSPaymentState = (orderId: number): Record<string, any> | null => {
  const key = `payos_state_${orderId}`;
  const state = localStorage.getItem(key);
  return state ? JSON.parse(state) : null;
};

/**
 * Clear PayOS payment state
 */
export const clearPayOSPaymentState = (orderId: number): void => {
  const key = `payos_state_${orderId}`;
  localStorage.removeItem(key);
};

/**
 * Validate PayOS checkout URL
 */
export const isValidPayOSCheckoutUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('payos') || urlObj.hostname.includes('checkout');
  } catch {
    return false;
  }
};

/**
 * Get error message from PayOS response
 */
export const getPayOSErrorMessage = (error: any): string => {
  if (!error) return 'Đã xảy ra lỗi thanh toán';

  const errorData = error.response?.data;

  if (errorData?.message) {
    return errorData.message;
  }

  if (error.message === 'Network Error') {
    return 'Lỗi kết nối. Vui lòng kiểm tra kết nối internet.';
  }

  if (error.response?.status === 401) {
    return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
  }

  if (error.response?.status === 404) {
    return 'Không tìm thấy thông tin thanh toán.';
  }

  if (error.response?.status >= 500) {
    return 'Lỗi máy chủ. Vui lòng thử lại sau.';
  }

  return 'Không thể xử lý thanh toán. Vui lòng thử lại.';
};
