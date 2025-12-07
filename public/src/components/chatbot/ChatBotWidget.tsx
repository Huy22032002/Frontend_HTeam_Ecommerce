import { useState } from "react";
import { Box, Fab } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import ChatContainer from "./ChatContainer";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Nút mở chat */}
      <Fab
        color="primary"
        onClick={() => setOpen(!open)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 2000,
        }}
      >
        {open ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>

      {/* Khung chat */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 350,
            height: 400,
            boxShadow: 4,
            borderRadius: 2,
            background: "#fff",
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
