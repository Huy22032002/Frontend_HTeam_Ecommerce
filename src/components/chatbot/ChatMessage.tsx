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
          p: 1.5,
          maxWidth: "75%",
          backgroundColor: isUser ? "#1976d2" : "#e0e0e0",
          color: isUser ? "#fff" : "#000",
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
