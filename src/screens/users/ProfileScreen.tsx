import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Snackbar, TextField, Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { UserApi } from "../../api/user/UserApi";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    id: 0,
    fullName: "",
    userName: "",
    email: "",
    // gender: 'male' | 'female' | 'unknown' stored as string for UI convenience
    gender: "unknown",
    // dateOfBirth in YYYY-MM-DD format for input[type=date]
    dateOfBirth: "",
    password: "",
    repeatPassword: "",
    active: true,
  });

  // no redux for admin user here; we read/write directly to backend

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  useEffect(() => {
    const idStr = localStorage.getItem("id");
    if (!idStr) {
      // if admin id missing, redirect to admin login
      navigate("/admin/login");
      return;
    }

    const id = Number(idStr);
    (async () => {
      try {
        const res = await UserApi.getById(id);
  const u: any = res.data;
        const dobStr = u.dateOfBirth ? (typeof u.dateOfBirth === 'string' ? u.dateOfBirth.split('T')[0] : String(u.dateOfBirth)) : '';
        // map backend boolean gender to UI string
        const genderStr = u.gender === null || u.gender === undefined ? 'unknown' : (u.gender === true ? 'male' : 'female');
        setForm((f) => ({
          ...f,
          id: u.id,
          // backend uses fullName/email (older code used adminName/adminEmail)
          fullName: u.fullName ?? u.adminName ?? u.name ?? "",
          userName: u.username ?? "",
          email: u.email ?? u.adminEmail ?? u.emailAddress ?? "",
          gender: genderStr,
          dateOfBirth: dobStr,
          active: u.active ?? true,
        }));
      } catch (err) {
        console.error("Failed to load user", err);
      }
    })();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, gender: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        // PersistableUser expects 'name' and 'emailAddress' and 'userName'
        name: form.fullName,
        userName: form.userName,
        emailAddress: form.email,
        active: form.active,
        // map gender/dateOfBirth into expected backend fields
        gender: form.gender === 'unknown' ? null : form.gender === 'male',
        dateOfBirth: form.dateOfBirth || null,
      };
      // include password only when user filled it
      if (form.password) {
        payload.password = form.password;
        payload.repeatPassword = form.repeatPassword;
      }

      const res = await UserApi.update(String(form.id), payload);
      // update redux user slice so CMS topbar shows updated info
      try {
        // backend returns updated readable user; map to frontend user slice shape if necessary
        const userData = res.data;
        // ensure fields match our ReadableUser interface
        const normalized = {
          ...userData,
          fullName: userData.fullName ?? userData.adminName ?? userData.name,
          email: userData.email ?? userData.adminEmail ?? userData.emailAddress,
          // normalize gender/dateOfBirth
          gender: userData.gender === null || userData.gender === undefined ? null : (userData.gender === true ? 'male' : 'female'),
          dateOfBirth: userData.dateOfBirth ? (typeof userData.dateOfBirth === 'string' ? userData.dateOfBirth.split('T')[0] : userData.dateOfBirth) : null,
        } as any;
        dispatch(loginAction(normalized));
      } catch (e) {
        // ignore dispatch errors
      }
      setSnack({ open: true, message: "Cập nhật hồ sơ thành công" });
    } catch (err: any) {
      console.error(err);
      setSnack({ open: true, message: err?.response?.data || "Lỗi khi cập nhật" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Hồ sơ người dùng
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 720 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField label="Họ và tên" name="fullName" value={form.fullName} onChange={handleChange} />
          <TextField label="Tên đăng nhập" name="userName" value={form.userName} onChange={handleChange} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} />

          {/* Gender and date of birth */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Giới tính</Typography>
            <RadioGroup row name="gender" value={form.gender} onChange={handleGenderChange}>
              <FormControlLabel value="male" control={<Radio />} label="Nam" />
              <FormControlLabel value="female" control={<Radio />} label="Nữ" />
              <FormControlLabel value="unknown" control={<Radio />} label="Không rõ" />
            </RadioGroup>
          </Box>

          <TextField
            label="Ngày sinh"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <Typography variant="subtitle2">Đổi mật khẩu (tuỳ chọn)</Typography>
          <TextField
            label="Mật khẩu mới"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            label="Nhập lại mật khẩu"
            name="repeatPassword"
            type="password"
            value={form.repeatPassword}
            onChange={handleChange}
          />

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

export default ProfileScreen;
