import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useCustomerChat } from '../../hooks/useChat';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface ChatBoxProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ isOpen = true, onClose }) => {
  const customer = useSelector((state: RootState) => state.customerAuth.customer);
  const customerId = customer?.id;

  const { conversation, messages, loading, error, sendMessage, markAsRead } = useCustomerChat(customerId || null);

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động scroll đến tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Đánh dấu tin nhắn từ admin là đã đọc
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.senderRole === 'ADMIN' && !msg.isRead) {
        markAsRead(msg.id);
      }
    });
  }, [messages, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setIsSending(true);
    const success = await sendMessage(messageText);
    setIsSending(false);

    if (success) {
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  if (!customerId) {
    return (
      <Paper
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 350,
          maxHeight: 500,
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="body2">Vui lòng đăng nhập để sử dụng chat</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 380,
        maxHeight: 600,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        backgroundColor: '#fff'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: '4px 4px 0 0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutlineIcon />
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            Hỗ trợ khách hàng
          </Typography>
        </Box>
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Messages List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#f5f5f5',
          minHeight: 300
        }}
      >
        {loading && !messages.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">Hãy bắt đầu cuộc hội thoại</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <ListItem
                  sx={{
                    flexDirection: msg.senderRole === 'CUSTOMER' ? 'row-reverse' : 'row',
                    mb: 1,
                    alignItems: 'flex-start'
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{
                        bgcolor: msg.senderRole === 'CUSTOMER' ? 'primary.main' : 'success.main',
                        width: 32,
                        height: 32
                      }}
                    >
                      {msg.senderRole === 'CUSTOMER' ? 'K' : 'A'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Paper
                        sx={{
                          p: 1.5,
                          backgroundColor: msg.senderRole === 'CUSTOMER' ? 'primary.light' : '#fff',
                          borderRadius: 2,
                          maxWidth: '70%',
                          wordBreak: 'break-word',
                          border: msg.senderRole === 'ADMIN' ? '1px solid #e0e0e0' : 'none'
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </Typography>
                      </Paper>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          textAlign: msg.senderRole === 'CUSTOMER' ? 'right' : 'left',
                          color: 'text.secondary'
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {msg.senderRole === 'CUSTOMER' && msg.isRead && ' ✓'}
                      </Typography>
                    }
                    sx={{ ml: msg.senderRole === 'CUSTOMER' ? 1 : 0 }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 1, fontSize: '0.875rem' }}>
          {error}
        </Alert>
      )}

      {/* Input */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Nhập tin nhắn..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || loading}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Đính kèm tệp">
                    <span>
                      <IconButton size="small" disabled>
                        <AttachFileIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending || loading}
            sx={{ minWidth: 40, height: 40 }}
          >
            {isSending ? <CircularProgress size={20} /> : <SendIcon />}
          </Button>
        </Box>
        {conversation?.status === 'CLOSED' && (
          <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem' }}>
            Cuộc hội thoại đã đóng. Vui lòng tạo cuộc hội thoại mới để tiếp tục
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default ChatBox;
