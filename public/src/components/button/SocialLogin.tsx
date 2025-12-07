import { useRef } from "react";
import { Button, Typography, useTheme } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useExternalSDK } from "../../hooks/useExternalSDK";
import { providers } from "../../configs/AuthProvider";
import { tokens } from "../../theme/theme";

interface Props {
  provider: "google" | "facebook";
  onLogin: (data: any) => void;
}

export default function SocialLogin({ provider, onLogin }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const buttonRef = useRef<HTMLDivElement>(null);

  useExternalSDK(providers[provider].sdkUrl, () => {
    if (provider === "google") {
      providers.google.init(onLogin, buttonRef.current);
    }
  });

  if (provider === "google") {
    return <div ref={buttonRef}></div>;
  }

  if (provider === "facebook") {
    return (
      <Button
        variant="outlined"
        size="large"
        startIcon={<FacebookIcon />}
        onClick={() => providers.facebook.init(onLogin)}
        sx={{
          color: colors.blueAccent[400],
        }}
      >
        <Typography
          sx={{
            color: colors.primary[100],
            fontSize: 14,
            textTransform: "capitalize",
            fontWeight: "bold",
          }}
        >
          Facebook
        </Typography>
      </Button>
    );
  }

  return null;
}
