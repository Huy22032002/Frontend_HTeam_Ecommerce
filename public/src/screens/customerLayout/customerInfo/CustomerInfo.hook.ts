import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { CustomerApi } from "../../../api/customer/CustomerApi";
import { login } from "../../../store/customerSlice";
import { isValidAge } from "../../../utils/validateAge";

const useCustomerInfo = () => {
  const customer = useSelector(
    (state: RootState) => state.customerAuth.customer
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [gender, setGender] = useState("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");

  //đổi mk
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    try {
      if (!customer?.id) return;

      await CustomerApi.changePassword(
        customer.id,
        currentPassword,
        newPassword
      );

      alert("Đổi mật khẩu thành công!");
      setOpenDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert("Sai mật khẩu hoặc có lỗi xảy ra!");
      console.log(err);
    }
  };

  const dispatch = useDispatch();

  const handleSave = async () => {
    if (!isValidAge(dateOfBirth)) {
      alert("Người dùng phải từ 16 tuổi trở lên!");
      return;
    }
    if (!name.trim()) {
      alert("Vui lòng nhập tên");
      return;
    }

    try {
      if (!customer?.id) return;

      const updatedCustomer = {
        name,
        dob: dateOfBirth, // string yyyy-MM-dd
        gender,
      };

      const res = await CustomerApi.updateInfo(customer.id, updatedCustomer);
      console.log("Updated:", res);

      //Cập nhật Redux để UI re-render
      dispatch(login(res.data));

      alert("Cập nhật thành công!");
    } catch (err) {
      console.log(err);
      alert("Có lỗi xảy ra!");
    }
  };

  return {
    customer,
    name,
    setName,
    phone,
    setPhone,
    emailAddress,
    setEmailAddress,
    gender,
    setGender,
    dateOfBirth,
    setDateOfBirth,
    handleSave,
    //doi mk
    handleChangePassword,
    openDialog,
    setOpenDialog,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    currentPassword,
    setCurrentPassword,
  };
};
export default useCustomerInfo;
