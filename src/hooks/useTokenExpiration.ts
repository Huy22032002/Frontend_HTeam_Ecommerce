import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

/**
 * Hook để kiểm tra và xử lý token hết hạn
 * Chỉ redirect khi token thực sự hết hạn (không loop)
 */
export const useTokenExpiration = () => {
  const navigate = useNavigate();
  const userState = useSelector((state: RootState) => state.userAuth);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
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
        console.error('❌ Invalid token format');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      console.log("⏰ Token expires in:", Math.round(timeUntilExpiration / 1000), "seconds");

      // Nếu token đã hết hạn
      if (timeUntilExpiration <= 0) {
        console.warn('⏰ Token đã hết hạn - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('adminId');
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
        localStorage.removeItem('token');
        localStorage.removeItem('adminId');
        localStorage.removeItem('userRole');
        navigate('/admin/login', { replace: true });
      }, timeUntilExpiration + 1000);

      return () => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
      };
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
    }
  }, [navigate, userState?.user?.id]); // Only re-run when user ID changes
};

export default useTokenExpiration;
