import { useEffect, useState } from "react";
import { Box, Fab, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import ChatContainer from "./ChatContainer";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);

  // Close when admin chat opens
  useEffect(() => {
    const handleClose = () => setOpen(false);
    window.addEventListener("close-bot-chat", handleClose);
    return () => window.removeEventListener("close-bot-chat", handleClose);
  }, []);

  return (
    <>
      {/* Nút mở chat */}
      <Tooltip title={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"} placement="left">
        <Fab
          color="primary"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) {
              window.dispatchEvent(new Event("close-admin-chat"));
            }
          }}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 2000,
          }}
        >
          {open ? <CloseIcon /> : <SmartToyIcon />}
        </Fab>
      </Tooltip>

      {/* Khung chat */}
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
            zIndex: 2000,
          }}
        >
          <ChatContainer />
        </Box>
      )}
    </>
  );
};

export default ChatbotWidget;
