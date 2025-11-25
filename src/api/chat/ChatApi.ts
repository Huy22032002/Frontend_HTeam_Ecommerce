import axios from 'axios';
import type { PagedResponse } from '../../models/PagedResponse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const CHAT_API_BASE = `${API_BASE_URL}/chat`;

// ==================== Types ====================
export interface ChatMessage {
  id: string;
  conversationId: number;
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
  id: number;
  customerId: number;
  customerName: string;
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
  conversationId: number;
  content: string;
  messageType?: string;
  attachmentUrl?: string;
}

// ==================== Customer APIs ====================

/**
 * Khách hàng lấy hoặc tạo cuộc hội thoại
 */
export const getOrCreateCustomerConversation = async (
  customerId: number,
  customerName: string = 'Khách hàng'
): Promise<ChatConversation> => {
  const response = await axios.get(
    `${CHAT_API_BASE}/customers/${customerId}/conversation`,
    {
      params: { customerName }
    }
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
    `${CHAT_API_BASE}/customers/${customerId}/messages`,
    request
  );
  return response.data;
};

/**
 * Khách hàng lấy lịch sử tin nhắn của cuộc hội thoại
 */
export const getCustomerMessages = async (
  customerId: number,
  conversationId: number,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<ChatMessage>> => {
  const response = await axios.get(
    `${CHAT_API_BASE}/customers/${customerId}/conversations/${conversationId}/messages`,
    {
      params: { page, size }
    }
  );
  return response.data;
};

// ==================== Admin APIs ====================

/**
 * Admin gửi tin nhắn
 */
export const sendAdminMessage = async (
  adminId: number,
  conversationId: number,
  request: SendMessageRequest
): Promise<ChatMessage> => {
  const response = await axios.post(
    `${CHAT_API_BASE}/admins/${adminId}/conversations/${conversationId}/messages`,
    request
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
    `${CHAT_API_BASE}/admins/${adminId}/conversations`,
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
    `${CHAT_API_BASE}/admins/${adminId}/unread-conversations`,
    {
      params: { page, size }
    }
  );
  return response.data;
};

/**
 * Admin gán cuộc hội thoại cho mình
 */
export const assignConversationToAdmin = async (
  adminId: number,
  conversationId: number,
  adminName: string = 'Admin'
): Promise<ChatConversation> => {
  const response = await axios.put(
    `${CHAT_API_BASE}/admins/${adminId}/conversations/${conversationId}/assign`,
    {},
    {
      params: { adminName }
    }
  );
  return response.data;
};

/**
 * Admin đóng cuộc hội thoại
 */
export const closeConversation = async (
  adminId: number,
  conversationId: number
): Promise<ChatConversation> => {
  const response = await axios.put(
    `${CHAT_API_BASE}/admins/${adminId}/conversations/${conversationId}/close`
  );
  return response.data;
};

/**
 * Admin mở lại cuộc hội thoại
 */
export const reopenConversation = async (
  adminId: number,
  conversationId: number
): Promise<ChatConversation> => {
  const response = await axios.put(
    `${CHAT_API_BASE}/admins/${adminId}/conversations/${conversationId}/reopen`
  );
  return response.data;
};

// ==================== Common APIs ====================

/**
 * Đánh dấu tin nhắn là đã đọc
 */
export const markMessageAsRead = async (messageId: string): Promise<any> => {
  const response = await axios.put(
    `${CHAT_API_BASE}/messages/${messageId}/read`
  );
  return response.data;
};

/**
 * Đánh dấu tất cả tin nhắn trong cuộc hội thoại là đã đọc
 */
export const markAllMessagesAsRead = async (
  conversationId: number,
  senderId: number
): Promise<any> => {
  const response = await axios.put(
    `${CHAT_API_BASE}/conversations/${conversationId}/mark-all-read`,
    {},
    {
      params: { senderId }
    }
  );
  return response.data;
};

/**
 * Lấy cuộc hội thoại theo ID
 */
export const getConversationById = async (
  conversationId: number
): Promise<ChatConversation> => {
  const response = await axios.get(
    `${CHAT_API_BASE}/conversations/${conversationId}`
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
    `${CHAT_API_BASE}/conversations/active`,
    {
      params: { page, size }
    }
  );
  return response.data;
};
