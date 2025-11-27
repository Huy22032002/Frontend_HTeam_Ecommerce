import { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { faqList } from "../../constants/faq";

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

    // Push user message
    const newMessages = [...messages, { sender: "user", text }];
    setMessages(newMessages);

    try {
      const res = await axios.post(
        `http://localhost:8080/api/public/chatbot${
          customer?.id ? `?userId=${customer.id}` : ""
        }`,
        {
          message: text,
        }
      );

      console.log("ai tra loi: ", res.data.response);

      const botReply = res.data.response;

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Lỗi kết nối server!" },
      ]);
    }
  };

  const [faqOpen, setFaqOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* FAQ */}
      <Accordion
        expanded={faqOpen}
        onChange={(_, expanded) => setFaqOpen(expanded)}
        sx={{
          background: "#fff",
          borderBottom: "1px solid #ddd",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Câu hỏi thường gặp</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
              maxHeight: 250,
              overflowY: "auto",
            }}
          >
            {faqList.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  backgroundColor: "#f1f3f4",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: "1px solid #ddd",
                  "&:hover": { backgroundColor: "#e9ebec" },
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
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Khu vực hiển thị tin nhắn */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} sender={msg.sender} text={msg.text} />
        ))}
      </Box>

      {/* Input gửi tin nhắn */}
      <ChatInput onSend={sendMessage} />
    </Box>
  );
};

export default ChatContainer;
