import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  Typography,
  Checkbox,
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  CircularProgress,
  Paper,
  TableContainer,
  TableHead,
  TableBody,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import type { ProductVariants } from "../../models/products/ProductVariant";
import type { ProductOption } from "../../models/products/ProductVariantOption";
import { ProductApi } from "../../api/product/ProductApi";
import { formatCurrency } from "../../utils/formatCurrency";
import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";

// Kiểu dữ liệu cho state lưu trữ các ProductOption đã chọn (dùng Map để dễ dàng truy cập theo SKU)
type SelectedProductMap = Map<string, FlashSaleItemDTO>;

// ------------------- VariantRow Component -------------------
interface VariantRowProps {
  variant: ProductVariants;
  selectedOptionsMap: SelectedProductMap;
  onToggleOption: (option: ProductOption, variant: ProductVariants) => void;
  loading?: boolean;
}

const VariantRow: React.FC<VariantRowProps> = ({
  variant,
  selectedOptionsMap,
  onToggleOption,
  loading,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell align="center">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{variant.name}</TableCell>
        <TableCell>{variant.code}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: "#f9f9f9" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Lựa chọn biến thể:
              </Typography>

              {/*(Logic hiển thị options)*/}
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : variant.options && variant.options.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 2,
                  }}
                >
                  {variant.options.map((option) => {
                    const optionSku = option.sku || "";
                    const isSelected = selectedOptionsMap.has(optionSku);

                    if (!optionSku) return null;

                    return (
                      <Paper
                        key={optionSku}
                        onClick={() => onToggleOption(option, variant)}
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          border: isSelected
                            ? "2px solid #2196f3"
                            : "1px solid #e0e0e0",
                          backgroundColor: isSelected ? "#e3f2fd" : "white",
                          "&:hover": {
                            boxShadow: 3,
                            transform: "translateY(-4px)",
                            borderColor: "#2196f3",
                          },
                          opacity: option.availability?.quantity > 0 ? 1 : 0.5,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <Checkbox
                            checked={isSelected}
                            // Bỏ onChange ở đây để click Paper tự động handle
                            sx={{ mt: -1, mr: 1 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                              {option.value}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#666", mb: 1 }}
                            >
                              SKU: {option.sku}
                            </Typography>
                          </Box>
                        </Box>

                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ color: "#2196f3", fontWeight: "bold", mb: 1 }}
                          >
                            {option.availability?.salePrice
                              ? formatCurrency(option.availability.salePrice)
                              : "N/A"}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12px",
                              mb: 1,
                            }}
                          >
                            <Typography variant="caption">
                              Kho: {option.availability?.quantity || 0}
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: isSelected ? "#2196f3" : "#666",
                              fontWeight: isSelected ? "bold" : "normal",
                            }}
                          >
                            {isSelected ? "✓ Đã chọn" : "Click để chọn"}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#999" }}>
                  Không có lựa chọn nào
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ------------------- ProductVariantListModalForFlashSale Component -------------------

interface ProductVariantListModalForFlashSaleProps {
  open: boolean;
  onClose: () => void;
  onApply: (selectedOptions: FlashSaleItemDTO[]) => void;
  productId?: number;
  selectedProducts?: FlashSaleItemDTO[];
}

const ProductVariantListModalForFlashSale: React.FC<
  ProductVariantListModalForFlashSaleProps
> = ({ open, onClose, onApply, productId, selectedProducts = [] }) => {
  const [variants, setVariants] = useState<ProductVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedOptionsMap, setSelectedOptionsMap] =
    useState<SelectedProductMap>(new Map());

  // Fetch danh sách products
  const fetchVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      let allVariants: ProductVariants[] = [];
      if (productId) {
        const response = await ProductApi.getById(productId);
        allVariants = response.data.variants || [];
      } else {
        const response = await ProductApi.getAll(0, 50);
        const products = response.data.content || response.data || [];
        allVariants = products.flatMap(
          (product: any) => product.variants || []
        );
      }
      setVariants(allVariants);
    } catch (err: any) {
      // Bắt lỗi timeout hoặc lỗi khác
      setError(
        err?.response?.data?.message || "Lỗi khi tải danh sách sản phẩm"
      );
      console.error("Failed to fetch variants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVariants();
      // Khởi tạo lại selectedOptionsMap từ selectedProducts truyền vào
      const initialMap = new Map(selectedProducts.map((p) => [p.sku, p]));
      setSelectedOptionsMap(initialMap);
    }
  }, [open, productId]);

  const filteredVariants = variants.filter(
    (variant) =>
      variant.name?.toLowerCase().includes(search.toLowerCase()) ||
      variant.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleOption = (option: ProductOption) => {
    const optionSku = option.sku || "";
    if (!optionSku) return;

    const newSelected = new Map(selectedOptionsMap);

    // Tạo đối tượng FlashSaleItemDTO từ dữ liệu
    const flashSaleDto: FlashSaleItemDTO = {
      sku: optionSku,
      flashPrice: option.availability.salePrice,
      soldQuantity: 0,
      limitQuantity: option.availability.quantity,
    };

    if (newSelected.has(optionSku)) {
      newSelected.delete(optionSku);
    } else {
      newSelected.set(optionSku, flashSaleDto);
    }

    setSelectedOptionsMap(newSelected);
  };

  const handleApply = () => {
    // Chuyển Map thành Array và trả về
    onApply(Array.from(selectedOptionsMap.values()));
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const selectedCount = selectedOptionsMap.size;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Chọn sản phẩm áp dụng cho Flash Sale
        {selectedCount > 0 && (
          <Typography
            component="span"
            sx={{ ml: 2, color: "#2196f3", fontWeight: "bold" }}
          >
            ({selectedCount} sản phẩm được chọn)
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {/* Phần tìm kiếm */}
        <Box sx={{ mb: 2, mt: 2 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#999" }} />,
            }}
          />
        </Box>

        {/* Hiển thị lỗi */}
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "#ffebee", borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Hiển thị danh sách biến thể */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredVariants.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center", color: "#999" }}>
            {search ? "Không tìm thấy sản phẩm" : "Không có sản phẩm nào"}
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Mã</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVariants.map((variant) => (
                  <VariantRow
                    key={variant.id}
                    variant={variant}
                    selectedOptionsMap={selectedOptionsMap}
                    onToggleOption={handleToggleOption}
                    loading={loading}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={selectedCount === 0 || loading}
        >
          Áp dụng ({selectedCount})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductVariantListModalForFlashSale;
