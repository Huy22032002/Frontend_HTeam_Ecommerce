import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import useCustomerInfo from "./CustomerInfo.hook";
import { useEffect } from "react";

const CustomerInfo = () => {
  const {
    customer,
    name,
    setName,
    phone,
    setPhone,
    dateOfBirth,
    setDateOfBirth,
    gender,
    setGender,
    emailAddress,
    setEmailAddress,
    //doi mk
    confirmPassword,
    setConfirmPassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    openDialog,
    setOpenDialog,
    handleChangePassword,
    //update info
    handleSave,
  } = useCustomerInfo();

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setPhone(customer.phone || "");
      setEmailAddress(customer.emailAddress || "");
      setGender(customer.gender || "M");
      setDateOfBirth(customer.dateOfBirth || "");
    }
  }, [customer]);

  return (
    <Box
      sx={{
        flex: 1,
        maxWidth: 680,
        background: "white",
        p: 4,
        borderRadius: 2,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h5" fontWeight="600" mb={3}>
        Thông tin tài khoản
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Số điện thoại"
          value={phone}
          disabled
          helperText="Số điện thoại không thể thay đổi"
        />

        <TextField
          label="Email"
          value={emailAddress}
          disabled
          helperText="Email không thể thay đổi"
        />

        <Box>
          <Typography mb={1}>Giới tính</Typography>
          <RadioGroup
            row
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <FormControlLabel value="M" control={<Radio />} label="Nam" />
            <FormControlLabel value="F" control={<Radio />} label="Nữ" />
          </RadioGroup>
        </Box>

        <TextField
          label="Ngày sinh"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          sx={{ mt: 2, alignSelf: "flex-start", px: 4 }}
          onClick={handleSave}
        >
          Lưu thay đổi
        </Button>

        {/* Nút Đổi mật khẩu */}
        <Button
          variant="outlined"
          color="secondary"
          sx={{ alignSelf: "flex-start", px: 4 }}
          onClick={() => setOpenDialog(true)}
        >
          Đổi mật khẩu
        </Button>

        {/* Popup Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Mật khẩu hiện tại"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleChangePassword}>
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CustomerInfo;
