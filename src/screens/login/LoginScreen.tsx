import { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Button,
  Stack,
} from "@mui/material";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

// icons
import AccountCircle from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import LoginIcon from "@mui/icons-material/Login";
import GoogleIcon from "@mui/icons-material/Google";
//components
import FBLoginButton from "../../components/button/btnLogin";

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 400,
        borderRadius: 3,
        padding: 4,
      }}
    >
      <Typography mb={2} variant="h3">
        Đăng nhập
      </Typography>

      {/* Username */}
      <TextField
        required
        label="Tên đăng nhập"
        variant="outlined"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Password */}
      <TextField
        required
        label="Mật khẩu"
        type={showPassword ? "text" : "password"}
        variant="outlined"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      {/* button login */}
      <Button variant="contained" startIcon={<LoginIcon />}>
        ĐĂNG NHẬP
      </Button>
      {/* forget password */}
      <Button variant="text">
        <Typography>Quên mật khẩu</Typography>
      </Button>
      {/* login with fb, gg */}
      <Stack direction="row" spacing={2}>
        <FBLoginButton appId={FB_APP_ID} backendEndpoint={BASE_URL} />

        <Button variant="outlined" startIcon={<GoogleIcon />}>
          Google
        </Button>
      </Stack>
      {/* sign up */}
      <Typography>Chưa có tài khoản? Đăng ký</Typography>
    </Box>
  );
};

export default LoginScreen;
