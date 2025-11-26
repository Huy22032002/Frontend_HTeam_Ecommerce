import { useCallback, useEffect, useState } from 'react';
import * as ChatApi from '../api/chat/ChatApi';
import type { ChatMessage, ChatConversation, SendMessageRequest } from '../api/chat/ChatApi';

/**
 * Hook để quản lý cuộc hội thoại và tin nhắn của khách hàng
 */
export const useCustomerChat = (customerId: number | null) => {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy hoặc tạo cuộc hội thoại
  const initializeConversation = useCallback(async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);
      const conv = await ChatApi.getOrCreateCustomerConversation(customerId);
      setConversation(conv);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi tạo cuộc hội thoại');
      console.error('Error initializing conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (content: string, messageType: string = 'TEXT', attachmentUrl?: string) => {
      if (!conversation) {
        setError('Cuộc hội thoại chưa được khởi tạo');
        return null;
      }

      try {
        setError(null);
        const request: SendMessageRequest = {
          conversationId: conversation.id,
          content,
          messageType,
          attachmentUrl
        };

        const message = await ChatApi.sendCustomerMessage(customerId!, request);
        setMessages(prev => [...prev, message]);

        // Cập nhật thông tin cuộc hội thoại
        setConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            lastMessage: content,
            lastMessageTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });

        return message;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Lỗi khi gửi tin nhắn';
        setError(errorMsg);
        console.error('Error sending message:', err);
        return null;
      }
    },
    [conversation, customerId]
  );

  // Lấy lịch sử tin nhắn
  const loadMessages = useCallback(
    async (page: number = 0, size: number = 20) => {
      if (!conversation) return;

      try {
        setLoading(true);
        setError(null);
        const result = await ChatApi.getCustomerMessages(customerId!, conversation.id, page, size);
        // Reverse to show oldest first (bottom) to newest last (top)
        const reversedMessages = [...(result.content || [])].reverse();
        setMessages(reversedMessages);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Lỗi khi lấy tin nhắn');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    },
    [conversation, customerId]
  );

  // Đánh dấu tin nhắn là đã đọc
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await ChatApi.markMessageAsRead(messageId);
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? { ...msg, isRead: true } : msg))
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  // Load messages khi conversation được tạo
  useEffect(() => {
    if (conversation?.id) {
      loadMessages(0, 20);
    }
  }, [conversation?.id, loadMessages]);

  // Khởi tạo khi component mount
  useEffect(() => {
    if (customerId) {
      initializeConversation();
    }
  }, [customerId, initializeConversation]);

  return {
    conversation,
    messages,
    loading,
    error,
    sendMessage,
    loadMessages,
    markAsRead,
    initializeConversation
  };
};

/**
 * Hook để quản lý danh sách cuộc hội thoại của admin
 */
export const useAdminChatConversations = (adminId: number | null) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [unreadConversations, setUnreadConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách cuộc hội thoại được gán
  const loadConversations = useCallback(
    async (page: number = 0, size: number = 20) => {
      if (!adminId) return;

      try {
        setLoading(true);
        setError(null);
        const result = await ChatApi.getAdminConversations(adminId, page, size);
        setConversations(result.content || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Lỗi khi lấy danh sách cuộc hội thoại');
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    },
    [adminId]
  );

  // Lấy danh sách cuộc hội thoại có tin nhắn chưa đọc
  const loadUnreadConversations = useCallback(
    async (page: number = 0, size: number = 20) => {
      if (!adminId) return;

      try {
        setError(null);
        const result = await ChatApi.getUnreadConversations(adminId, page, size);
        setUnreadConversations(result.content || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Lỗi khi lấy cuộc hội thoại chưa đọc');
        console.error('Error loading unread conversations:', err);
      }
    },
    [adminId]
  );

  // Gán cuộc hội thoại cho admin (MongoDB String conversationId)
  const assignConversation = useCallback(
    async (conversationId: string, adminName: string) => {
      if (!adminId) return null;

      try {
        setError(null);
        const updated = await ChatApi.assignConversationToAdmin(adminId, conversationId, adminName);
        
        // Cập nhật danh sách
        setConversations(prev =>
          prev.map(conv => (conv.id === conversationId ? updated : conv))
        );

        return updated;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Lỗi khi gán cuộc hội thoại';
        setError(errorMsg);
        console.error('Error assigning conversation:', err);
        return null;
      }
    },
    [adminId]
  );

  // Đóng cuộc hội thoại (MongoDB String conversationId)
  const closeConversation = useCallback(
    async (conversationId: string) => {
      if (!adminId) return null;

      try {
        setError(null);
        const updated = await ChatApi.closeConversation(adminId, conversationId);
        
        // Cập nhật danh sách
        setConversations(prev =>
          prev.filter(conv => conv.id !== conversationId)
        );

        return updated;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Lỗi khi đóng cuộc hội thoại';
        setError(errorMsg);
        console.error('Error closing conversation:', err);
        return null;
      }
    },
    [adminId]
  );

  // Mở lại cuộc hội thoại (MongoDB String conversationId)
  const reopenConversation = useCallback(
    async (conversationId: string) => {
      if (!adminId) return null;

      try {
        setError(null);
        const updated = await ChatApi.reopenConversation(adminId, conversationId);
        
        // Cập nhật danh sách
        setConversations(prev =>
          prev.map(conv => (conv.id === conversationId ? updated : conv))
        );

        return updated;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Lỗi khi mở lại cuộc hội thoại';
        setError(errorMsg);
        console.error('Error reopening conversation:', err);
        return null;
      }
    },
    [adminId]
  );

  return {
    conversations,
    unreadConversations,
    loading,
    error,
    loadConversations,
    loadUnreadConversations,
    assignConversation,
    closeConversation,
    reopenConversation
  };
};

/**
 * Hook để quản lý tin nhắn trong cuộc hội thoại (cho admin - MongoDB String conversationId)
 */
export const useAdminChatMessages = (adminId: number | null, conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy lịch sử tin nhắn
  const loadMessages = useCallback(
    async (page: number = 0, size: number = 20) => {
      if (!adminId || !conversationId) return;

      try {
        setLoading(true);
        setError(null);
        // Sử dụng endpoint khách hàng vì logic lấy tin nhắn giống nhau
        const result = await ChatApi.getCustomerMessages(adminId, conversationId, page, size);
        // Reverse to show oldest first (bottom) to newest last (top)
        const reversedMessages = [...(result.content || [])].reverse();
        setMessages(reversedMessages);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Lỗi khi lấy tin nhắn');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    },
    [adminId, conversationId]
  );

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (content: string, messageType: string = 'TEXT', attachmentUrl?: string) => {
      if (!adminId || !conversationId) {
        setError('Admin hoặc cuộc hội thoại chưa được khởi tạo');
        return null;
      }

      try {
        setError(null);
        const request: SendMessageRequest = {
          conversationId,
          content,
          messageType,
          attachmentUrl
        };

        const message = await ChatApi.sendAdminMessage(adminId, conversationId, request);
        setMessages(prev => [...prev, message]);
        return message;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Lỗi khi gửi tin nhắn';
        setError(errorMsg);
        console.error('Error sending message:', err);
        return null;
      }
    },
    [adminId, conversationId]
  );

  // Đánh dấu tất cả tin nhắn là đã đọc
  const markAllAsRead = useCallback(
    async (senderId: number) => {
      if (!conversationId) return;

      try {
        await ChatApi.markAllMessagesAsRead(conversationId, senderId);
        setMessages(prev =>
          prev.map(msg => (msg.senderId === senderId ? { ...msg, isRead: true } : msg))
        );
      } catch (err) {
        console.error('Error marking all messages as read:', err);
      }
    },
    [conversationId]
  );

  return {
    messages,
    loading,
    error,
    loadMessages,
    sendMessage,
    markAllAsRead
  };
};

/**
 * Unified hook cho cả Customer và Admin Chat
 */
export const useChat = () => {
  return {
    // Customer APIs
    getOrCreateCustomerConversation: ChatApi.getOrCreateCustomerConversation,
    sendCustomerMessage: ChatApi.sendCustomerMessage,
    getCustomerMessages: ChatApi.getCustomerMessages,
    
    // Admin APIs
    sendAdminMessage: ChatApi.sendAdminMessage,
    getAdminMessages: ChatApi.getAdminMessages,
    getAdminConversations: ChatApi.getAdminConversations,
    getUnreadConversations: ChatApi.getUnreadConversations,
    assignConversationToAdmin: ChatApi.assignConversationToAdmin,
    closeConversation: ChatApi.closeConversation,
    reopenConversation: ChatApi.reopenConversation,
    
    // Common APIs
    getConversationById: ChatApi.getConversationById,
    markAllMessagesAsRead: ChatApi.markAllMessagesAsRead,
    markMessageAsRead: ChatApi.markMessageAsRead,
    getActiveConversations: ChatApi.getActiveConversations
  };
};
