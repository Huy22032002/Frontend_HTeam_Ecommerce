import { useEffect, useRef, useCallback, useState } from 'react';
import { getAdminToken, getCustomerToken } from '../utils/tokenUtils';

const API_URL = import.meta.env.VITE_BASE_URL+'/api' || 'https://www.hecommerce.shop/api';

/**
 * Hook để quản lý Server-Sent Events (SSE) cho real-time chat messages
 * Thay thế useWebSocket
 */
export const useSSE = () => {
  const eventSourceRef = useRef<Map<string, EventSource>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const subscribersRef = useRef<Map<string, ((message: any) => void)[]>>(new Map());
  // Track lastMessageId để tránh replay messages cũ trên reconnect
  const lastMessageIdRef = useRef<Map<string, string>>(new Map());

  /**
   * Kết nối SSE cho một conversation
   * @param conversationId - ID của conversation
   * @param userId - ID của user (customer hoặc admin)
   * @param userRole - Vai trò của user (customer hoặc admin)
   */
  const connect = useCallback((conversationId: string, userId: string | number, userRole: 'customer' | 'admin' = 'customer') => {
    if (eventSourceRef.current.has(conversationId)) {
      console.log(`⚠️ [SSE] Already connected for conversation: ${conversationId}`);
      return;
    }

    try {
      const token = userRole === 'admin' ? getAdminToken() : getCustomerToken();
      const lastMessageId = lastMessageIdRef.current.get(conversationId);
      
      // Build URL with token and lastMessageId params
      let queryParams = '';
      if (token) {
        queryParams += `?token=${encodeURIComponent(token)}`;
      }
      if (lastMessageId) {
        queryParams += (token ? '&' : '?') + `lastMessageId=${encodeURIComponent(lastMessageId)}`;
      }
      
      const streamUrl = userRole === 'admin' 
        ? `${API_URL}/admins/${userId}/chat/stream/${conversationId}${queryParams}`
        : `${API_URL}/customers/${userId}/chat/stream/${conversationId}${queryParams}`;
      
      console.log(`🔌 [SSE] Connecting to stream: ${streamUrl.split('?')[0]} (lastMessageId=${lastMessageId || 'none'})`);

      const eventSource = new EventSource(streamUrl, {
        withCredentials: true,
      });

      // Catch-up: nhận messages mới hoặc messages đã miss
      eventSource.addEventListener('catch-up', (event: MessageEvent) => {
        try {
          console.log('📥 [SSE] Received catch-up messages for conversation:', conversationId);
          const messages = JSON.parse(event.data);
          if (Array.isArray(messages)) {
            console.log(`📥 [SSE] Catch-up: ${messages.length} messages for ${conversationId}`);
            messages.forEach(msg => {
              // Track lastMessageId để reconnect không replay
              if (msg.id) {
                lastMessageIdRef.current.set(conversationId, msg.id.toString());
              }
              const callbacks = subscribersRef.current.get(conversationId) || [];
              console.log(`📥 [SSE] Calling ${callbacks.length} subscribers for catch-up message`);
              callbacks.forEach(cb => cb(msg));
            });
          }
        } catch (e) {
          console.error('Error parsing catch-up messages:', e);
        }
      });

      // Real-time messages
      eventSource.addEventListener('message', (event: MessageEvent) => {
        try {
          console.log('📥 [SSE] Received real-time message for conversation:', conversationId);
          const message = JSON.parse(event.data);
          console.log('📥 [SSE] Message:', message);
          // Track lastMessageId
          if (message.id) {
            lastMessageIdRef.current.set(conversationId, message.id.toString());
          }
          const callbacks = subscribersRef.current.get(conversationId) || [];
          console.log(`📥 [SSE] Calling ${callbacks.length} subscribers for real-time message`);
          callbacks.forEach(cb => cb(message));
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      });

      eventSource.onopen = () => {
        console.log(`✅ [SSE] CONNECTED for conversation: ${conversationId}`);
        setIsConnected(true);
      };

      eventSource.onerror = (error) => {
        console.error(`❌ [SSE] error for conversation ${conversationId}:`, error);
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log(`🔌 [SSE] connection closed for ${conversationId}`);
          eventSourceRef.current.delete(conversationId);
          setIsConnected(false);
        }
      };

      eventSourceRef.current.set(conversationId, eventSource);
    } catch (error) {
      console.error(`❌ Error connecting SSE for conversation ${conversationId}:`, error);
      setIsConnected(false);
    }
  }, []);

  /**
   * Disconnect SSE cho một conversation
   */
  const disconnect = useCallback((conversationId: string) => {
    const eventSource = eventSourceRef.current.get(conversationId);
    if (eventSource) {
      console.log(`🔌 Disconnecting SSE for conversation: ${conversationId}`);
      eventSource.close();
      eventSourceRef.current.delete(conversationId);
      subscribersRef.current.delete(conversationId);
      setIsConnected(false);
    }
  }, []);

  /**
   * Subscribe để nhận messages từ một conversation
   * @param conversationId - ID của conversation
   * @param callback - Callback function khi nhận message
   * @param userId - ID của user (customer hoặc admin)
   * @param userRole - Vai trò của user (customer hoặc admin)
   */
  const subscribe = useCallback((
    conversationId: string,
    callback: (message: any) => void,
    userId?: string | number,
    userRole: 'customer' | 'admin' = 'customer'
  ) => {
    console.log(`📢 [SSE] Subscribe to conversation: ${conversationId}, userId: ${userId}`);
    
    // Thêm callback vào list
    const callbacks = subscribersRef.current.get(conversationId) || [];
    callbacks.push(callback);
    subscribersRef.current.set(conversationId, callbacks);
    console.log(`📢 [SSE] Total subscribers for ${conversationId}: ${callbacks.length}`);

    // Nếu chưa kết nối, kết nối ngay
    if (!eventSourceRef.current.has(conversationId) && userId) {
      connect(conversationId, userId, userRole);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = subscribersRef.current.get(conversationId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }, [connect]);

  /**
   * Unsubscribe từ một conversation
   */
  const unsubscribe = useCallback((conversationId: string) => {
    console.log(`🔕 Unsubscribing from conversation: ${conversationId}`);
    disconnect(conversationId);
  }, [disconnect]);

  /**
   * Format timestamp từ ISO string sang định dạng Vietnam time
   * @param isoString ISO 8601 timestamp (e.g., "2025-12-10T15:30:45Z")
   * @returns Formatted string in Vietnam timezone (Asia/Ho_Chi_Minh)
   */
  const formatMessageTime = useCallback((isoString: string | undefined): string => {
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
      console.error('Error formatting message time:', e);
      return isoString;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current.forEach((eventSource) => {
        eventSource.close();
      });
      eventSourceRef.current.clear();
      subscribersRef.current.clear();
    };
  }, []);

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    isConnected,
    formatMessageTime, // Export timezone formatter for components
  };
};
