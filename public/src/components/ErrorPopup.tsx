import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorPopupProps {
  open: boolean;
  errorMessage: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({
  open,
  errorMessage,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 6,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "error.light",
          color: "error.contrastText",
          fontWeight: 600,
        }}
      >
        <ErrorOutlineIcon />
        Error
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography
          variant="body1"
          sx={{
            color: "text.primary",
            whiteSpace: "pre-line",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          {errorMessage}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorPopup;
