import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import type {
  PromotionReadableDTO,
  CreatePromotionRequest,
  ProductOptionDTO,
} from "../../models/promotions/Promotion";
import { PromotionApi } from "../../api/promotion/PromotionApi";
import ProductVariantListModalForPromotion from "../modals/ProductVariantListModalForPromotion";

interface PromotionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotion?: PromotionReadableDTO | null;
  allProductOptions?: any[];
}

export const PromotionFormDialog = ({
  open,
  onClose,
  onSuccess,
  promotion,
}: PromotionFormDialogProps) => {
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    code: "",
    description: "",
    discountPercentage: undefined,
    discountAmount: undefined,
    validFrom: "",
    validTo: "",
    isActive: true,
    applicableProductOptionIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ProductOptionDTO[]>(
    []
  );
  const [openProductModal, setOpenProductModal] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );

  useEffect(() => {
    if (promotion) {
      setFormData({
        code: promotion.code,
        description: promotion.description,
        discountPercentage: promotion.discountPercentage,
        discountAmount: promotion.discountAmount,
        validFrom: promotion.validFrom?.replace("Z", "").slice(0, 16) || "",
        validTo: promotion.validTo?.replace("Z", "").slice(0, 16) || "",
        isActive: promotion.isActive,
        applicableProductOptionSkus:
          promotion.applicableProductOptions?.map((p) => p.sku) || [],
        applicableProductOptionIds: undefined,
      });
      // Set discount type based on existing data
      if (promotion.discountPercentage) {
        setDiscountType("percentage");
      } else if (promotion.discountAmount) {
        setDiscountType("amount");
      }
      if (promotion.applicableProductOptions) {
        setSelectedProducts(promotion.applicableProductOptions);
      }
    } else {
      resetForm();
    }
  }, [promotion, open]);

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountPercentage: undefined,
      discountAmount: undefined,
      validFrom: "",
      validTo: "",
      isActive: true,
      applicableProductOptionSkus: [],
      applicableProductOptionIds: undefined,
    });
    setSelectedProducts([]);
    setErrors({});
    setMessage(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = "Mã khuyến mãi không được để trống";
    }
    if (!formData.description?.trim()) {
      newErrors.description = "Tên chương trình không được để trống";
    }
    if (!formData.validFrom) {
      newErrors.validFrom = "Ngày bắt đầu không được để trống";
    }
    if (!formData.validTo) {
      newErrors.validTo = "Ngày kết thúc không được để trống";
    }

    // Validate dates - only check start date when creating new promotion
    // When updating (promotion exists with id), skip start date validation
    if (!promotion?.id && formData.validFrom) {
      const startDate = new Date(formData.validFrom);
      const now = new Date();

      if (startDate <= now) {
        newErrors.validFrom = "Ngày bắt đầu phải sau thời gian hiện tại. Vui lòng chọn ngày trong tương lai";
      }
    }

    if (formData.validFrom && formData.validTo) {
      const startDate = new Date(formData.validFrom);
      const endDate = new Date(formData.validTo);

      if (endDate <= startDate) {
        newErrors.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    // Validate discount value
    if (
      formData.discountPercentage === undefined &&
      formData.discountAmount === undefined
    ) {
      if (discountType === "percentage") {
        newErrors.discount = "Vui lòng nhập phần trăm giảm giá (0-100)";
      } else {
        newErrors.discount = "Vui lòng nhập số tiền giảm giá";
      }
    } else if (
      discountType === "percentage" &&
      (formData.discountPercentage === undefined ||
        formData.discountPercentage <= 0 ||
        formData.discountPercentage > 100)
    ) {
      newErrors.discount = "Phần trăm giảm giá phải từ 0 đến 100";
    } else if (
      discountType === "amount" &&
      (formData.discountAmount === undefined || formData.discountAmount <= 0)
    ) {
      newErrors.discount = "Số tiền giảm giá phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === "discountPercentage" || name === "discountAmount"
            ? value
              ? parseFloat(value)
              : undefined
            : value,
      };

      // Clear the other discount field when one is entered
      if (name === "discountPercentage" && value) {
        updated.discountAmount = undefined;
        setDiscountType("percentage");
      } else if (name === "discountAmount" && value) {
        updated.discountPercentage = undefined;
        setDiscountType("amount");
      }

      return updated;
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleProductsApply = (selectedOptionSkus: string[]) => {
    setFormData((prev) => ({
      ...prev,
      applicableProductOptionSkus: selectedOptionSkus,
      applicableProductOptionIds: undefined, // Clear ID-based lookup
    }));
    // Cập nhật danh sách hiển thị (tạm thời hiển thị SKU)
    setSelectedProducts(
      selectedOptionSkus.map((sku) => ({
        id: 0,
        sku,
        code: "",
        name: "",
        value: "",
      }))
    );
  };

  const handleRemoveProduct = (sku: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableProductOptionSkus: (
        prev.applicableProductOptionSkus || []
      ).filter((s) => s !== sku),
    }));
    setSelectedProducts((prev) => prev.filter((p) => p.sku !== sku));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Log payload để debug
      console.log("Sending promotion payload:", formData);

      if (promotion) {
        // Update existing
        const updateData = {
          id: promotion.id,
          ...formData,
        };
        console.log("Update data:", updateData);
        await PromotionApi.update(promotion.id, updateData);
        setMessage({ type: "success", text: "Cập nhật khuyến mãi thành công" });
      } else {
        // Create new
        console.log("Create data:", formData);
        await PromotionApi.create(formData);
        setMessage({ type: "success", text: "Tạo khuyến mãi thành công" });
      }

      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errorMessage || "Có lỗi xảy ra";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {promotion ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            {message && <Alert severity={message.type}>{message.text}</Alert>}

            <TextField
              label="Mã khuyến mãi"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              fullWidth
              disabled={!!promotion}
              error={!!errors.code}
              helperText={errors.code}
              placeholder="VD: SUMMER2024"
            />

            <TextField
              label="Tên chương trình"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.description}
              helperText={errors.description}
              placeholder="VD: Chương trình hè"
              multiline
              rows={2}
            />

            {/* Discount Type Selection */}
            <FormControl fullWidth>
              <FormLabel>Kiểu giảm giá</FormLabel>
              <RadioGroup
                row
                value={discountType}
                onChange={(e) => {
                  const newType = e.target.value as "percentage" | "amount";
                  setDiscountType(newType);
                  // Clear both discount fields
                  setFormData((prev) => ({
                    ...prev,
                    discountPercentage: undefined,
                    discountAmount: undefined,
                  }));
                }}
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="percentage"
                  control={<Radio />}
                  label="Giảm theo phần trăm (%)"
                />
                <FormControlLabel
                  value="amount"
                  control={<Radio />}
                  label="Giảm theo tiền (₫)"
                />
              </RadioGroup>
            </FormControl>

            {discountType === "percentage" && (
              <TextField
                label="Phần trăm giảm giá (%)"
                name="discountPercentage"
                type="number"
                value={formData.discountPercentage || ""}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                placeholder="VD: 10"
                error={!!errors.discount}
                helperText={errors.discount || "Nhập phần trăm từ 0 đến 100"}
              />
            )}

            {discountType === "amount" && (
              <TextField
                label="Số tiền giảm giá (₫)"
                name="discountAmount"
                type="number"
                value={formData.discountAmount || ""}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0, step: 1 }}
                placeholder="VD: 50000"
                error={!!errors.discount}
                helperText={errors.discount || "Nhập số tiền giảm giá"}
              />
            )}

            <TextField
              label="Ngày bắt đầu"
              name="validFrom"
              type="datetime-local"
              value={formData.validFrom}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.validFrom}
              helperText={errors.validFrom}
            />

            <TextField
              label="Ngày kết thúc"
              name="validTo"
              type="datetime-local"
              value={formData.validTo}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.validTo}
              helperText={errors.validTo}
            />

            <Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenProductModal(true)}
              >
                Chọn sản phẩm áp dụng (Đã chọn: {selectedProducts.length})
                <br></br>(Không chọn = áp dụng cho tất cả)
              </Button>
              {selectedProducts.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2, flexWrap: "wrap" }}
                >
                  {selectedProducts.map((product) => (
                    <Chip
                      key={product.sku}
                      label={product.sku || `ID: ${product.id}`}
                      onDelete={() => handleRemoveProduct(product.sku)}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                />
              }
              label="Kích hoạt"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : promotion ? (
              "Cập nhật"
            ) : (
              "Tạo"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Selection Modal */}
      <ProductVariantListModalForPromotion
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
        onApply={handleProductsApply}
      />
    </>
  );
};
