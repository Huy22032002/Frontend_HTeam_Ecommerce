import { Box, Paper, Typography } from "@mui/material";

interface Props {
  sender: "user" | "bot";
  text: string;
}

const ChatMessage = ({ sender, text }: Props) => {
  const isUser = sender === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 1,
      }}
    >
      <Paper
        sx={{
          p: 1.25,
          maxWidth: "78%",
          backgroundColor: isUser ? "#1976d2" : "#f1f5f9",
          color: isUser ? "#fff" : "#0f172a",
          borderRadius: 1.5,
          boxShadow: isUser
            ? "0 6px 14px rgba(25,118,210,0.25)"
            : "0 3px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
          {text}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
