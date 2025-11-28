import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useAdminChatConversations, useAdminChatMessages } from '../../hooks/useChat';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import type { ChatConversation } from '../../api/chat/ChatApi';

const AdminChatDashboard: React.FC = () => {
  const admin = useSelector((state: RootState) => state.userAuth.user);
  const adminId = admin?.id;
  const adminName = admin?.name || 'Admin';

  const {
    conversations,
    unreadConversations,
    loading: convLoading,
    error: convError,
    loadConversations,
    loadUnreadConversations,
    assignConversation,
    closeConversation,
    reopenConversation
  } = useAdminChatConversations(adminId || null);

  const {
    messages,
    loading: msgLoading,
    error: msgError,
    loadMessages,
    sendMessage
  } = useAdminChatMessages(adminId || null, null);

  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showUnread, setShowUnread] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [conversationToClose, setConversationToClose] = useState<ChatConversation | null>(null);

  // Load cuộc hội thoại khi component mount
  useEffect(() => {
    if (adminId) {
      loadConversations();
      loadUnreadConversations();
    }
  }, [adminId, loadConversations, loadUnreadConversations]);

  // Load tin nhắn khi chọn cuộc hội thoại
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(0, 50); // Load 50 messages
    }
  }, [selectedConversation, loadMessages]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setMessageText('');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setIsSending(true);
    await sendMessage(messageText);
    setIsSending(false);
    setMessageText('');
  };

  const handleAssignConversation = async (conversation: ChatConversation) => {
    await assignConversation(conversation.id, adminName);
  };

  const handleOpenCloseDialog = (conversation: ChatConversation) => {
    setConversationToClose(conversation);
    setCloseDialogOpen(true);
  };

  const handleConfirmClose = async () => {
    if (conversationToClose) {
      await closeConversation(conversationToClose.id);
      setCloseDialogOpen(false);
      setConversationToClose(null);
      if (selectedConversation?.id === conversationToClose.id) {
        setSelectedConversation(null);
      }
    }
  };

  const handleReopenConversation = async (conversation: ChatConversation) => {
    await reopenConversation(conversation.id);
  };

  const filteredConversations = (showUnread ? unreadConversations : conversations).filter(conv =>
    conv.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  if (!adminId) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Vui lòng đăng nhập với tài khoản admin</Alert>
      </Paper>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>
        {/* Left: Conversations List */}
        <Box sx={{ width: { xs: '100%', md: '33.333%' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Paper sx={{ p: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm cuộc hội thoại..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              {searchText && (
                <IconButton size="small" onClick={() => setSearchText('')}>
                  <ClearIcon />
                </IconButton>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={!showUnread ? 'contained' : 'outlined'}
                onClick={() => setShowUnread(false)}
              >
                Tất cả ({conversations.length})
              </Button>
              <Button
                size="small"
                variant={showUnread ? 'contained' : 'outlined'}
                onClick={() => setShowUnread(true)}
              >
                Chưa đọc ({unreadConversations.length})
              </Button>
              <Tooltip title="Làm mới">
                <IconButton
                  size="small"
                  onClick={() => {
                    loadConversations();
                    loadUnreadConversations();
                  }}
                  disabled={convLoading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {convError && <Alert severity="error" sx={{ mb: 1 }}>{convError}</Alert>}

          {/* Conversations List */}
          <Paper sx={{ flex: 1, overflowY: 'auto' }}>
            {convLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : filteredConversations.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">Không có cuộc hội thoại</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredConversations.map((conversation, index) => (
                  <React.Fragment key={conversation.id}>
                    {index > 0 && <Divider />}
                    <ListItemButton
                      selected={selectedConversation?.id === conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: 'action.selected'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount > 0 ? conversation.unreadCount : null}
                          color="error"
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {conversation.customerName.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {conversation.customerName}
                            </Typography>
                            <Chip
                              label={conversation.status === 'ACTIVE' ? 'Hoạt động' : 'Đã đóng'}
                              size="small"
                              color={conversation.status === 'ACTIVE' ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mt: 0.5
                            }}
                          >
                            {conversation.lastMessage || 'Không có tin nhắn'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        {/* Right: Chat View */}
        <Box sx={{ width: { xs: '100%', md: '66.667%' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedConversation ? (
            <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Chat Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderBottom: '1px solid #e0e0e0'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {selectedConversation.customerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {selectedConversation.customerName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Tạo: {new Date(selectedConversation.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {selectedConversation.status === 'ACTIVE' ? (
                    <Tooltip title="Đóng cuộc hội thoại">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenCloseDialog(selectedConversation)}
                      >
                        Đóng
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Mở lại cuộc hội thoại">
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleReopenConversation(selectedConversation)}
                      >
                        Mở lại
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title="Gán cho tôi">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAssignConversation(selectedConversation)}
                      disabled={selectedConversation.adminId === adminId}
                    >
                      Gán
                    </Button>
                  </Tooltip>
                  <IconButton size="small" onClick={() => setSelectedConversation(null)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              {msgError && <Alert severity="error" sx={{ m: 1 }}>{msgError}</Alert>}

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {msgLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  messages.map(msg => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        flexDirection: msg.senderRole === 'ADMIN' ? 'row-reverse' : 'row',
                        mb: 1,
                        alignItems: 'flex-start'
                      }}
                    >
                      <Avatar sx={{ bgcolor: msg.senderRole === 'ADMIN' ? 'success.main' : 'primary.main', width: 32, height: 32, ml: 1 }}>
                        {msg.senderRole === 'ADMIN' ? 'A' : 'C'}
                      </Avatar>
                      <Paper
                        sx={{
                          p: 1.5,
                          backgroundColor: msg.senderRole === 'ADMIN' ? '#c8e6c9' : '#bbdefb',
                          borderRadius: 2,
                          maxWidth: '60%',
                          wordBreak: 'break-word'
                        }}
                      >
                        <Typography variant="body2">{msg.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
              </Box>

              {/* Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                {selectedConversation.status === 'CLOSED' && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    Cuộc hội thoại đã đóng. Vui lòng mở lại để tiếp tục.
                  </Alert>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Nhập tin nhắn..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    disabled={isSending || msgLoading || selectedConversation.status === 'CLOSED'}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || isSending || selectedConversation.status === 'CLOSED'}
                    sx={{ minWidth: 40, height: 40 }}
                  >
                    {isSending ? <CircularProgress size={20} /> : <SendIcon />}
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <Typography variant="body1">Chọn cuộc hội thoại để bắt đầu</Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Close Dialog */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)}>
        <DialogTitle>Đóng cuộc hội thoại</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn đóng cuộc hội thoại với {conversationToClose?.customerName}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmClose} variant="contained" color="error">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminChatDashboard;
