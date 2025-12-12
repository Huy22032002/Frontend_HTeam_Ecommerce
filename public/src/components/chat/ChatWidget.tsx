import { useEffect, useState } from "react";
import { Box, Fab, Tooltip } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ChatBox from "./ChatBox";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  // Close when bot chat opens
  useEffect(() => {
    const handleClose = () => setOpen(false);
    window.addEventListener("close-admin-chat", handleClose);
    return () => window.removeEventListener("close-admin-chat", handleClose);
  }, []);

  return (
    <>
      {/* Nút mở chat với admin */}
      <Tooltip title={open ? "Đóng chat hỗ trợ" : "Mở chat với nhân viên"} placement="left">
        <Fab
          color="secondary"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) {
              window.dispatchEvent(new Event("close-bot-chat"));
            }
          }}
          sx={{
            position: "fixed",
            bottom: 92, // Stack below chatbot button
            right: 24,
            zIndex: 1999, // Thấp hơn chatbot một chút
          }}
        >
          {open ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
        </Fab>
      </Tooltip>

      {/* Khung chat với admin */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 96, // Left of widget stack, aligned to bottom
            width: 420,
            height: 550,
            boxShadow: "0 18px 36px rgba(0,0,0,0.12)",
            borderRadius: 4,
            background: "#f7f9fc",
            border: "1px solid #e5ecf2",
            overflow: "hidden",
            zIndex: 1999,
          }}
        >
          <ChatBox isOpen={open} onClose={() => setOpen(false)} />
        </Box>
      )}
    </>
  );
};

export default ChatWidget;
