import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

export function useFacebook(appId: string, version = "v16.0") {
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    //avoid double-inject
    if (document.getElementById("facebook-jssdk")) return;

    window.fbAsyncInit = function () {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version,
      });
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // optionally cleanup script on unmount
    };
  }, [appId, version]);
}
