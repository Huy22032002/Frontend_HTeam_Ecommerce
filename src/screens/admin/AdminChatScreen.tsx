import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemButton, Divider, TextField, Button, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useChat } from '../../hooks/useChat';

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
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAdminConversations, sendAdminMessage, getConversationById } = useChat();

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await getAdminConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
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
    if (!selectedConversationId) return;
    try {
      const data = await getConversationById(selectedConversationId);
      setMessages(data?.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim()) return;

    try {
      await sendAdminMessage(selectedConversationId, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
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
              {messages.map((msg) => (
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
  );
}
