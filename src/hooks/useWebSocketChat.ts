import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../api/chat/ChatApi';

/**
 * Hook để quản lý WebSocket connection cho chat
 * Sử dụng STOMP protocol qua WebSocket
 * Hỗ trợ phân trang: 20 messages mỗi trang
 */
export const useWebSocketChat = (customerId: number | null) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const clientRef = useRef<any>(null);
  const subscriptionsRef = useRef<any[]>([]);

  // Khởi tạo kết nối WebSocket
  const connect = useCallback(async () => {
    if (!customerId || connected) return;

    try {
      // Sử dụng global window objects hoặc import
      const SockJS = (window as any).SockJS;
      const Stomp = (window as any).Stomp;

      if (!SockJS || !Stomp) {
        setError('SockJS hoặc STOMP chưa được load. Vui lòng thêm CDN vào index.html');
        console.warn('Please add CDN to index.html: sockjs-client and stompjs');
        return;
      }

      const socket = new SockJS('http://localhost:8080/ws/chat');
      const client = Stomp.over(socket);

      client.connect({}, () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
      }, (error: any) => {
        console.error('WebSocket connection error:', error);
        setError('Không thể kết nối WebSocket');
        setConnected(false);
      });

      clientRef.current = client;
    } catch (err: any) {
      console.error('Error initializing WebSocket:', err);
      setError('Lỗi khởi tạo WebSocket');
      setConnected(false);
    }
  }, [customerId, connected]);

  // Ngắt kết nối WebSocket
  const disconnect = useCallback(() => {
    if (clientRef.current?.connected) {
      // Unsubscribe tất cả
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];

      clientRef.current.disconnect(() => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });
    }
  }, []);

  // Subscribe vào cuộc hội thoại (MongoDB String ID)
  const subscribeToConversation = useCallback((conversationId: string) => {
    if (!clientRef.current?.connected) {
      setError('WebSocket chưa kết nối');
      return;
    }

    try {
      // Unsubscribe các subscription cũ
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
      setMessages([]);
      setCurrentPage(0);
      setHasMore(true);

      // Subscribe vào topic tin nhắn
      const subscription = clientRef.current.subscribe(
        `/topic/chat.${conversationId}`,
        (message: any) => {
          const body = JSON.parse(message.body);
          console.log('Received message:', body);

          if (body.type === 'MESSAGE_READ') {
            // Đánh dấu tin nhắn đã đọc
            setMessages(prev =>
              prev.map(msg =>
                msg.id === body.messageId ? { ...msg, isRead: true } : msg
              )
            );
          } else {
            // Tin nhắn mới (thêm vào cuối)
            setMessages(prev => [...prev, body]);
          }
        }
      );

      subscriptionsRef.current.push(subscription);
      console.log('Subscribed to conversation:', conversationId);
    } catch (err) {
      console.error('Error subscribing to conversation:', err);
      setError('Lỗi khi subscribe vào cuộc hội thoại');
    }
  }, []);

  // Gửi tin nhắn qua WebSocket (MongoDB String conversationId)
  const sendMessage = useCallback(
    (conversationId: string, content: string, messageType: string = 'TEXT') => {
      if (!clientRef.current?.connected) {
        setError('WebSocket chưa kết nối');
        return;
      }

      try {
        const message = {
          conversationId,
          content,
          messageType
        };

        clientRef.current.send('/app/chat.send', {}, JSON.stringify(message));
        console.log('Message sent:', message);
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Lỗi khi gửi tin nhắn');
      }
    },
    []
  );

  // Đánh dấu tin nhắn đã đọc
  const markAsRead = useCallback((messageId: string, conversationId: number) => {
    if (!clientRef.current?.connected) {
      return;
    }

    try {
      clientRef.current.send('/app/chat.mark-read', {}, JSON.stringify({
        messageId,
        conversationId
      }));
      console.log('Message marked as read:', messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  // Ngắt kết nối khi component unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    messages,
    error,
    currentPage,
    setCurrentPage,
    hasMore,
    setHasMore,
    connect,
    disconnect,
    subscribeToConversation,
    sendMessage,
    markAsRead
  };
};

/**
 * Hook để admin nghe tin nhắn WebSocket
 */
export const useWebSocketAdminChat = (adminId: number | null) => {
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<Map<string, ChatMessage[]>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);
  const subscriptionsRef = useRef<any[]>([]);

  // Khởi tạo kết nối WebSocket cho admin
  const connect = useCallback(async () => {
    if (!adminId || connected) return;

    try {
      const SockJS = (window as any).SockJS;
      const Stomp = (window as any).Stomp;

      if (!SockJS || !Stomp) {
        setError('SockJS hoặc STOMP chưa được load. Vui lòng thêm CDN vào index.html');
        console.warn('Please add CDN to index.html: sockjs-client and stompjs');
        return;
      }

      const socket = new SockJS('http://localhost:8080/ws/chat');
      const client = Stomp.over(socket);

      client.connect({}, () => {
        console.log('Admin WebSocket connected');
        setConnected(true);
        setError(null);

        // Subscribe vào unread messages
        const unreadSub = client.subscribe(`/app/admin/unread/${adminId}`, () => {
          console.log('Admin subscribed to unread messages');
        });
        subscriptionsRef.current.push(unreadSub);
      }, (error: any) => {
        console.error('Admin WebSocket connection error:', error);
        setError('Không thể kết nối WebSocket');
        setConnected(false);
      });

      clientRef.current = client;
    } catch (err: any) {
      console.error('Error initializing admin WebSocket:', err);
      setError('Lỗi khởi tạo WebSocket');
      setConnected(false);
    }
  }, [adminId, connected]);

  // Ngắt kết nối
  const disconnect = useCallback(() => {
    if (clientRef.current?.connected) {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];

      clientRef.current.disconnect(() => {
        console.log('Admin WebSocket disconnected');
        setConnected(false);
      });
    }
  }, []);

  // Subscribe vào cuộc hội thoại (MongoDB String ID)
  const subscribeToConversation = useCallback((conversationId: string) => {
    if (!clientRef.current?.connected) {
      setError('WebSocket chưa kết nối');
      return;
    }

    try {
      const subscription = clientRef.current.subscribe(
        `/topic/chat.${conversationId}`,
        (message: any) => {
          const body = JSON.parse(message.body);
          console.log('Admin received message:', body);

          setConversations(prev => {
            const updated = new Map(prev);
            const msgs = updated.get(conversationId) || [];
            updated.set(conversationId, [...msgs, body]);
            return updated;
          });
        }
      );

      subscriptionsRef.current.push(subscription);
      console.log('Admin subscribed to conversation:', conversationId);
    } catch (err) {
      console.error('Error admin subscribing to conversation:', err);
      setError('Lỗi khi subscribe vào cuộc hội thoại');
    }
  }, []);

  // Gửi tin nhắn admin (MongoDB String conversationId)
  const sendMessage = useCallback(
    (conversationId: string, content: string, messageType: string = 'TEXT') => {
      if (!clientRef.current?.connected) {
        setError('WebSocket chưa kết nối');
        return;
      }

      try {
        const message = {
          conversationId,
          content,
          messageType
        };

        clientRef.current.send('/app/admin/chat.send', {}, JSON.stringify(message));
        console.log('Admin message sent:', message);
      } catch (err) {
        console.error('Error sending admin message:', err);
        setError('Lỗi khi gửi tin nhắn');
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    conversations,
    error,
    connect,
    disconnect,
    subscribeToConversation,
    sendMessage
  };
};
