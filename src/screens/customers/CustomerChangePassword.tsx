import React, { useState } from "react";
import { Box, Button, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { CustomerApi } from "../../api/customer/CustomerApi";
import { useNavigate } from "react-router-dom";

const CustomerChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const handleSubmit = async () => {
    if (newPassword !== repeatPassword) {
      setSnack({ open: true, message: "Mật khẩu mới và nhập lại không khớp" });
      return;
    }
    const id = localStorage.getItem("id");
    if (!id) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await CustomerApi.changePassword(id, oldPassword, newPassword);
      setSnack({ open: true, message: "Đổi mật khẩu thành công" });
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setTimeout(() => navigate(-1), 800);
    } catch (err: any) {
      console.error(err);
      setSnack({ open: true, message: err?.response?.data || "Lỗi khi đổi mật khẩu" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Đổi mật khẩu
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 520 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Mật khẩu hiện tại"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Nhập lại mật khẩu mới"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button onClick={() => navigate(-1)}>Huỷ</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              Đổi mật khẩu
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        message={snack.message}
        onClose={() => setSnack({ open: false, message: "" })}
      />
    </Box>
  );
};

export default CustomerChangePassword;
