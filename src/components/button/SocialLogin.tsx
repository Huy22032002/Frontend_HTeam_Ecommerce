import { useRef } from "react";
import { Button } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useExternalSDK } from "../../hooks/useExternalSDK";
import { providers } from "../../configs/AuthProvider";

interface Props {
  provider: "google" | "facebook";
  onLogin: (data: any) => void;
}

export default function SocialLogin({ provider, onLogin }: Props) {
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
        startIcon={<FacebookIcon />}
        onClick={() => providers.facebook.init(onLogin)}
      >
        Facebook
      </Button>
    );
  }

  return null;
}
