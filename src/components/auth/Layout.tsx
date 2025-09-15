import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme/theme";
import HeaderAuth from "./HeaderAuth";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  screenName: string;
  children: ReactNode;
}

const AuthLayout = ({ children, screenName }: AuthLayoutProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <HeaderAuth
        title="Shepop"
        subtitle={screenName === "login" ? "Đăng nhập" : "Đăng ký"}
      />

      {/* Form */}
      <Box sx={{ flex: 1, background: colors.brandColors.primary[700] }}>
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
