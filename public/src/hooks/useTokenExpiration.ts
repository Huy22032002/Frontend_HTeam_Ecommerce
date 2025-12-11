import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { getAdminToken,getCustomerToken } from '../utils/tokenUtils';

/**
 * Hook để kiểm tra và xử lý token hết hạn
 * Chỉ redirect khi token thực sự hết hạn (không loop)
 */
export const useTokenExpiration = () => {
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.userAuth);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = userState?.user?.role?.includes('ADMIN') || userState?.user?.role?.includes('ROLE_ADMIN') ? getAdminToken() : getCustomerToken();
    
    // Không có token? Không làm gì (ProtectedRoute sẽ xử lý redirect)
    if (!token) {
      console.log("⏰ useTokenExpiration: No token, skipping check");
      return;
    }

    console.log("⏰ useTokenExpiration: Checking token expiration");

    try {
      // Decode JWT để kiểm tra hạn sử dụng
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⏰ Token không phải JWT format (có thể là Bearer token tạm thời), skip expiration check');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        console.warn('⏰ Token không có exp claim, skip expiration check');
        return;
      }

      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      console.log("⏰ Token expires in:", Math.round(timeUntilExpiration / 1000), "seconds");

      // Nếu token đã hết hạn
      if (timeUntilExpiration <= 0) {
        console.warn('⏰ Token đã hết hạn - redirecting to login');
        if (userState?.user?.role?.includes('ADMIN') || userState?.user?.role?.includes('ROLE_ADMIN')) {
          localStorage.removeItem('adminId');
          localStorage.removeItem('admin_token');
        } else {
          localStorage.removeItem('customer_id');
          localStorage.removeItem('customer_token');
        }
        localStorage.removeItem('userRole');
        navigate('/admin/login', { replace: true });
        return;
      }

      // Clear previous timeout nếu có
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      // Set timeout để redirect khi token hết hạn
      // Cộng thêm 1 giây để đảm bảo token đã expired
      timeoutIdRef.current = setTimeout(() => {
        console.warn('⏰ Token expired - timeout triggered, redirecting');
        if (userState?.user?.role?.includes('ADMIN') || userState?.user?.role?.includes('ROLE_ADMIN')) {
          localStorage.removeItem('adminId');
          localStorage.removeItem('admin_token');
        } else {
          localStorage.removeItem('customer_id');
          localStorage.removeItem('customer_token');
        }
        localStorage.removeItem('userRole');
        navigate('/admin/login', { replace: true });
      }, timeUntilExpiration + 1000);
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      console.warn('⏰ Token decode error, skip expiration check');
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [navigate, userState?.user?.id]); // Only re-run when user ID changes
};

export default useTokenExpiration;
