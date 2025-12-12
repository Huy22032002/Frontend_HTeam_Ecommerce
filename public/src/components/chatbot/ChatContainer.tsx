import { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Avatar,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { faqList } from "../../constants/faq";
import { ChatbotApi } from "../../api/chat/ChatbotApi";

export interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatContainer = () => {
  const customer = useSelector(
    (state: RootState) => state.customerAuth.customer
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const customerId = customer?.id ? customer.id : null;

    // Push user message
    setMessages((prev) => [...prev, { sender: "user", text: text }]);
    setFaqOpen(false);

    try {
      const chatbotReply = await ChatbotApi.sendMessage(customerId, text);

      setMessages((prev) => [...prev, { sender: "bot", text: chatbotReply }]);
    } catch (_: unknown) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Lỗi kết nối server!" },
      ]);
    }
  };

  const [faqOpen, setFaqOpen] = useState(true);

  // const quickSuggestions = useMemo(() => faqList.slice(0, 4), []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", background: "#f7f9fc" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: "1px solid #e5ecf2", background: "linear-gradient(135deg,#0d47a1,#1976d2)", color: "#fff" }}>
        <Avatar sx={{ bgcolor: "#fff", color: "#0d47a1", width: 40, height: 40 }}>
          <SmartToyIcon />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Trợ lý AI</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>Hỏi đáp nhanh, 24/7</Typography>
        </Box>
      </Box>

      <Accordion
        expanded={faqOpen}
        onChange={(_, expanded) => setFaqOpen(expanded)}
        sx={{
          background: "#fff",
          borderBottom: "1px solid #e5ecf2",
          boxShadow: "none",
          borderRadius: 0,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Câu hỏi thường gặp</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={1.2} sx={{ maxHeight: 220, overflowY: "auto" }}>
            {faqList.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.25,
                  backgroundColor: "#f8fafc",
                  borderRadius: 2,
                  cursor: "pointer",
                  border: "1px solid #e5ecf2",
                  "&:hover": { backgroundColor: "#eef5ff" },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMessages((prev) => [
                    ...prev,
                    { sender: "user", text: item.question },
                    { sender: "bot", text: item.answer },
                  ]);
                  setFaqOpen(false);
                }}
              >
                {item.question}
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          backgroundColor: "#f7f9fc",
        }}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} sender={msg.sender} text={msg.text} />
        ))}
      </Box>

      <ChatInput onSend={sendMessage} />
    </Box>
  );
};

export default ChatContainer;
