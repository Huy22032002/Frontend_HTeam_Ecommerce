import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/auth/Layout";
import { signUpByPhone } from "../../../api/customer/CustomerAuth";
import type { LoginResponse } from "../../../models/auths/LoginResponse";
import { useDispatch } from "react-redux";
import { CustomerApi } from "../../../api/customer/CustomerApi";
import { login } from "../../../store/customerSlice";

const SetPasswordScreen = () => {
  //redux
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone; // nhận từ OtpScreen

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result: LoginResponse | undefined = await signUpByPhone(
        phone,
        password
      );
      if (result) {
        // fetch customer ngay sau khi signup
        const customer = await CustomerApi.getById(result.id.toString());
        //luu vao redux
        if (customer) {
          dispatch(login(customer));
        }
        navigate("/");
      } else {
        setError("Đã có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!phone) navigate("/signup");
  }, [phone]);

  return (
    <AuthLayout screenName="Tạo mật khẩu">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          width: "440px",
          borderRadius: 3,
          padding: 4,
          "& > *": {
            width: "90%",
          },
          background: "white",
        }}
      >
        <Typography mb={2} variant="h3">
          Tạo mật khẩu
        </Typography>

        <Typography sx={{ textAlign: "center", color: "gray" }}>
          Đặt mật khẩu cho tài khoản <strong>{phone}</strong>
        </Typography>

        {/* mật khẩu */}
        <TextField
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={Boolean(error && !password)}
        />

        {/* nhập lại mật khẩu */}
        <TextField
          label="Nhập lại mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={Boolean(error && password !== confirmPassword)}
          helperText={error}
        />

        <Button
          variant="contained"
          type="submit"
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? "Đang xử lý..." : "HOÀN TẤT"}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default SetPasswordScreen;
