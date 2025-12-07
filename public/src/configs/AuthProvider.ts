export const providers = {
  google: {
    sdkUrl: "https://accounts.google.com/gsi/client", //sdk của google identify service
    init: (onSuccess: (res: any) => void, buttonRef: HTMLElement | null) => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: onSuccess,
      });

      window.google.accounts.id.renderButton(buttonRef, {
        theme: "filled_blue",
        size: "large",
        width: "160",
      });
    },
  },

  facebook: {
    sdkUrl: "https://connect.facebook.net/en_US/sdk.js",
    init: (onSuccess: (res: any) => void) => {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v17.0",
      });
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            onSuccess(response);
          }
        },
        { scope: "email,public_profile,user_gender,user_birthday" }
      );
    },
  },
};
