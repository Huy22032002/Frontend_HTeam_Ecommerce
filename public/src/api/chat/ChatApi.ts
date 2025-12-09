import axios from 'axios';
import type { PagedResponse } from '../../models/PagedResponse';

const API_BASE_URL = import.meta.env.VITE_BASE_URL+'/api/chat' || 'https://www.hecommerce.shop' + '/api/chat';

// ==================== Types ====================
export interface ChatMessage {
  id: string;
  conversationId: string;  // Changed to string (MongoDB ID)
  senderId: number;
  customerId: number;
  senderName: string;
  content: string;
  messageType: string;
  senderRole: 'CUSTOMER' | 'ADMIN';
  attachmentUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;  // Changed to string (MongoDB ID)
  customerId: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  adminId?: number;
  adminName?: string;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

export interface SendMessageRequest {
  conversationId: string;  // Changed to string (MongoDB ID)
  content: string;
  messageType?: string;
  attachmentUrl?: string;
}

// ==================== Customer APIs ====================

/**
 * Khách hàng lấy hoặc tạo cuộc hội thoại
 */
export const getOrCreateCustomerConversation = async (
  customerId: number
): Promise<ChatConversation> => {
  const response = await axios.get(
    `${API_BASE_URL}/customers/${customerId}/chat/conversation`
  );
  return response.data;
};

/**
 * Khách hàng gửi tin nhắn
 */
export const sendCustomerMessage = async (
  customerId: number,
  request: SendMessageRequest
): Promise<ChatMessage> => {
  const response = await axios.post(
    `${API_BASE_URL}/customers/${customerId}/chat/messages`,
    request
  );
  return response.data;
};

/**
 * Khách hàng lấy lịch sử tin nhắn của cuộc hội thoại (MongoDB String conversationId)
 */
export const getCustomerMessages = async (
  customerId: number,
  conversationId: string,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<ChatMessage>> => {
  const response = await axios.get(
    `${API_BASE_URL}/customers/${customerId}/chat/conversations/${conversationId}/messages`,
    {
      params: { page, size }
    }
  );
  return response.data;
};

// ==================== Admin APIs ====================

/**
 * Admin gửi tin nhắn (MongoDB String conversationId)
 */
export const sendAdminMessage = async (
  adminId: number,
  conversationId: string,
  request: SendMessageRequest
): Promise<ChatMessage> => {
  const response = await axios.post(
    `${API_BASE_URL}/admins/${adminId}/chat/conversations/${conversationId}/messages`,
    request
  );
  return response.data;
};

/**
 * Admin lấy tin nhắn của một cuộc hội thoại (MongoDB String conversationId)
 */
export const getAdminMessages = async (
  adminId: number,
  conversationId: string,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<ChatMessage>> => {
  const response = await axios.get(
    `${API_BASE_URL}/admins/${adminId}/chat/conversations/${conversationId}/messages`,
    {
      params: { page, size }
    }
  );
  return response.data;
};

/**
 * Admin lấy danh sách cuộc hội thoại được gán
 */
export const getAdminConversations = async (
  adminId: number,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<ChatConversation>> => {
  const response = await axios.get(
    `${API_BASE_URL}/admins/${adminId}/chat/conversations`,
    {
      params: { page, size }
    }
  );
  return response.data;
};

/**
 * Admin lấy danh sách cuộc hội thoại có tin nhắn chưa đọc
 */
export const getUnreadConversations = async (
  adminId: number,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<ChatConversation>> => {
  const response = await axios.get(
    `${API_BASE_URL}/admins/${adminId}/chat/unread-conversations`,
    {
      params: { page, size }
    }
  );
  return response.data;
};

/**
 * Admin gán cuộc hội thoại cho mình (MongoDB String conversationId)
 */
export const assignConversationToAdmin = async (
  adminId: number,
  conversationId: string,
  adminName: string = 'Admin'
): Promise<ChatConversation> => {
  const response = await axios.put(
    `${API_BASE_URL}/admins/${adminId}/chat/conversations/${conversationId}/assign`,
    {},
    {
      params: { adminName }
    }
  );
  return response.data;
};

/**
 * Admin đóng cuộc hội thoại (MongoDB String conversationId)
 */
export const closeConversation = async (
  adminId: number,
  conversationId: string
): Promise<ChatConversation> => {
  const response = await axios.put(
    `${API_BASE_URL}/admins/${adminId}/chat/conversations/${conversationId}/close`
  );
  return response.data;
};

/**
 * Admin mở lại cuộc hội thoại (MongoDB String conversationId)
 */
export const reopenConversation = async (
  adminId: number,
  conversationId: string
): Promise<ChatConversation> => {
  const response = await axios.put(
    `${API_BASE_URL}/admins/${adminId}/chat/conversations/${conversationId}/reopen`
  );
  return response.data;
};

// ==================== Common APIs ====================

/**
 * Đánh dấu tin nhắn là đã đọc
 */
export const markMessageAsRead = async (messageId: string): Promise<any> => {
  const response = await axios.put(
    `${API_BASE_URL}/messages/${messageId}/read`
  );
  return response.data;
};

/**
 * Đánh dấu tất cả tin nhắn trong cuộc hội thoại là đã đọc (MongoDB String conversationId)
 */
export const markAllMessagesAsRead = async (
  conversationId: string,
  senderId: number
): Promise<any> => {
  const response = await axios.put(
    `${API_BASE_URL}/conversations/${conversationId}/mark-all-read`,
    {},
    {
      params: { senderId }
    }
  );
  return response.data;
};

/**
 * Lấy cuộc hội thoại theo ID (MongoDB String conversationId)
 */
export const getConversationById = async (
  conversationId: string
): Promise<ChatConversation> => {
  const response = await axios.get(
    `${API_BASE_URL}/conversations/${conversationId}`
  );
  return response.data;
};

/**
 * Admin lấy tất cả cuộc hội thoại ACTIVE
 */
export const getActiveConversations = async (
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<ChatConversation>> => {
  const response = await axios.get(
    `${API_BASE_URL}/conversations/active`,
    {
      params: { page, size }
    }
  );
  return response.data;
};
