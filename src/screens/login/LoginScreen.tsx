import { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Button,
  Stack,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";

// icons
import AccountCircle from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import LoginIcon from "@mui/icons-material/Login";
//components
import SocialLogin from "../../components/button/SocialLogin";
import ErrorPopup from "../../components/ErrorPopup";

//hooks
import useLogin from "./Login.hook";
import { tokens } from "../../theme/theme";
import AuthLayout from "../../components/auth/Layout";
import { Link } from "react-router-dom";

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    username,
    setUsername,
    password,
    setPassword,
    //handle login
    handleLoginFB,
    handleLoginGG,
    handleLogin,
    success,
    setSuccess,
    error,
    setError,
    messsage,
  } = useLogin();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <AuthLayout screenName="login">
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "480px",
          borderRadius: 3,
          padding: 4,
          "& > *": {
            width: "90%", // tất cả con đều 90%
          },
          background: "white",
        }}
      >
        <Typography mb={2} variant="h3">
          Đăng nhập
        </Typography>

        {/* Username */}
        <TextField
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Tên đăng nhập"
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: colors.primary[100] }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Password */}
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: colors.primary[100] }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? (
                      <Visibility sx={{ color: colors.primary[100] }} />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {/* button login */}
        <Button
          sx={{
            backgroundColor: colors.redAccent[500],
          }}
          variant="contained"
          startIcon={<LoginIcon />}
          onClick={handleLogin}
        >
          ĐĂNG NHẬP
        </Button>

        {/* forget password */}
        <Typography>
          <Link
            style={{
              color: colors.blueAccent[500],
              fontSize: 14,
              textDecoration: "none",
            }}
            to="/forget-password"
          >
            Quên mật khẩu
          </Link>
        </Typography>

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

        {/* snackbar when login success  */}
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
            Đăng nhập thành công
          </Alert>
        </Snackbar>

        {/* error */}
        <ErrorPopup
          open={error}
          errorMessage={messsage}
          onClose={() => setError(false)}
        />

        {/* sign up */}
        <Typography sx={{ color: colors.grey[600] }}>
          Chưa có tài khoản?{" "}
          <Link style={{ color: "red", textDecoration: "none" }} to="/signup">
            Đăng ký
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default LoginScreen;
