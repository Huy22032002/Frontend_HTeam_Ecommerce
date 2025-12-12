import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
  List,
  Snackbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useCustomerChat } from '../../hooks/useChat';
import { useSSE } from '../../hooks/useSSE';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { getCustomerToken } from '../../utils/tokenUtils';

interface ChatBoxProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ isOpen = true, onClose }) => {
  const customer = useSelector((state: RootState) => state.customerAuth.customer);
  const customerId = customer?.id;

  const { conversation, messages, loading, error, markAsRead, loadMessages, messagePage: hookMessagePage, totalMessagePages: hookTotalPages } = useCustomerChat(customerId || null);
  const { subscribe, formatMessageTime } = useSSE();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sseMessages, setSSEMessages] = useState<any[]>([]);
  const [messagePage, setMessagePage] = useState(hookMessagePage);
  const [totalMessagePages, setTotalMessagePages] = useState(hookTotalPages);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const connectionAttemptedRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Update local state when hook values change
  useEffect(() => {
    setMessagePage(hookMessagePage);
    setTotalMessagePages(hookTotalPages);
  }, [hookMessagePage, hookTotalPages]);

  // Connect to SSE when component mounts (only once)
  useEffect(() => {
    if (!connectionAttemptedRef.current) {
      connectionAttemptedRef.current = true;
      console.log('🔌 ChatBox: Attempting SSE connection...');
    }
    
    // Don't disconnect on unmount - keep the connection alive for other components
    // return () => {
    //   disconnect();
    // };
  }, []);

  // Subscribe to SSE stream when conversation is ready
  useEffect(() => {
    if (conversation?.id && customerId) {
      console.log('📢 ChatBox: Subscribing to conversation:', conversation.id);
      
      const unsubscribeFn = subscribe(
        conversation.id,
        (message: any) => {
          console.log('📨 Received message from SSE:', message);
          // Add received message to state
          setSSEMessages((prev: any[]) => [...prev, message]);
          // Mark admin messages as read
          if (message.senderRole === 'ADMIN' && message.id) {
            markAsRead(message.id);
          }
        },
        customerId,
        'customer'
      );

      return () => {
        console.log('🔕 ChatBox: Unsubscribing from conversation:', conversation.id);
        if (unsubscribeFn) unsubscribeFn();
      };
    }
  }, [conversation?.id, customerId, subscribe, markAsRead]);

  // Combine REST messages + SSE messages, avoid duplicates
  const messageIds = new Set(messages.map(m => m.id));
  const uniqueSSEMessages = sseMessages.filter(m => !messageIds.has(m.id));
  const allMessages = [...messages, ...uniqueSSEMessages];

  // Don't auto-scroll to bottom; let user manually scroll
  // This preserves scroll position for reviewing history
  // BUT scroll to bottom when messages first load or conversation changes
  useEffect(() => {
    if (allMessages.length > 0 && !loading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 0);
      // Mark initial load as done
      isInitialLoadRef.current = false;
    }
  }, [conversation?.id, loading]);

  // Show new message button when new messages arrive, don't auto-scroll
  useEffect(() => {
    if (uniqueSSEMessages.length > 0 && messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 30;
      setIsAtBottom(atBottom);
      // Always show button when new messages arrive
      setHasNewMessages(true);
      // Dispatch global notification event only if not initial load
      if (!isInitialLoadRef.current) {
        window.dispatchEvent(new CustomEvent('show-chat-notification', {
          detail: { message: '💬 Tin nhắn mới từ nhân viên hỗ trợ' }
        }));
      }
    }
  }, [uniqueSSEMessages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
    setIsAtBottom(true);
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
      }
    }
  };

  // Đánh dấu tin nhắn từ admin là đã đọc
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.senderRole === 'ADMIN' && !msg.isRead) {
        markAsRead(msg.id);
      }
    });
  }, [messages, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation) return;

    const messageToSend = messageText;
    setMessageText(''); // Clear input immediately
    setIsSending(true);
    try {
      // Send message via HTTP POST REST API
      // The backend will publish to RabbitMQ and broadcast via SSE
      // Don't add to local state - wait for SSE broadcast from server
      const response = await fetch(`${import.meta.env.VITE_BASE_URL+'/api' || 'https://www.hecommerce.shop/api'}/customers/${customerId}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCustomerToken()}`
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: messageToSend,
          messageType: 'TEXT',
        })
      });

      if (!response.ok) {
        console.error('Failed to send message:', response.statusText);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
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
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column'
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
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        boxShadow: '0 16px 32px rgba(0,0,0,0.08)',
        border: '1px solid #e5ecf2',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f7f9fc',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          background: 'linear-gradient(135deg, #1565c0, #1e88e5)',
          color: 'white'
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
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#f4f7fb',
          position: 'relative',
          minHeight: 0
        }}
      >
        {loading && !allMessages.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : allMessages.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">Hãy bắt đầu cuộc hội thoại</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {/* Load More Button */}
            {messagePage < totalMessagePages - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={async () => {
                    setLoadingMoreMessages(true);
                    try {
                      await loadMessages(messagePage + 1, 20);
                    } finally {
                      setLoadingMoreMessages(false);
                    }
                  }}
                  disabled={loadingMoreMessages}
                  sx={{ textTransform: 'none', fontSize: '0.85rem' }}
                >
                  {loadingMoreMessages ? '⏳ Đang tải...' : '📜 Xem thêm tin nhắn cũ'}
                </Button>
              </Box>
            )}
            {allMessages.map((msg) => (
              <React.Fragment key={msg.id}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: msg.senderRole === 'CUSTOMER' ? 'row-reverse' : 'row',
                    mb: 1.5,
                    alignItems: 'flex-start',
                    px: 1
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.25,
                      backgroundColor: msg.senderRole === 'CUSTOMER' ? '#1976d2' : '#ffffff',
                      color: msg.senderRole === 'CUSTOMER' ? '#fff' : 'inherit',
                      borderRadius: 1.5,
                      maxWidth: '72%',
                      wordBreak: 'break-word',
                      border: msg.senderRole === 'ADMIN' ? '1px solid #e6ebf0' : 'none',
                      boxShadow: msg.senderRole === 'CUSTOMER' ? '0 4px 12px rgba(21,101,192,0.25)' : '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        textAlign: msg.senderRole === 'CUSTOMER' ? 'right' : 'left',
                        color: msg.senderRole === 'CUSTOMER' ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                      }}
                    >
                      {formatMessageTime(msg.createdAt)}
                      {msg.senderRole === 'CUSTOMER' && msg.isRead && ' ✓'}
                    </Typography>
                  </Paper>
                </Box>
              </React.Fragment>
            ))}
            
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* New Messages Button - Fixed above input */}
      {hasNewMessages && !isAtBottom && (
        <Box sx={{ display: 'none' }}>
          {/* Button removed - using notification instead */}
        </Box>
      )}

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
