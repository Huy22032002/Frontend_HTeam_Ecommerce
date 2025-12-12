import { useState } from "react";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface Props {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: Props) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() !== "") {
      onSend(text);
      setText("");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1.25,
        borderTop: "1px solid #e5ecf2",
        background: "#fff",
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Nhập tin nhắn..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            backgroundColor: '#f8fafc'
          }
        }}
      />

      <Tooltip title="Gửi">
        <span>
          <IconButton color="primary" onClick={handleSend} disabled={!text.trim()} sx={{ bgcolor: '#e3f2fd' }}>
            <SendIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default ChatInput;
