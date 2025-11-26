import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemButton, Divider, TextField, Button, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
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
  const [wsMessages, setWsMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAdminConversations, sendAdminMessage, getAdminMessages } = useChat();
  const { connect, disconnect, subscribe, unsubscribe, send: sendWebSocketMessage, isConnected } = useWebSocket();
  
  // Try multiple ways to get adminId
  const userState = useSelector((state: any) => state.user);
  let adminId = userState?.user?.id || null;
  
  // Fallback: Try to extract from localStorage or other sources
  if (!adminId) {
    // Try from localStorage (if stored during login)
    const stored = localStorage.getItem('adminId');
    adminId = stored ? parseInt(stored) : null;
  }
  
  // DEBUG: Log Redux state
  useEffect(() => {
    console.log('AdminChatScreen - userState:', userState);
    console.log('AdminChatScreen - adminId final:', adminId);
  }, [userState, adminId]);

  // Connect to WebSocket
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Subscribe to conversation topic when conversation selected
  useEffect(() => {
    if (isConnected && selectedConversationId) {
      subscribe(
        `/topic/chat.${selectedConversationId}`,
        (message) => {
          console.log('Admin received WebSocket message:', message);
          setWsMessages(prev => [...prev, message]);
        },
        `admin-chat-${selectedConversationId}`
      );

      return () => {
        unsubscribe(`admin-chat-${selectedConversationId}`);
      };
    }
  }, [isConnected, selectedConversationId, subscribe, unsubscribe]);

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
      // Add message to local state immediately for instant feedback
      const localMessage = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversationId,
        content: messageToSend,
        senderRole: 'ADMIN',
        senderId: adminId,
        messageType: 'TEXT',
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setWsMessages(prev => [...prev, localMessage]);

      // Send via WebSocket for real-time delivery
      sendWebSocketMessage('/app/admin/chat.send', {
        conversationId: selectedConversationId,
        content: messageToSend,
        messageType: 'TEXT',
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error sending message';
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
        <Box sx={{ display: 'flex', flex: 1 }}>
      {/* Conversations List */}
      <Paper
        sx={{
          width: '30%',
          borderRadius: 0,
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Cuộc hội thoại ({conversations.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {conversations.map((conv) => (
              <React.Fragment key={conv.id}>
                <ListItemButton
                  selected={selectedConversationId === conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  sx={{
                    backgroundColor: selectedConversationId === conv.id ? '#e3f2fd' : 'transparent',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {conv.customerName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                      {conv.lastMessage || 'Không có tin nhắn'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {new Date(conv.updatedAt).toLocaleTimeString('vi-VN')}
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
        {selectedConversationId ? (
          <>
            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#fafafa' }}>
              {[...messages, ...wsMessages].map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.senderRole === 'ADMIN' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: '70%',
                      p: 1.5,
                      bgcolor: msg.senderRole === 'ADMIN' ? '#2196f3' : '#e0e0e0',
                      color: msg.senderRole === 'ADMIN' ? 'white' : 'black',
                    }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid #ddd', display: 'flex', gap: 1 }}>
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
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Gửi
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Typography variant="body1" sx={{ color: '#999' }}>
              Chọn cuộc hội thoại để bắt đầu
            </Typography>
          </Box>
        )}
      </Box>
        </Box>
      )}
    </Box>
  );
}
