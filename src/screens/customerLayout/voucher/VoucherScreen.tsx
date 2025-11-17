import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import useVoucher from "./Voucher.hook";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useEffect } from "react";

const VoucherScreen = () => {
  const {
    getVouchersByCustomerId,
    customer,
    loading,
    handleCopy,
    filter,
    setFilter,
    filteredVouchers,
  } = useVoucher();

  useEffect(() => {
    getVouchersByCustomerId();
  }, [customer]);

  return (
    <>
      <FormControl sx={{ mb: 2, minWidth: 150 }}>
        <InputLabel>Trạng thái</InputLabel>
        <Select
          value={filter}
          label="Trạng thái"
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <MenuItem value="ALL">Tất cả</MenuItem>
          <MenuItem value="ACTIVE">Còn hạn</MenuItem>
          <MenuItem value="USED">Đã dùng</MenuItem>
          <MenuItem value="EXPIRED">Hết hạn</MenuItem>
        </Select>
      </FormControl>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredVouchers.length === 0 ? (
        <Typography textAlign="center" mt={4}>
          Không có voucher nào.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {filteredVouchers.map((v) => (
            <Card
              key={v.code}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor:
                  v.status === "EXPIRED"
                    ? "#a0a0a0ff"
                    : v.status === "USED"
                    ? "#e0e0e0"
                    : "#9cffa2ff",
                opacity: v.status === "EXPIRED" ? 0.6 : 1,
                transition: "0.2s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <CardGiftcardIcon fontSize="large" color="primary" />
                <Box>
                  <Typography variant="subtitle1">
                    Giảm {v.value.toLocaleString()} VNĐ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mã Voucher: {v.code}
                  </Typography>
                  {v.minOrder && (
                    <Typography variant="body2" color="text.secondary">
                      Áp dụng cho đơn từ: {v.minOrder.toLocaleString()} VNĐ
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {`Hạn sử dụng: ${new Date(
                      v.startDate
                    ).toLocaleDateString()} - ${new Date(
                      v.endDate
                    ).toLocaleDateString()}`}
                  </Typography>
                </Box>
              </CardContent>
              <Tooltip title="Copy code voucher">
                <IconButton onClick={() => handleCopy(v.code)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
};
export default VoucherScreen;
