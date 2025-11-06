import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OTPApi } from "../../api/OtpApi";
import AuthLayout from "../../components/auth/Layout";

const OtpScreen = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone; // nhận từ màn hình trước

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Mã OTP phải gồm 6 chữ số");
      return;
    }

    const result = await OTPApi.verifyOtp(phone, otp);
    if (result) {
      navigate("/signup/set-password", { state: { phone } });
    } else {
      setError("OTP không chính xác!");
    }
  };

  useEffect(() => {
    if (!phone) navigate("/signup");
  }, [phone]);

  return (
    <AuthLayout screenName="Xác minh OTP">
      <Box
        component="form"
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
            width: "90%", // tất cả con đều 90%
          },
          background: "white",
        }}
      >
        <Typography mb={2} variant="h3">
          Xác nhận OTP
        </Typography>
        <Typography>
          Mã xác minh đã được gửi đến <strong>{phone}</strong>.
        </Typography>

        <TextField
          label="Nhập mã OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          inputProps={{ maxLength: 6 }}
          error={Boolean(error)}
          helperText={error}
        />
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={otp.length !== 6}
        >
          XÁC NHẬN
        </Button>

        <Button variant="text" onClick={() => OTPApi.sendOtp(phone)}>
          Gửi lại mã OTP
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default OtpScreen;
