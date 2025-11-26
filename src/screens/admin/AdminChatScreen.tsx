import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, List, ListItemButton, Divider, TextField, Button, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useChat } from '../../hooks/useChat';
import { useSSE } from '../../hooks/useSSE';
import { useSelector } from 'react-redux';

interface Conversation {
  id: string;
  customerId: number;
  customerName: string;
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
  const { getAdminConversations, getAdminMessages } = useChat();
  const { subscribe } = useSSE();
  
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
      setConversations(data?.content || data || []);
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
      loadMessages();
    }
  }, [selectedConversationId]);

  const loadMessages = async () => {
    if (!selectedConversationId || !adminId) return;
    try {
      const data = await getAdminMessages(adminId, selectedConversationId, 0, 20);
      // Reverse to show oldest first (bottom) to newest last (top)
      const reversedMessages = [...(data?.content || [])].reverse();
      setMessages(reversedMessages);
    } catch (err: any) {
      console.error('Error loading messages:', err);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admins/${adminId}/chat/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5', flexDirection: 'column' }}>
      {/* Error Alert */}
      {error && (
        <Box sx={{ p: 2, bgcolor: '#ffebee', borderBottom: '1px solid #ffcdd2' }}>
          <Typography variant="body2" sx={{ color: '#c62828' }}>
            ⚠️ {error}
          </Typography>
        </Box>
      )}

      {/* Not logged in */}
      {!adminId && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: '#999' }}>
            Please login as admin to view conversations
          </Typography>
        </Box>
      )}

      {/* Chat Interface */}
      {adminId && (
        <Box sx={{ display: 'flex', flex: 1, gap: 0 }}>
          {/* Conversations List */}
          <Paper
            sx={{
              width: '35%',
              borderRadius: 0,
              boxShadow: 'none',
              border: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#fafafa',
            }}
          >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            💬 Cuộc hội thoại ({conversations.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {conversations.map((conv) => (
              <React.Fragment key={conv.id}>
                <ListItemButton
                  selected={selectedConversationId === conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  sx={{
                    backgroundColor: selectedConversationId === conv.id ? '#e3f2fd' : '#fafafa',
                    '&:hover': { backgroundColor: selectedConversationId === conv.id ? '#e3f2fd' : '#f5f5f5' },
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'all 0.2s ease',
                    py: 1.5,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                      {conv.customerName || 'Khách hàng'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#666', 
                        display: 'block', 
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {conv.lastMessage || '(Chưa có tin nhắn)'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
                      {new Date(conv.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {conv.unreadCount && conv.unreadCount > 0 && (
                    <Box
                      sx={{
                        bgcolor: '#ff5252',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {conv.unreadCount}
                    </Box>
                  )}
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff', borderLeft: '1px solid #e0e0e0' }}>
        {selectedConversationId ? (
          <>
            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2.5, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(() => {
                // Deduplicate messages: exclude SSE messages that are already in REST messages
                const uniqueMessageIds = new Set(messages.map(m => m.id));
                const filteredSSEMessages = sseMessages.filter(msg => !uniqueMessageIds.has(msg.id));
                const allMessages = [...messages, ...filteredSSEMessages];
                return allMessages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.senderRole === 'ADMIN' ? 'flex-end' : 'flex-start',
                      mb: 0.5,
                      animation: 'fadeIn 0.3s ease-in',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                  <Paper
                    sx={{
                      maxWidth: '65%',
                      p: '10px 14px',
                      bgcolor: msg.senderRole === 'ADMIN' ? '#2196f3' : '#f0f0f0',
                      color: msg.senderRole === 'ADMIN' ? 'white' : '#000',
                      borderRadius: '12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                      {msg.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        opacity: 0.7,
                        fontSize: '0.75rem',
                        textAlign: msg.senderRole === 'ADMIN' ? 'right' : 'left'
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                </Box>
                ));
              })()}
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1, bgcolor: '#fafafa' }}>
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
                    '&:hover fieldset': { borderColor: '#2196f3' },
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
              >
                Gửi
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 2 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 60, color: '#ccc', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#999', fontWeight: 500 }}>
              Chọn cuộc hội thoại để bắt đầu
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              Danh sách cuộc hội thoại hiển thị ở bên trái
            </Typography>
          </Box>
        )}
      </Box>
      </Box>
      )}
    </Box>
  );
}
