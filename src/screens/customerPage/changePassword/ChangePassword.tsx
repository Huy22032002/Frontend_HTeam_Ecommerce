// ChangePassword.tsx
import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

export default function ChangePassword() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleSubmit = () => {
    if (newPass !== confirmPass) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    alert("Đổi mật khẩu thành công (demo)!");
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Đổi mật khẩu
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} width="300px">
        <TextField
          label="Mật khẩu cũ"
          type="password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
        />
        <TextField
          label="Mật khẩu mới"
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <TextField
          label="Xác nhận mật khẩu mới"
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />
        <Button variant="contained" onClick={handleSubmit}>
          Cập nhật
        </Button>
      </Box>
    </Box>
  );
}
