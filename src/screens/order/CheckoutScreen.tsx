import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
} from "@mui/material";

export default function CheckoutScreen() {
  const [paymentMethod, setPaymentMethod] = useState("qr");

  return (
    <Grid container spacing={4} justifyContent="center" pt={2} px={20}>
      {/* LEFT FORM */}
      <Grid width={"65%"} item xs={12} md={7}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Thông tin giao hàng
        </Typography>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên"
              defaultValue="Nguyen Duc Huy"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              defaultValue="0868661273"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Select fullWidth defaultValue={"Ho Chi Minh, Go Vap"}>
              <MenuItem value="Ho Chi Minh, Go Vap">
                Hồ Chí Minh, Gò Vấp
              </MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Địa chỉ nhận hàng"
              defaultValue="748/148/36 Thong Nhat, p.15 Go Vap"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" fontWeight="bold" mb={2}>
          Phương thức thanh toán
        </Typography>

        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel
            value="qr"
            control={<Radio />}
            label="Chuyển khoản QR"
          />
          <FormControlLabel
            value="atm"
            control={<Radio />}
            label="Thẻ ATM nội địa"
          />
          <FormControlLabel
            value="cod"
            control={<Radio />}
            label="Thanh toán khi nhận hàng"
          />
          <FormControlLabel
            value="visa"
            control={<Radio />}
            label="Thẻ VISA / Master Card"
          />
        </RadioGroup>

        {paymentMethod === "qr" && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography fontWeight="bold">Hướng dẫn chuyển khoản</Typography>
              <Typography fontSize={14} mt={1}>
                Ngân hàng: Sacombank
                <br />
                Tên: NGUYEN DUC HUY
                <br />
                STK: 060273757352
                <br />
                Nội dung CK: 212511010011 QHF2G3
                <br />
                Số tiền: 849.000đ
              </Typography>
              <Box mt={2}>
                <Button variant="contained">Tôi đã chuyển khoản</Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Grid>

      {/* RIGHT SUMMARY */}
      <Grid width={"25%"} item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Tóm tắt đơn hàng
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tạm tính</Typography>
              <Typography>849.000đ</Typography>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" mt={1} mb={2}>
              <Typography fontWeight="bold">Tổng cộng</Typography>
              <Typography fontWeight="bold">849.000đ</Typography>
            </Box>
            <Button fullWidth variant="contained" sx={{ borderRadius: 2 }}>
              Đặt hàng
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
