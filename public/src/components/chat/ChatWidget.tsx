import { useEffect, useState } from "react";
import { Box, Fab } from "@mui/material";
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

      {/* Khung chat với admin */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 96, // Left of widget stack, aligned to bottom
            width: 350,
            height: 500,
            boxShadow: 4,
            borderRadius: 2,
            background: "#fff",
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
