// File: FlashSaleItemDetailRow.tsx (Component mới)

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";

import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";
import { formatCurrency } from "../../utils/formatCurrency";
interface FlashSaleItemDetailRowProps {
  items: FlashSaleItemDTO[];
}

const FlashSaleItemDetailRow: React.FC<FlashSaleItemDetailRowProps> = ({
  items,
}) => {
  return (
    <Box sx={{ margin: 1 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, mb: 1, color: "#1976d2" }}
      >
        Sản phẩm trong Flash Sale ({items.length})
      </Typography>

      <TableContainer
        sx={{
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f7fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giá Flash Sale</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Số lượng Giới hạn</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Đã bán</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.sku}
                sx={{
                  "&:hover": {
                    backgroundColor: "#f9f9f9",
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{item.sku}</TableCell>
                <TableCell>{formatCurrency(item.flashPrice)}</TableCell>
                <TableCell>{item.limitQuantity}</TableCell>
                <TableCell>{item.soldQuantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FlashSaleItemDetailRow;
