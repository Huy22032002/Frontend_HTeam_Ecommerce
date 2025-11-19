import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import useCreateFlashSale from "./CreateFlashSale.hook";
import { useEffect, useState } from "react";
import type { FlashSaleItemDTO } from "../../../models/flashSale/FlashSaleItemDTO";
import ProductVariantListModalForFlashSale from "../../../components/modals/ProductVariantListModalForFlashSale";
import FlashSaleItemList from "../../../components/flashSale/FlashSaleItem";
import ErrorPopup from "../../../components/ErrorPopup";

const CreateFlashSaleScreen = () => {
  const {
    loading,
    error,
    errorApi,
    setErrorApi,
    name,
    setName,
    description,
    setDescription,
    status,
    setStatus,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    items,
    setItems,
    handleSubmit,
  } = useCreateFlashSale();

  //form Product
  const [selectedFlashSaleItems, setSelectedFlashSaleItems] = useState<
    FlashSaleItemDTO[]
  >([]);
  const [openProductModal, setOpenProductModal] = useState(false);

  const handleProductsApply = (selectedItems: FlashSaleItemDTO[]) => {
    setSelectedFlashSaleItems(selectedItems);
    setOpenProductModal(false);

    // Map selected product options to FlashSaleItemDTO for submission
    const newItems: FlashSaleItemDTO[] = selectedItems.map((flashSaleItem) => ({
      sku: flashSaleItem.sku,
      flashPrice: flashSaleItem.flashPrice,
      limitQuantity: flashSaleItem.limitQuantity,
      soldQuantity: 0,
    }));

    setItems(newItems);
  };

  const handleItemUpdate = (
    sku: string,
    field: "flashPrice" | "limitQuantity",
    value: number
  ) => {
    setSelectedFlashSaleItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.sku === sku) {
          // Đảm bảo giá và số lượng không âm
          const newValue = Math.max(0, value);

          return {
            ...item,
            [field]: newValue,
          };
        }
        return item;
      });
      // Cập nhật state cho hook (items) sau khi cập nhật local state
      setItems(updatedItems);
      return updatedItems;
    });
  };

  const handleRemoveItem = (sku: string) => {
    setSelectedFlashSaleItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.sku !== sku);
      // Cập nhật state cho hook (items) sau khi cập nhật local state
      setItems(updatedItems);
      return updatedItems;
    });
  };

  // Hàm xử lý đóng popup lỗi
  const handleCloseErrorPopup = () => {
    setErrorApi(null);
  };

  useEffect(() => {
    setSelectedFlashSaleItems(items);
  }, [items]);

  //------------------------------
  const statusOptions = ["ACTIVE", "UPCOMING"];

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" mb={2}>
        Tạo Flash Sale Mới
      </Typography>
      {errorApi && (
        <ErrorPopup
          open={!!errorApi}
          onClose={handleCloseErrorPopup}
          errorMessage={errorApi}
        />
      )}

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          label="Tên Flash Sale"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Mô tả"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          label="Trạng thái"
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ mb: 2 }}
        >
          {statusOptions.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Ngày bắt đầu"
          type="datetime-local"
          fullWidth
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Ngày kết thúc"
          type="datetime-local"
          fullWidth
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setOpenProductModal(true)}
        >
          Chọn sản phẩm áp dụng (Đã chọn: {selectedFlashSaleItems.length})
          <br></br>
        </Button>

        {/*  Hiển thị và chỉnh sửa danh sách sản phẩm đã chọn */}
        <FlashSaleItemList
          items={selectedFlashSaleItems}
          onUpdate={handleItemUpdate}
          onRemove={handleRemoveItem}
        />

        <Button
          sx={{ mt: 2 }}
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Đang tạo..." : "Tạo Flash Sale"}
        </Button>
      </form>

      {/* Product Selection Modal */}
      <ProductVariantListModalForFlashSale
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
        onApply={handleProductsApply}
      />
    </Box>
  );
};

export default CreateFlashSaleScreen;
