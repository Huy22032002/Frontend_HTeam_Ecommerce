import { useEffect, useRef, useCallback, useState } from 'react';
import { getCustomerToken } from '../utils/tokenUtils';

const API_URL = import.meta.env.VITE_BASE_URL + '/api' || 'https://www.hecommerce.shop/api';

/**
 * Hook để quản lý Server-Sent Events (SSE) cho real-time notification
 */
export const useNotificationSSE = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscribersRef = useRef<((notification: any) => void)[]>([]);
  const lastNotificationIdRef = useRef<string>('');

  /**
   * Format timestamp từ ISO string sang định dạng Vietnam time
   */
  const formatNotificationTime = useCallback((isoString: string | undefined): string => {
    if (!isoString) return '';
    
    try {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      console.error('Lỗi định dạng thời gian notification:', e);
      return isoString || '';
    }
  }, []);

  /**
   * Kết nối SSE để nhận notification
   */
  const connect = useCallback((customerId: string | number) => {
    if (eventSourceRef.current) {
      console.log('🔌 Notification SSE đã kết nối rồi');
      return;
    }

    try {
      const token = getCustomerToken();
      const lastNotificationId = lastNotificationIdRef.current;
      
      let queryParams = '';
      if (token) {
        queryParams += `?token=${encodeURIComponent(token)}`;
      }
      if (lastNotificationId) {
        queryParams += (token ? '&' : '?') + `lastNotificationId=${encodeURIComponent(lastNotificationId)}`;
      }
      
      const streamUrl = `${API_URL}/customers/${customerId}/notifications/stream${queryParams}`;
      
      console.log('🔌 Kết nối notification SSE (lastNotificationId=' + lastNotificationId + ')');

      const eventSource = new EventSource(streamUrl, {
        withCredentials: true,
      });

      // Catch-up: nhận notification mới hoặc notification đã miss
      eventSource.addEventListener('catch-up', (event: MessageEvent) => {
        try {
          console.log('📨 Nhận catch-up notification');
          const notifications = JSON.parse(event.data);
          if (Array.isArray(notifications)) {
            notifications.forEach(notif => {
              if (notif.id) {
                lastNotificationIdRef.current = notif.id.toString();
              }
              subscribersRef.current.forEach(cb => cb(notif));
            });
          }
        } catch (e) {
          console.error('Lỗi parse catch-up notification:', e);
        }
      });

      // Real-time notification
      eventSource.addEventListener('notification', (event: MessageEvent) => {
        try {
          console.log('📨 Nhận real-time notification');
          const notification = JSON.parse(event.data);
          if (notification.id) {
            lastNotificationIdRef.current = notification.id.toString();
          }
          subscribersRef.current.forEach(cb => cb(notification));
        } catch (e) {
          console.error('Lỗi parse notification:', e);
        }
      });

      eventSource.onopen = () => {
        console.log('✅ Notification SSE CONNECTED');
        setIsConnected(true);
      };

      eventSource.onerror = (error) => {
        console.error('❌ Notification SSE error:', error);
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('🔌 Notification SSE connection closed');
          eventSourceRef.current = null;
          setIsConnected(false);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('❌ Lỗi kết nối notification SSE:', error);
      setIsConnected(false);
    }
  }, []);

  /**
   * Disconnect SSE
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🔌 Disconnecting notification SSE');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      subscribersRef.current = [];
      setIsConnected(false);
    }
  }, []);

  /**
   * Subscribe để nhận notification
   */
  const subscribe = useCallback((
    callback: (notification: any) => void,
    customerId?: string | number
  ) => {
    console.log('📢 Subscribe notification');
    
    subscribersRef.current.push(callback);

    if (!eventSourceRef.current && customerId) {
      connect(customerId);
    }

    return () => {
      const index = subscribersRef.current.indexOf(callback);
      if (index > -1) {
        subscribersRef.current.splice(index, 1);
      }
    };
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    subscribe,
    isConnected,
    formatNotificationTime,
  };
};
