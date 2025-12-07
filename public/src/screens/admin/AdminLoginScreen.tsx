import { useState, useEffect } from "react";
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
    Button,
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

//hooks
import { useAdminLogin } from "./AdminLogin.hook";
import { tokens } from "../../theme/theme";
import AuthLayout from "../../components/auth/Layout";

const AdminLoginScreen = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [openMessage, setOpenMessage] = useState(false);
    const [openError, setOpenError] = useState(false);

    const {
        username,
        setUsername,
        password,
        setPassword,
        handleLogin,
        error,
        message,
        isLoading,
    } = useAdminLogin();

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    useEffect(() => {
        setOpenMessage(!!message);
    }, [message]);

    useEffect(() => {
        setOpenError(!!error);
    }, [error]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <AuthLayout screenName="login">
            <Box
                component="form"
                onSubmit={handleSubmit}
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
                        width: "90%",
                    },
                    background: colors.greenAccent[900],
                }}
            >
                <Typography mb={2} variant="h3">
                    Đăng nhập Admin
                </Typography>

                {/* Username */}
                <TextField
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    label="Tên đăng nhập"
                    variant="filled"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccountCircle />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Password */}
                <TextField
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Mật khẩu"
                    variant="filled"
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockIcon />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    onClick={() => setShowPassword((s) => !s)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<LoginIcon />}
                    sx={{ mt: 1 }}
                    disabled={isLoading}
                >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>

                {/* Success snackbar */}
                <Snackbar
                    open={openMessage}
                    autoHideDuration={3000}
                    onClose={() => setOpenMessage(false)}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert onClose={() => setOpenMessage(false)} severity="success" sx={{ width: "100%" }}>
                        {message || "Đăng nhập thành công"}
                    </Alert>
                </Snackbar>

                {/* Error snackbar */}
                <Snackbar
                    open={openError}
                    autoHideDuration={6000}
                    onClose={() => setOpenError(false)}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert onClose={() => setOpenError(false)} severity="error" sx={{ width: "100%" }}>
                        {error || "Có lỗi xảy ra"}
                    </Alert>
                </Snackbar>
            </Box>
        </AuthLayout>
    );
};

export default AdminLoginScreen;