import { loginFacebook } from "../../api/customer/CustomerAuth";

const useLogin = () => {
  const handleLoginFB = async (accessTokenFB: string) => {
    await loginFacebook(accessTokenFB);
  };

  return { handleLoginFB };
};

export default useLogin;
