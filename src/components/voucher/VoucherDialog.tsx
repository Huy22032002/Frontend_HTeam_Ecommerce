import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import type { Voucher } from "../../models/vouchers/Voucher";
import { formatCurrency } from "../../utils/formatCurrency";

type VoucherDialogProps = {
  open: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  selectedVoucher: Voucher | null;
  onSelectVoucher: (v: Voucher) => void;
};

const VoucherDialog = ({
  open,
  onClose,
  vouchers,
  selectedVoucher,
  onSelectVoucher,
}: VoucherDialogProps) => {
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}> Voucher của bạn</DialogTitle>

      <DialogContent dividers>
        {vouchers.length === 0 && (
          <Typography color="textSecondary">Không có voucher nào</Typography>
        )}

        <Stack spacing={2}>
          {vouchers.map((voucher) => {
            const isSelected = selectedVoucher?.code === voucher.code;

            return (
              <Box
                key={voucher.code}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${isSelected ? "#ff5f00" : "#eee"}`,
                  bgcolor: isSelected ? "#fff3e6" : "#fff",
                }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {voucher.code}
                    </Typography>
                    <Typography sx={{ color: "#ff5f00", fontWeight: 600 }}>
                      Giá trị giảm {formatCurrency(voucher.value)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#888" }}>
                      Đơn tối thiểu: {formatCurrency(voucher.minOrder)}
                    </Typography>
                  </Box>

                  <Button
                    variant={isSelected ? "contained" : "outlined"}
                    color="warning"
                    onClick={() => onSelectVoucher(voucher)}
                  >
                    {isSelected ? "Đã chọn" : "Áp dụng"}
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="warning">
          Hoàn tất
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoucherDialog;
