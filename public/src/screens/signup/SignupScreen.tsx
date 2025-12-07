import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import AuthLayout from "../../components/auth/Layout";
import useSignup from "./Signup.hook";
import { tokens } from "../../theme/theme";
import { Link } from "react-router-dom";
import SocialLogin from "../../components/button/SocialLogin";

const SignupScreen = () => {
  //theme
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const {
    phone,
    setPhone,
    validatePhone,
    error,
    setError,
    //handle login
    handleLoginFB,
    handleLoginGG,
    //sign up phone
    handleSignUpPhone,
  } = useSignup();

  return (
    <AuthLayout screenName="signup">
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
          Đăng ký
        </Typography>

        {/* sdt */}
        <TextField
          required
          value={phone}
          label="Số điện thoại"
          placeholder="Nhập số điện thoại Việt Nam"
          variant="outlined"
          type="tel"
          onChange={(e) => {
            setPhone(e.target.value);
            if (!e.target.value) {
              setError("Vui lòng nhập số điện thoại");
            } else if (!validatePhone(e.target.value)) {
              setError("Số điện thoại không hợp lệ!");
            } else if (
              error === "Vui lòng nhập số điện thoại" ||
              error === "Số điện thoại không hợp lệ!"
            ) {
              // chỉ clear nếu lỗi hiện tại là do input
              setError("");
            }
          }}
          error={Boolean(error)}
          helperText={error}
        />

        {/* submit */}
        <Button
          sx={{
            backgroundColor: colors.redAccent[500],
          }}
          variant="contained"
          disabled={Boolean(error) || !phone}
          onClick={handleSignUpPhone}
        >
          TIẾP THEO
        </Button>

        {/* login with fb, gg */}
        <Stack direction="row" spacing={2}>
          {/* Facebook login */}
          <SocialLogin
            provider="facebook"
            onLogin={(res) => handleLoginFB(res.authResponse.accessToken)}
          />

          <SocialLogin
            provider="google"
            onLogin={(res) => handleLoginGG(res.credential)}
          />
        </Stack>

        {/* điều khoản dịch vụ & chính sách bảo mật */}
        <Typography sx={{ fontSize: 12, textAlign: "center" }}>
          Bằng việc đăng kí, bạn đã đồng ý với Shopee về <br />
          <Link
            style={{ color: colors.redAccent[500] }}
            to="/dieu-khoan-dich-vu"
          >
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link
            style={{ color: colors.redAccent[500] }}
            to="/chinh-sach-bao-mat"
          >
            Chính sách bảo mật
          </Link>
        </Typography>

        {/* sign in  */}
        <Typography sx={{ color: colors.grey[600] }}>
          Bạn đã có tài khoản?{" "}
          <Link style={{ color: "red", textDecoration: "none" }} to="/login">
            Đăng nhập
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default SignupScreen;
