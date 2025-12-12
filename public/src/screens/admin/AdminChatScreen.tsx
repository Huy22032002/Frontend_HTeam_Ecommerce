import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, List, ListItemButton, Divider, TextField, Button, CircularProgress, Avatar, Chip, InputAdornment, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useChat } from '../../hooks/useChat';
import { useSSE } from '../../hooks/useSSE';
import * as ChatApi from '../../api/chat/ChatApi';
import { useSelector } from 'react-redux';
import { getAdminToken } from '../../utils/tokenUtils';

interface Conversation {
  id: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount?: number;
}

export default function AdminChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [sseMessages, setSSEMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagePage, setMessagePage] = useState(0);
  const [totalMessagePages, setTotalMessagePages] = useState(0);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [readConversationIds, setReadConversationIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [searchText, setSearchText] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const { getAdminConversations, getAdminMessages } = useChat();
  const { subscribe, formatMessageTime } = useSSE();
  
  // Try multiple ways to get adminId
  const userState = useSelector((state: any) => state.user);
  let adminId = userState?.user?.id || null;
  
  // Fallback: Try to extract from localStorage or other sources
  if (!adminId) {
    // Try from localStorage (if stored during login)
    const stored = localStorage.getItem('adminId');
    adminId = stored ? parseInt(stored) : null;
  }

  // Connect to SSE (only once)
  useEffect(() => {
    console.log('🔌 AdminChatScreen: SSE hook initialized');
    // SSE doesn't need explicit connection, it connects on demand
  }, []);

  // Subscribe to SSE stream when conversation selected
  useEffect(() => {
    if (selectedConversationId && adminId) {
      console.log('📢 AdminChatScreen: Subscribing to conversation:', selectedConversationId);
      
      const unsubscribeFn = subscribe(
        selectedConversationId,
        (message: any) => {
          console.log('Admin received SSE message:', message);
          setSSEMessages((prev: any[]) => [...prev, message]);
        },
        adminId,
        'admin'
      );

      return () => {
        console.log('🔕 AdminChatScreen: Unsubscribing from conversation:', selectedConversationId);
        if (unsubscribeFn) unsubscribeFn();
      };
    }
  }, [selectedConversationId, adminId, subscribe]);

  // Detect new messages and show button instead of auto-scrolling
  useEffect(() => {
    if (sseMessages.length > 0) {
      setHasNewMessages(true);
    }
  }, [sseMessages]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, [adminId]);

  const loadConversations = async () => {
    if (!adminId) {
      setError('Admin ID not found. Please login again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminConversations(adminId, 0, 20);
      let conversations = data?.content || data || [];
      
      // Apply readConversationIds - set unreadCount to 0 for conversations we've already read
      conversations = conversations.map(conv => 
        readConversationIds.has(conv.id)
          ? { ...conv, unreadCount: 0 }
          : conv
      );
      
      setConversations(conversations);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error loading conversations';
      setError(errorMsg);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversationId) {
      setMessages([]);
      setSSEMessages([]);
      setMessagePage(0);
      loadMessages(0);
    }
  }, [selectedConversationId]);

  const loadMessages = async (pageNum: number = 0) => {
    if (!selectedConversationId || !adminId) return;
    
    const isLoadMore = pageNum > 0;
    if (isLoadMore) {
      setLoadingMoreMessages(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getAdminMessages(adminId, selectedConversationId, pageNum, 20);
      const newMessages = [...(data?.content || [])];
      
      // Set total pages from response
      if (data?.totalPages !== undefined) {
        setTotalMessagePages(data.totalPages);
      }

      if (isLoadMore) {
        // Prepend older messages (they come first since we're loading backwards)
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        // Initial load: reverse to show oldest first, newest last
        const reversedMessages = newMessages.reverse();
        setMessages(reversedMessages);
      }

      setMessagePage(pageNum);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError('Lỗi tải tin nhắn');
    } finally {
      if (isLoadMore) {
        setLoadingMoreMessages(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Combine REST messages + SSE messages, avoid duplicates
  const messageIds = new Set(messages.map(m => m.id));
  const uniqueSSEMessages = sseMessages.filter(m => !messageIds.has(m.id));
  const allMessages = [...messages, ...uniqueSSEMessages];
  const totalConversations = conversations.length;
  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  const activeConversation = conversations.find((c) => c.id === selectedConversationId) || null;
  const filteredConversations = conversations
    .filter((conv) => {
      const matchesFilter = filterMode === 'all' || (conv.unreadCount && conv.unreadCount > 0);
      const q = searchText.trim().toLowerCase();
      if (!q) return matchesFilter;
      return (
        matchesFilter &&
        ([conv.customerName, conv.customerEmail, conv.customerPhone, conv.lastMessage]
          .filter(Boolean)
          .some((field) => (field || '').toLowerCase().includes(q)))
      );
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Scroll to bottom when conversation is selected or messages loaded
  useEffect(() => {
    if (selectedConversationId && messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
        setIsAtBottom(true);
      }, 50);
    }
  }, [selectedConversationId, messages.length]);

  // Mark unread messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && selectedConversationId) {
      const unreadMessages = messages.filter(msg => msg.senderRole === 'CUSTOMER' && !msg.isRead);
      
      if (unreadMessages.length > 0) {
        // Call API to mark all messages as read for this conversation
        ChatApi.markAllMessagesAsRead(selectedConversationId, adminId)
          .then(() => {
            console.log('All messages marked as read for conversation:', selectedConversationId);
            
            // Add to readConversationIds to persist
            setReadConversationIds(prev => new Set([...prev, selectedConversationId]));
            
            // Update local messages to reflect read status
            setMessages(prev => 
              prev.map(msg => 
                unreadMessages.find(um => um.id === msg.id)
                  ? { ...msg, isRead: true }
                  : msg
              )
            );
            
            // Update conversation's unreadCount to 0
            setConversations(prev => 
              prev.map(conv => 
                conv.id === selectedConversationId 
                  ? { ...conv, unreadCount: 0 }
                  : conv
              )
            );
          })
          .catch(err => {
            console.error('Error marking messages as read:', err);
            setError('Lỗi đánh dấu tin nhắn đã đọc');
          });
      }
    }
  }, [messages, selectedConversationId, adminId]);

  // Append new SSE messages to messages list so they persist
  useEffect(() => {
    if (uniqueSSEMessages.length > 0) {
      // Only append if not already in messages
      const messageIds = new Set(messages.map(m => m.id));
      const toAppend = uniqueSSEMessages.filter(m => !messageIds.has(m.id));
      
      if (toAppend.length > 0) {
        setMessages(prev => [...prev, ...toAppend]);
      }
    }
  }, [uniqueSSEMessages]);

  // Detect new SSE messages - auto-scroll if at bottom, show button if scrolled up
  useEffect(() => {
    if (uniqueSSEMessages.length > 0 && messagesContainerRef.current) {
      // Delay to ensure messages are added to DOM before checking scroll position
      setTimeout(() => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 30;
        setIsAtBottom(atBottom);
        
        if (atBottom) {
          // Auto-scroll to bottom
          setHasNewMessages(false);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 0);
        } else {
          // Show button if not at bottom - with additional delay to let auto-scroll complete
          setTimeout(() => {
            setHasNewMessages(true);
          }, 500);
        }
      }, 50); // Wait for DOM to update with new messages
    }
  }, [uniqueSSEMessages]);

  // Clear button notification when user reads messages by scrolling to bottom
  useEffect(() => {
    if (isAtBottom && hasNewMessages) {
      setHasNewMessages(false);
    }
  }, [isAtBottom, hasNewMessages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessages(false);
      setIsAtBottom(true);
    }
  };

  // Detect if user is at bottom of messages
  const handleMessagesScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 30;
      setIsAtBottom(atBottom);
      // Auto-clear button when user scrolls to bottom
      if (atBottom) {
        setHasNewMessages(false);
        // Only clear SSE messages if they've been added to main messages list
        // (to avoid clearing messages that just arrived from SSE)
        setTimeout(() => {
          setSSEMessages([]);
        }, 200);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!adminId || !selectedConversationId || !newMessage.trim()) {
      setError('Admin ID or conversation not selected');
      return;
    }

    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately

    try {
      // Send message via HTTP POST REST API
      // The backend will publish to RabbitMQ and broadcast via SSE
      // Don't add to local state - wait for SSE broadcast from server
      const response = await fetch(`${import.meta.env.VITE_BASE_URL+'/api' || 'https://www.hecommerce.shop/api'}/admins/${adminId}/chat/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          content: messageToSend,
          messageType: 'TEXT',
        })
      });

      if (!response.ok) {
        console.error('Failed to send message:', response.statusText);
        setError('Failed to send message');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error sending message';
      setError(errorMsg);
      console.error('Error sending message:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f6f8fb' }}>
      {error && (
        <Box sx={{ p: 2, bgcolor: '#ffefef', borderBottom: '1px solid #ffd6d6' }}>
          <Typography variant="body2" sx={{ color: '#c62828' }}>
            ⚠️ {error}
          </Typography>
        </Box>
      )}

      {!adminId && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: '#999' }}>
            Vui lòng đăng nhập admin để xem cuộc hội thoại
          </Typography>
        </Box>
      )}

      {adminId && (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 6px 18px rgba(0,0,0,0.05)', border: '1px solid #e8eef5' }}>
              <Typography variant="subtitle2" sx={{ color: '#607d8b', mb: 0.5 }}>Tổng cuộc hội thoại</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0d47a1' }}>{totalConversations}</Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 6px 18px rgba(0,0,0,0.05)', border: '1px solid #e8eef5' }}>
              <Typography variant="subtitle2" sx={{ color: '#607d8b', mb: 0.5 }}>Tin chưa đọc</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#c62828' }}>{totalUnread}</Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 6px 18px rgba(0,0,0,0.05)', border: '1px solid #e8eef5' }}>
              <Typography variant="subtitle2" sx={{ color: '#607d8b', mb: 0.5 }}>Đang xem</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>{activeConversation ? 1 : 0}</Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 2, flex: 1, minHeight: 0 }}>
            <Paper sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,0.06)', border: '1px solid #e5ecf2' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e6ed', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm theo tên, email, SĐT, nội dung..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton onClick={loadConversations} disabled={loading} sx={{ bgcolor: '#f5f8fc', border: '1px solid #e0e6ed' }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`Tất cả (${totalConversations})`}
                    color={filterMode === 'all' ? 'primary' : 'default'}
                    variant={filterMode === 'all' ? 'filled' : 'outlined'}
                    onClick={() => setFilterMode('all')}
                  />
                  <Chip
                    label={`Chưa đọc (${totalUnread})`}
                    color={filterMode === 'unread' ? 'primary' : 'default'}
                    variant={filterMode === 'unread' ? 'filled' : 'outlined'}
                    onClick={() => setFilterMode('unread')}
                  />
                </Box>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 6 }}>
                  <CircularProgress size={26} />
                </Box>
              ) : filteredConversations.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">Không có cuộc hội thoại</Typography>
                </Box>
              ) : (
                <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                  {filteredConversations.map((conv, idx) => (
                    <React.Fragment key={conv.id}>
                      <ListItemButton
                        selected={selectedConversationId === conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        sx={{
                          alignItems: 'flex-start',
                          py: 1.5,
                          gap: 1,
                          backgroundColor: selectedConversationId === conv.id ? '#eef5ff' : 'transparent',
                          '&:hover': { backgroundColor: '#f5f8fc' },
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2' }}>
                          {conv.customerName ? conv.customerName.charAt(0).toUpperCase() : 'K'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.customerName || 'Khách hàng'}
                            </Typography>
                            {conv.unreadCount && conv.unreadCount > 0 && (
                              <Chip label={`${conv.unreadCount} mới`} size="small" color="error" />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', color: '#607d8b', mb: 0.25 }}>
                            ID: {conv.customerId} • {conv.customerPhone || conv.customerEmail || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#546e7a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.lastMessage || '(Chưa có tin nhắn)'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#90a4ae' }}>
                            Cập nhật: {new Date(conv.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </ListItemButton>
                      {idx < filteredConversations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>

            <Paper sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,0.06)', border: '1px solid #e5ecf2' }}>
              {selectedConversationId && activeConversation ? (
                <>
                  <Box sx={{ p: 2, borderBottom: '1px solid #e0e6ed', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#1e88e5', width: 44, height: 44 }}>
                      {activeConversation.customerName ? activeConversation.customerName.charAt(0).toUpperCase() : 'K'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeConversation.customerName || 'Khách hàng'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#607d8b' }}>
                        {activeConversation.customerPhone || activeConversation.customerEmail || 'Không có liên hệ' }
                      </Typography>
                    </Box>
                    {activeConversation.unreadCount && activeConversation.unreadCount > 0 && (
                      <Chip label={`${activeConversation.unreadCount} chưa đọc`} color="error" size="small" />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, overflow: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }} ref={messagesContainerRef} onScroll={handleMessagesScroll}>
                    {messagePage < totalMessagePages - 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => loadMessages(messagePage + 1)}
                          disabled={loadingMoreMessages}
                          sx={{ textTransform: 'none' }}
                        >
                          {loadingMoreMessages ? '⏳ Đang tải...' : '📜 Xem thêm tin nhắn cũ'}
                        </Button>
                      </Box>
                    )}

                    {allMessages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.senderRole === 'ADMIN' ? 'flex-end' : 'flex-start',
                          animation: 'fadeIn 0.25s ease-in',
                          '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(8px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                          },
                        }}
                      >
                        <Paper
                          sx={{
                            maxWidth: '70%',
                            p: '10px 14px',
                            bgcolor: msg.senderRole === 'ADMIN' ? '#1976d2' : '#f1f5f9',
                            color: msg.senderRole === 'ADMIN' ? '#fff' : '#0f172a',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                          }}
                        >
                          <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                            {msg.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mt: 0.5, opacity: 0.75, textAlign: msg.senderRole === 'ADMIN' ? 'right' : 'left' }}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}

                    <div ref={messagesEndRef} />
                  </Box>

                  {hasNewMessages && !isAtBottom && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, background: 'linear-gradient(to bottom, rgba(33, 150, 243, 0.05), transparent)', borderTop: '1px solid #e0e6ed' }}>
                      <Button variant="contained" color="primary" onClick={scrollToBottom} sx={{ borderRadius: '22px', textTransform: 'none', fontWeight: 700 }}>
                        Có tin nhắn mới ⬇️
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ p: 2, borderTop: '1px solid #e0e6ed', display: 'flex', gap: 1, bgcolor: '#f8fafc' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '20px',
                          backgroundColor: 'white',
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Gửi
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1.5, color: '#90a4ae' }}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 62, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#607d8b', fontWeight: 600 }}>
                    Chọn cuộc hội thoại để bắt đầu
                  </Typography>
                  <Typography variant="body2">Danh sách hiển thị ở cột bên trái</Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
}
