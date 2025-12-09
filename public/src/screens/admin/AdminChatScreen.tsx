import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  Divider,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useChat } from "../../hooks/useChat";
import { useSSE } from "../../hooks/useSSE";
import * as ChatApi from "../../api/chat/ChatApi";
import { useSelector } from "react-redux";

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
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [sseMessages, setSSEMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagePage, setMessagePage] = useState(0);
  const [totalMessagePages, setTotalMessagePages] = useState(0);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [readConversationIds, setReadConversationIds] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const { getAdminConversations, getAdminMessages } = useChat();
  const { subscribe } = useSSE();

  // Try multiple ways to get adminId
  const userState = useSelector((state: any) => state.user);
  let adminId = userState?.user?.id || null;

  // Fallback: Try to extract from localStorage or other sources
  if (!adminId) {
    // Try from localStorage (if stored during login)
    const stored = localStorage.getItem("adminId");
    adminId = stored ? parseInt(stored) : null;
  }

  // Connect to SSE (only once)
  useEffect(() => {
    console.log("🔌 AdminChatScreen: SSE hook initialized");
    // SSE doesn't need explicit connection, it connects on demand
  }, []);

  // Subscribe to SSE stream when conversation selected
  useEffect(() => {
    if (selectedConversationId && adminId) {
      console.log(
        "📢 AdminChatScreen: Subscribing to conversation:",
        selectedConversationId
      );

      const unsubscribeFn = subscribe(
        selectedConversationId,
        (message: any) => {
          console.log("Admin received SSE message:", message);
          setSSEMessages((prev: any[]) => [...prev, message]);
        },
        adminId,
        "admin"
      );

      return () => {
        console.log(
          "🔕 AdminChatScreen: Unsubscribing from conversation:",
          selectedConversationId
        );
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
      setError("Admin ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAdminConversations(adminId, 0, 20);
      let conversations = data?.content || data || [];

      // Apply readConversationIds - set unreadCount to 0 for conversations we've already read
      conversations = conversations.map((conv) =>
        readConversationIds.has(conv.id) ? { ...conv, unreadCount: 0 } : conv
      );

      setConversations(conversations);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Error loading conversations";
      setError(errorMsg);
      console.error("Error loading conversations:", err);
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
      const data = await getAdminMessages(
        adminId,
        selectedConversationId,
        pageNum,
        20
      );
      const newMessages = [...(data?.content || [])];

      // Set total pages from response
      if (data?.totalPages !== undefined) {
        setTotalMessagePages(data.totalPages);
      }

      if (isLoadMore) {
        // Prepend older messages (they come first since we're loading backwards)
        setMessages((prev) => [...newMessages, ...prev]);
      } else {
        // Initial load: reverse to show oldest first, newest last
        const reversedMessages = newMessages.reverse();
        setMessages(reversedMessages);
      }

      setMessagePage(pageNum);
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError("Lỗi tải tin nhắn");
    } finally {
      if (isLoadMore) {
        setLoadingMoreMessages(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Combine REST messages + SSE messages, avoid duplicates
  const messageIds = new Set(messages.map((m) => m.id));
  const uniqueSSEMessages = sseMessages.filter((m) => !messageIds.has(m.id));
  const allMessages = [...messages, ...uniqueSSEMessages];

  // Scroll to bottom when conversation is selected or messages loaded
  useEffect(() => {
    if (selectedConversationId && messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
        setIsAtBottom(true);
      }, 50);
    }
  }, [selectedConversationId, messages.length]);

  // Mark unread messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && selectedConversationId) {
      const unreadMessages = messages.filter(
        (msg) => msg.senderRole === "CUSTOMER" && !msg.isRead
      );

      if (unreadMessages.length > 0) {
        // Call API to mark all messages as read for this conversation
        ChatApi.markAllMessagesAsRead(selectedConversationId, adminId)
          .then(() => {
            console.log(
              "All messages marked as read for conversation:",
              selectedConversationId
            );

            // Add to readConversationIds to persist
            setReadConversationIds(
              (prev) => new Set([...prev, selectedConversationId])
            );

            // Update local messages to reflect read status
            setMessages((prev) =>
              prev.map((msg) =>
                unreadMessages.find((um) => um.id === msg.id)
                  ? { ...msg, isRead: true }
                  : msg
              )
            );

            // Update conversation's unreadCount to 0
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === selectedConversationId
                  ? { ...conv, unreadCount: 0 }
                  : conv
              )
            );
          })
          .catch((err) => {
            console.error("Error marking messages as read:", err);
            setError("Lỗi đánh dấu tin nhắn đã đọc");
          });
      }
    }
  }, [messages, selectedConversationId, adminId]);

  // Append new SSE messages to messages list so they persist
  useEffect(() => {
    if (uniqueSSEMessages.length > 0) {
      // Only append if not already in messages
      const messageIds = new Set(messages.map((m) => m.id));
      const toAppend = uniqueSSEMessages.filter((m) => !messageIds.has(m.id));

      if (toAppend.length > 0) {
        setMessages((prev) => [...prev, ...toAppend]);
      }
    }
  }, [uniqueSSEMessages]);

  // Detect new SSE messages - auto-scroll if at bottom, show button if scrolled up
  useEffect(() => {
    if (uniqueSSEMessages.length > 0 && messagesContainerRef.current) {
      // Delay to ensure messages are added to DOM before checking scroll position
      setTimeout(() => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } =
          messagesContainerRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 30;
        setIsAtBottom(atBottom);

        if (atBottom) {
          // Auto-scroll to bottom
          setHasNewMessages(false);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);
      setIsAtBottom(true);
    }
  };

  // Detect if user is at bottom of messages
  const handleMessagesScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
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
      setError("Admin ID or conversation not selected");
      return;
    }

    const messageToSend = newMessage;
    setNewMessage(""); // Clear input immediately

    try {
      // Send message via HTTP POST REST API
      // The backend will publish to RabbitMQ and broadcast via SSE
      // Don't add to local state - wait for SSE broadcast from server
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/admins/${adminId}/chat/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            conversationId: selectedConversationId,
            content: messageToSend,
            messageType: "TEXT",
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to send message:", response.statusText);
        setError("Failed to send message");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Error sending message";
      setError(errorMsg);
      console.error("Error sending message:", err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#f5f5f5",
        flexDirection: "column",
      }}
    >
      {/* Error Alert */}
      {error && (
        <Box
          sx={{ p: 2, bgcolor: "#ffebee", borderBottom: "1px solid #ffcdd2" }}
        >
          <Typography variant="body2" sx={{ color: "#c62828" }}>
            ⚠️ {error}
          </Typography>
        </Box>
      )}

      {/* Not logged in */}
      {!adminId && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#999" }}>
            Please login as admin to view conversations
          </Typography>
        </Box>
      )}

      {/* Chat Interface */}
      {adminId && (
        <Box sx={{ display: "flex", flex: 1, gap: 0 }}>
          {/* Conversations List */}
          <Paper
            sx={{
              width: "35%",
              borderRadius: 0,
              boxShadow: "none",
              border: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
              bgcolor: "#fafafa",
            }}
          >
            <Box
              sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1a1a1a" }}
              >
                💬 Cuộc hội thoại ({conversations.length})
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
                {conversations.map((conv) => (
                  <React.Fragment key={conv.id}>
                    <ListItemButton
                      selected={selectedConversationId === conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      sx={{
                        backgroundColor:
                          selectedConversationId === conv.id
                            ? "#e3f2fd"
                            : "#fafafa",
                        "&:hover": {
                          backgroundColor:
                            selectedConversationId === conv.id
                              ? "#e3f2fd"
                              : "#f5f5f5",
                        },
                        borderBottom: "1px solid #f0f0f0",
                        transition: "all 0.2s ease",
                        py: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: "#1a1a1a", mb: 0.5 }}
                        >
                          {conv.customerId} -{" "}
                          {conv.customerName || "Khách hàng"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#666",
                            display: "block",
                            mb: 0.5,
                            fontSize: "0.75rem",
                          }}
                        >
                          {conv.customerPhone
                            ? `📱 ${conv.customerPhone}`
                            : conv.customerEmail
                            ? `📧 ${conv.customerEmail}`
                            : "N/A"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#999",
                            display: "block",
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conv.lastMessage || "(Chưa có tin nhắn)"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#999", fontSize: "0.7rem" }}
                        >
                          {new Date(conv.updatedAt).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </Typography>
                      </Box>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <Box
                          sx={{
                            bgcolor: "#ff5252",
                            color: "white",
                            borderRadius: "50%",
                            minWidth: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                          }}
                        >
                          {conv.unreadCount && conv.unreadCount > 0
                            ? conv.unreadCount
                            : ""}
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
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#fff",
              borderLeft: "1px solid #e0e0e0",
            }}
          >
            {selectedConversationId ? (
              <>
                {/* Messages */}
                <Box
                  sx={{
                    flex: 1,
                    maxHeight: "calc(100vh - 290px)",
                    overflow: "auto",
                    p: 2.5,
                    bgcolor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                >
                  {/* Load More Button */}
                  {messagePage < totalMessagePages - 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => loadMessages(messagePage + 1)}
                        disabled={loadingMoreMessages}
                        sx={{ textTransform: "none" }}
                      >
                        {loadingMoreMessages
                          ? "⏳ Đang tải..."
                          : "📜 Xem thêm tin nhắn cũ"}
                      </Button>
                    </Box>
                  )}
                  {allMessages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: "flex",
                        justifyContent:
                          msg.senderRole === "ADMIN"
                            ? "flex-end"
                            : "flex-start",
                        mb: 0.5,
                        animation: "fadeIn 0.3s ease-in",
                        "@keyframes fadeIn": {
                          from: { opacity: 0, transform: "translateY(10px)" },
                          to: { opacity: 1, transform: "translateY(0)" },
                        },
                      }}
                    >
                      <Paper
                        sx={{
                          maxWidth: "65%",
                          p: "10px 14px",
                          bgcolor:
                            msg.senderRole === "ADMIN" ? "#2196f3" : "#f0f0f0",
                          color: msg.senderRole === "ADMIN" ? "white" : "#000",
                          borderRadius: "12px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.4,
                          }}
                        >
                          {msg.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            opacity: 0.7,
                            fontSize: "0.75rem",
                            textAlign:
                              msg.senderRole === "ADMIN" ? "right" : "left",
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}

                  <div ref={messagesEndRef} />
                </Box>

                {/* New Messages Button - Fixed above input */}
                {hasNewMessages && !isAtBottom && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      py: 1.5,
                      backgroundColor: "#fff",
                      borderTop: "2px solid #e0e0e0",
                      background:
                        "linear-gradient(to bottom, rgba(33, 150, 243, 0.05), transparent)",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<span style={{ marginLeft: "4px" }}>⬇️</span>}
                      onClick={scrollToBottom}
                      sx={{
                        textTransform: "none",
                        borderRadius: "22px",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
                        },
                      }}
                    >
                      💬 Có tin nhắn mới
                    </Button>
                  </Box>
                )}

                {/* Input Area */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: "1px solid #e0e0e0",
                    display: "flex",
                    gap: 1,
                    bgcolor: "#fafafa",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "20px",
                        backgroundColor: "white",
                        "&:hover fieldset": { borderColor: "#2196f3" },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Gửi
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <ChatBubbleOutlineIcon
                  sx={{ fontSize: 60, color: "#ccc", opacity: 0.5 }}
                />
                <Typography
                  variant="h6"
                  sx={{ color: "#999", fontWeight: 500 }}
                >
                  Chọn cuộc hội thoại để bắt đầu
                </Typography>
                <Typography variant="body2" sx={{ color: "#bbb" }}>
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
