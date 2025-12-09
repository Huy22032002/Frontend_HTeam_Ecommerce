import { useEffect, useRef, useCallback, useState } from 'react';

const API_URL = import.meta.env.VITE_BASE_URL +'/api';

/**
 * Hook để quản lý Server-Sent Events (SSE) cho real-time chat messages
 * Thay thế useWebSocket
 */
export const useSSE = () => {
  const eventSourceRef = useRef<Map<string, EventSource>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const subscribersRef = useRef<Map<string, ((message: any) => void)[]>>(new Map());

  /**
   * Kết nối SSE cho một conversation
   * @param conversationId - ID của conversation
   * @param userId - ID của user (customer hoặc admin)
   * @param userRole - Vai trò của user (customer hoặc admin)
   */
  const connect = useCallback((conversationId: string, userId: string | number, userRole: 'customer' | 'admin' = 'customer') => {
    if (eventSourceRef.current.has(conversationId)) {
      console.log(`SSE already connected for conversation: ${conversationId}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // EventSource doesn't support custom headers, so we pass token as query parameter
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
      const streamUrl = userRole === 'admin' 
        ? `${API_URL}/admins/${userId}/chat/stream/${conversationId}${tokenParam}`
        : `${API_URL}/customers/${userId}/chat/stream/${conversationId}${tokenParam}`;
      
      console.log(`SSE: Connecting to ${streamUrl.replace(token || '', '***')}`);

      const eventSource = new EventSource(streamUrl, {
        withCredentials: true,
      });

      // Catch-up: nhận tất cả messages cũ
      eventSource.addEventListener('catch-up', (event: MessageEvent) => {
        try {
          console.log('Received catch-up messages');
          const messages = JSON.parse(event.data);
          if (Array.isArray(messages)) {
            messages.forEach(msg => {
              const callbacks = subscribersRef.current.get(conversationId) || [];
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
          console.log('Received real-time message');
          const message = JSON.parse(event.data);
          const callbacks = subscribersRef.current.get(conversationId) || [];
          callbacks.forEach(cb => cb(message));
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      });

      eventSource.onopen = () => {
        console.log(`SSE CONNECTED for conversation: ${conversationId}`);
        setIsConnected(true);
      };

      eventSource.onerror = (error) => {
        console.error(`SSE error for conversation ${conversationId}:`, error);
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log(`SSE connection closed for ${conversationId}`);
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
    console.log(`Subscribing to conversation: ${conversationId}`);
    
    // Thêm callback vào list
    const callbacks = subscribersRef.current.get(conversationId) || [];
    callbacks.push(callback);
    subscribersRef.current.set(conversationId, callbacks);

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
  };
};
