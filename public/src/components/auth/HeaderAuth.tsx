import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme/theme";
import type React from "react";

type HeaderAuthProps = {
  title: string;
  subtitle: string;
};

const HeaderAuth: React.FC<HeaderAuthProps> = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "80px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        padding: 2,
      }}
    >
      <Typography
        sx={{
          color: colors.greenAccent[100],
          fontWeight: "bold",
          fontSize: 32,
        }}
      >
        {props.title}
      </Typography>
      <Typography
        sx={{
          color: colors.primary[100],
          fontSize: 28,
        }}
      >
        {props.subtitle}
      </Typography>
    </Box>
  );
};

export default HeaderAuth;
