import { Box, TextField, Typography, IconButton } from "@mui/material";
import React from "react";
import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import { formatCurrency } from "../../utils/formatCurrency";

interface FlashSaleItemListProps {
  items: FlashSaleItemDTO[];
  onUpdate: (
    sku: string,
    field: "flashPrice" | "limitQuantity",
    value: number
  ) => void;
  onRemove: (sku: string) => void;
}

const FlashSaleItemList: React.FC<FlashSaleItemListProps> = ({
  items,
  onUpdate,
  onRemove,
}) => {
  if (items.length === 0) {
    return (
      <Typography sx={{ mt: 2, color: "#999" }}>
        Chưa có sản phẩm nào được chọn.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        mt: 3,
        border: "1px solid #e0e0e0",
        p: 2,
        borderRadius: 1,
        bgcolor: "#fbfbfb",
      }}
    >
      <Typography variant="h6" mb={2} sx={{ fontWeight: "bold" }}>
        Danh sách sản phẩm Flash Sale ({items.length})
      </Typography>
      {items.map((item) => (
        <Box
          key={item.sku}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            p: 2,
            borderBottom: "1px dashed #eee",
            "&:last-child": { borderBottom: "none" },
            bgcolor: "white",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              SKU: {item.sku}
            </Typography>
          </Box>

          {/* Input Flash Price */}
          <TextField
            label="Giá Flash Sale"
            type="number"
            size="small"
            value={item.flashPrice || ""}
            onChange={(e) =>
              onUpdate(item.sku, "flashPrice", parseFloat(e.target.value) || 0)
            }
            InputProps={{
              startAdornment: (
                <AttachMoneyIcon fontSize="small" color="action" />
              ),
            }}
            sx={{ width: 150 }}
          />

          {/* Input Limit Quantity */}
          <TextField
            label="SL Giới hạn"
            type="number"
            size="small"
            value={item.limitQuantity || ""}
            onChange={(e) =>
              onUpdate(item.sku, "limitQuantity", parseInt(e.target.value) || 0)
            }
            InputProps={{
              startAdornment: <InventoryIcon fontSize="small" color="action" />,
            }}
            sx={{ width: 150 }}
          />

          {/* Giá gốc (Chỉ hiển thị, không edit) - Cần lấy lại giá gốc nếu có */}
          {/* Do FlashSaleItemDTO không chứa giá gốc, ta chỉ hiển thị các trường đã có */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexGrow: 1, textAlign: "right" }}
          >
            {/* Nếu có trường price gốc trong DTO, bạn có thể hiển thị nó ở đây */}
            Hiện tại: {formatCurrency(item.flashPrice)}
          </Typography>

          <IconButton onClick={() => onRemove(item.sku)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default FlashSaleItemList;
