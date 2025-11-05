import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { CustomerApi } from "../../api/customer/CustomerApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as customerLogin } from "../../store/customerSlice";

const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ id: 0, name: "", emailAddress: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  useEffect(() => {
    const idStr = localStorage.getItem("id");
    if (!idStr) {
      navigate("/login");
      return;
    }
    const id = String(idStr);
    (async () => {
      const data = await CustomerApi.getById(id);
      if (data) {
        setForm({ id: data.id, name: data.name ?? "", emailAddress: data.emailAddress ?? "", username: data.username ?? "" });
        // update store if not present
        try {
          dispatch(customerLogin(data));
        } catch (e) {}
      }
    })();
  }, [dispatch, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await CustomerApi.update(String(form.id), { name: form.name, emailAddress: form.emailAddress, username: form.username });
      if (res && res.data) {
        // update customer in redux
        dispatch(customerLogin(res.data));
        setSnack({ open: true, message: "Cập nhật hồ sơ thành công" });
      }
    } catch (err: any) {
      setSnack({ open: true, message: err?.response?.data || "Lỗi khi cập nhật" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Hồ sơ của tôi
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 720 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField label="Họ và tên" name="name" value={form.name} onChange={handleChange} />
          <TextField label="Tên đăng nhập" name="username" value={form.username} onChange={handleChange} />
          <TextField label="Email" name="emailAddress" value={form.emailAddress} onChange={handleChange} />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button onClick={() => navigate(-1)}>Huỷ</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              Lưu
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

export default CustomerProfile;
