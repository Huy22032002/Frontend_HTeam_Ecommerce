import { useFacebook } from "../../hooks/useFacebook";
import FacebookIcon from "@mui/icons-material/Facebook";
import { Button } from "@mui/material";
import axios from "axios";

//models
import type { FacebookAuthRequest } from "../../models/auths/FacebookAuthRequest";
import type { LoginResponse } from "../../models/auths/LoginResponse";

interface Props {
  appId: string;
  backendEndpoint: string;
  onAuthSuccess?: (jwt: string) => void;
}

export default function FBLoginButton({
  appId,
  backendEndpoint,
  onAuthSuccess,
}: Props) {
  useFacebook(appId);

  const handleLogin = () => {
    if (!window.FB) {
      console.error("FB SDK chưa sẵn sàng");
      return;
    }

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const data: FacebookAuthRequest = {
            accessToken: response.authResponse.accessToken,
          };

          // gửi access token về backend
          axios
            .post(`${backendEndpoint}/api/customers/login/facebook`, data, {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            })
            .then((res) => {
              const response: LoginResponse = res.data;
              console.log("token:", response.token);

              localStorage.setItem("token", response.token);
              localStorage.setItem("id", response.id.toString());

              if (onAuthSuccess) onAuthSuccess(response.token);
            })
            .catch((err) => {
              console.error("Login failed:", err);
            });
        } else {
          console.warn("User cancelled login or did not fully authorize.");
        }
      },
      { scope: "email,public_profile,user_gender,user_birthday" }
    );
  };

  return (
    <Button
      variant="outlined"
      onClick={handleLogin}
      startIcon={<FacebookIcon />}
    >
      Facebook
    </Button>
  );
}
