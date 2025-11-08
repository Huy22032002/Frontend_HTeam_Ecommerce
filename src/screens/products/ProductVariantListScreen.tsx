import { useState, useEffect, Fragment } from "react";
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Pagination,
  Chip,
  InputAdornment,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { VariantsApi } from "../../api/product/VariantApi";
import { VariantsOptionsApi } from "../../api/product/VariantOptionsApi";
import { formatCurrency } from "../../utils/formatCurrency";

interface ProductVariant {
  id: number;
  code: string;
  name: string;
  options: OptionData[];
}

interface OptionData {
  id: number;
  sku: string;
  value: string;
  availability: {
    quantity: number;
    regularPrice: number;
    salePrice: number;
    productStatus: boolean;
    audit: {
      createdAt: string;
    };
  };
}

const ProductVariantListScreen = () => {
  const theme = useTheme();

  // State
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>({});
  const [showFilters, setShowFilters] = useState(true);

  // Notification
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    type: "variant" | "option";
    variantId?: number;
    optionId?: number;
    name?: string;
    code?: string;
    sku?: string;
    value?: string;
    regularPrice?: number;
    salePrice?: number;
    quantity?: number;
    productStatus?: boolean;
  }>({
    open: false,
    type: "variant",
  });

  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "variant" | "option";
    variantId?: number;
    optionId?: number;
    variantName?: string;
    optionName?: string;
  }>({
    open: false,
    type: "variant",
  });

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Flatten variants từ nested structure - lấy products, không flattened options
  const processVariants = (productList: any[]): ProductVariant[] => {
    return productList.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      options: product.options || [],
    }));
  };

  // Toggle expand row
  const toggleExpand = (variantId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedRows(newExpanded);
  };

  // Open edit variant dialog
  const handleEditVariant = (variant: ProductVariant) => {
    setEditDialog({
      open: true,
      type: "variant",
      variantId: variant.id,
      name: variant.name,
      code: variant.code,
    });
  };

  // Open edit option dialog
  const handleEditOption = (variantId: number, option: OptionData) => {
    setEditDialog({
      open: true,
      type: "option",
      variantId,
      optionId: option.id,
      sku: option.sku,
      value: option.value,
      regularPrice: option.availability?.regularPrice,
      salePrice: option.availability?.salePrice,
      quantity: option.availability?.quantity,
      productStatus: option.availability?.productStatus,
    });
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, type: "variant" });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);

      if (editDialog.type === "variant" && editDialog.variantId) {
        // Update variant
        const result = await VariantsApi.updateVariant(
          editDialog.variantId,
          {
            name: editDialog.name,
            code: editDialog.code,
          }
        );

        if (result?.success) {
          setNotification({
            isOpen: true,
            type: "success",
            message: "✅ Cập nhật biến thể thành công!",
          });
          handleCloseEditDialog();
          // Reload data
          fetchVariants();
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            message: `❌ Error (${result?.errorCode || "500"}): ${
              result?.error || "Lỗi cập nhật variant"
            }`,
          });
        }
      } else if (editDialog.type === "option" && editDialog.optionId) {
        // Update option
        const result = await VariantsOptionsApi.updateOption(
          editDialog.optionId,
          {
            value: editDialog.value,
            regularPrice: editDialog.regularPrice,
            salePrice: editDialog.salePrice,
            quantity: editDialog.quantity,
            productStatus: editDialog.productStatus,
          }
        );

        if (result?.success) {
          setNotification({
            isOpen: true,
            type: "success",
            message: "✅ Cập nhật tùy chọn thành công!",
          });
          handleCloseEditDialog();
          // Reload data
          fetchVariants();
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            message: `❌ Error (${result?.errorCode || "500"}): ${
              result?.error || "Lỗi cập nhật tùy chọn"
            }`,
          });
        }
      }
    } catch (err) {
      console.error("Error updating:", err);
      setNotification({
        isOpen: true,
        type: "error",
        message: "❌ Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open delete confirmation for variant
  const handleDeleteVariant = (variant: ProductVariant) => {
    setDeleteConfirm({
      open: true,
      type: "variant",
      variantId: variant.id,
      variantName: variant.name,
    });
  };

  // Open delete confirmation for option
  const handleDeleteOption = (variantId: number, option: OptionData) => {
    setDeleteConfirm({
      open: true,
      type: "option",
      variantId,
      optionId: option.id,
      optionName: option.value,
    });
  };

  // Close delete confirmation
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirm({ open: false, type: "variant" });
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);

      if (deleteConfirm.type === "variant" && deleteConfirm.variantId) {
        // Delete variant
        const result = await VariantsApi.deleteVariant(deleteConfirm.variantId);

        if (result?.success) {
          setNotification({
            isOpen: true,
            type: "success",
            message: "✅ Xoá variant thành công!",
          });
          handleCloseDeleteConfirm();
          // Reload data
          fetchVariants();
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            message: `❌ Error (${result?.errorCode || "500"}): ${
              result?.error || "Lỗi xoá variant"
            }`,
          });
        }
      } else if (deleteConfirm.type === "option" && deleteConfirm.optionId) {
        // Delete option
        const result = await VariantsOptionsApi.deleteOption(
          deleteConfirm.optionId
        );

        if (result?.success) {
          setNotification({
            isOpen: true,
            type: "success",
            message: "✅ Xoá tùy chọn thành công!",
          });
          handleCloseDeleteConfirm();
          // Reload data
          fetchVariants();
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            message: `❌ Error (${result?.errorCode || "500"}): ${
              result?.error || "Lỗi xoá tùy chọn"
            }`,
          });
        }
      }
    } catch (err) {
      console.error("Error deleting:", err);
      setNotification({
        isOpen: true,
        type: "error",
        message: "❌ Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch variants
  const fetchVariants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      // Use searchWithFilters to include both search term and filters
      response = await VariantsApi.searchWithFilters({
        name: searchTerm,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        available: filters.inStockOnly,
        manufacturers: undefined,
        categories: undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page,
        size: pageSize,
      });

      if (response && response.content) {
        let processedVariants = processVariants(response.content);
        // Note: Filters are already applied by API, but we can apply additional client-side filters if needed
        setVariants(processedVariants);
        setTotalItems(response.totalElements || 0);
      } else {
        setError("Không thể tải danh sách biến thể");
        setVariants([]);
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [page, pageSize, searchTerm, filters]);

  const handleSearch = () => {
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPage(0);
    }
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>📦 Danh sách Biến thể Sản phẩm</h1>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="success"
            sx={{ textTransform: "none" }}
            onClick={() => {
              // Navigate to create product screen
              window.location.href = "/admin/products/create";
            }}
          >
            + Thêm sản phẩm
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            {showFilters ? "Ẩn" : "Hiện"} Bộ lọc
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Notification Alert */}
      {notification.isOpen && (
        <Alert
          severity={notification.type === "success" ? "success" : "error"}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Main Layout: Filter Sidebar + Content */}
      <Box sx={{ display: "grid", gridTemplateColumns: showFilters ? "250px 1fr" : "1fr", gap: 3 }}>
        {/* Filter Sidebar */}
        {showFilters && (
          <Box
            sx={{
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
              height: "fit-content",
              position: "sticky",
              top: 20,
            }}
          >
            <Typography sx={{ fontWeight: "bold", mb: 2, fontSize: "16px" }}>
              🔍 Bộ Lọc
            </Typography>

            {/* Price Range */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
                Khoảng Giá (₫)
              </Typography>
              <TextField
                type="number"
                placeholder="Từ"
                size="small"
                fullWidth
                value={filters.minPrice || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                sx={{ mb: 1 }}
              />
              <TextField
                type="number"
                placeholder="Đến"
                size="small"
                fullWidth
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </Box>

            {/* Status Filter */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
                Trạng Thái
              </Typography>
              <Select
                fullWidth
                size="small"
                value={filters.status || "all"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value === "all" ? undefined : e.target.value,
                  })
                }
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="available">Có sẵn</MenuItem>
                <MenuItem value="unavailable">Không có sẵn</MenuItem>
              </Select>
            </Box>

            {/* In Stock Only */}
            <Box sx={{ mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={filters.inStockOnly || false}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        inStockOnly: e.target.checked || undefined,
                      })
                    }
                  />
                }
                label="Chỉ còn hàng"
              />
            </Box>

            {/* Sort By */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: "14px" }}>
                Sắp Xếp
              </Typography>
              <Select
                fullWidth
                size="small"
                value={filters.sortBy || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value || undefined,
                  })
                }
                sx={{ mb: 1 }}
              >
                <MenuItem value="">Không</MenuItem>
                <MenuItem value="name">Theo tên</MenuItem>
                <MenuItem value="price">Theo giá</MenuItem>
              </Select>

              <Select
                fullWidth
                size="small"
                value={filters.sortOrder || "asc"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortOrder: e.target.value || "asc",
                  })
                }
              >
                <MenuItem value="asc">Tăng dần</MenuItem>
                <MenuItem value="desc">Giảm dần</MenuItem>
              </Select>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleApplyFilters(filters)}
                sx={{ textTransform: "none" }}
              >
                Áp dụng
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                sx={{ textTransform: "none" }}
              >
                Xóa
              </Button>
            </Box>
          </Box>
        )}

        {/* Main Content */}
        <Box>
          {/* Filter Card */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={2}>
            {/* Search */}
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                placeholder="Tìm kiếm theo tên sản phẩm hoặc code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{ textTransform: "none", minWidth: 100 }}
              >
                Tìm kiếm
              </Button>
              {searchTerm && (
                <Button
                  variant="outlined"
                  onClick={handleClearSearch}
                  startIcon={<ClearIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Xoá
                </Button>
              )}
            </Box>

            {/* Page Size */}
            <Box display="flex" alignItems="center" gap={1}>
              <span>Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette.divider}`,
                  cursor: "pointer",
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span style={{ marginLeft: "auto", color: theme.palette.text.secondary }}>
                Tổng: {totalItems} biến thể
              </span>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Table */}
          {variants.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
              <Table>
                <TableHead
                  sx={{
                    bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ width: "40px" }}></TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Mã</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Tên biến thể</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                      Số Tuỳ chọn
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Chi tiết</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map((variant) => (
                    <Fragment key={variant.id}>
                      {/* Main Variant Row */}
                      <TableRow
                        sx={{
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "#2a2a2a"
                                : "#f9f9f9",
                          },
                        }}
                      >
                        <TableCell
                          onClick={() => toggleExpand(variant.id)}
                          sx={{ cursor: "pointer", textAlign: "center" }}
                        >
                          <IconButton size="small">
                            {expandedRows.has(variant.id) ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color:
                              theme.palette.mode === "dark"
                                ? "#00CFFF"
                                : "#1976d2",
                          }}
                        >
                          {variant.code || "-"}
                        </TableCell>
                        <TableCell>{variant.name || "-"}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${variant.options?.length || 0} Tuỳ chọn`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#666" }}>
                          Bấm ▼ để xem các tùy chọn
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEditVariant(variant)}
                            title="Chỉnh sửa biến thể"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteVariant(variant)}
                            title="Xoá biến thể"
                            sx={{ color: "error.main", ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Expand Row - Show all options for this product */}
                      <TableRow key={`expand-${variant.id}`}>
                        <TableCell colSpan={6} sx={{ p: 0, border: "none" }}>
                          <Collapse
                            in={expandedRows.has(variant.id)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ p: 2, bgcolor: "action.hover" }}>
                              <h4>Danh sách Options</h4>
                              {variant.options && variant.options.length > 0 ? (
                                <TableContainer component={Paper}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                          SKU
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                          Lựa chọn
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold" }}
                                          align="right"
                                        >
                                          Giá gốc
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold" }}
                                          align="right"
                                        >
                                          Giá bán
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold" }}
                                          align="center"
                                        >
                                          Kho
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold" }}
                                          align="center"
                                        >
                                          Trạng thái
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold" }}
                                          align="center"
                                        >
                                          Hành động
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {variant.options.map((option) => (
                                        <TableRow key={option.id}>
                                          <TableCell>
                                            {option.sku || "-"}
                                          </TableCell>
                                          <TableCell>
                                            {option.value || "-"}
                                          </TableCell>
                                          <TableCell align="right">
                                            {option.availability?.regularPrice
                                              ? formatCurrency(
                                                  option.availability
                                                    .regularPrice
                                                )
                                              : "-"}
                                          </TableCell>
                                          <TableCell
                                            align="right"
                                            sx={{ fontWeight: 600 }}
                                          >
                                            {option.availability?.salePrice
                                              ? formatCurrency(
                                                  option.availability.salePrice
                                                )
                                              : "-"}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip
                                              label={`${
                                                option.availability?.quantity ||
                                                0
                                              }`}
                                              color={
                                                (option.availability
                                                  ?.quantity || 0) > 0
                                                  ? "success"
                                                  : "error"
                                              }
                                              variant="outlined"
                                              size="small"
                                            />
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip
                                              label={
                                                option.availability
                                                  ?.productStatus
                                                  ? "Có sẵn"
                                                  : "Không có sẵn"
                                              }
                                              color={
                                                option.availability
                                                  ?.productStatus
                                                  ? "success"
                                                  : "warning"
                                              }
                                              size="small"
                                            />
                                          </TableCell>
                                          <TableCell align="center">
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleEditOption(
                                                  variant.id,
                                                  option
                                                )
                                              }
                                              title="Chỉnh sửa option"
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleDeleteOption(
                                                  variant.id,
                                                  option
                                                )
                                              }
                                              title="Xoá option"
                                              sx={{
                                                color: "error.main",
                                                ml: 1,
                                              }}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <p style={{ color: "#999" }}>
                                  Không có option nào
                                </p>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <CardContent>
                <h3>Không tìm thấy biến thể nào</h3>
                {searchTerm && (
                  <p>Thử tìm kiếm với từ khóa khác hoặc xoá bộ lọc.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editDialog.type === "variant"
            ? "Chỉnh sửa Variant Sản phẩm"
            : "Chỉnh sửa Option"}
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editDialog.type === "variant" ? (
              <>
                <TextField
                  label="Code"
                  fullWidth
                  value={editDialog.code || ""}
                  onChange={(e) =>
                    setEditDialog({ ...editDialog, code: e.target.value })
                  }
                  size="small"
                />
                <TextField
                  label="Tên Variant"
                  fullWidth
                  value={editDialog.name || ""}
                  onChange={(e) =>
                    setEditDialog({ ...editDialog, name: e.target.value })
                  }
                  size="small"
                  multiline
                  rows={2}
                />
              </>
            ) : (
              <>
                <TextField
                  label="SKU"
                  fullWidth
                  value={editDialog.sku || ""}
                  onChange={(e) =>
                    setEditDialog({ ...editDialog, sku: e.target.value })
                  }
                  size="small"
                  disabled
                />
                <TextField
                  label="Lựa chọn (Màu sắc, kích thước...)"
                  fullWidth
                  value={editDialog.value || ""}
                  onChange={(e) =>
                    setEditDialog({ ...editDialog, value: e.target.value })
                  }
                  size="small"
                />
                <TextField
                  label="Giá gốc"
                  fullWidth
                  type="number"
                  value={editDialog.regularPrice || ""}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      regularPrice: Number(e.target.value),
                    })
                  }
                  size="small"
                />
                <TextField
                  label="Giá bán"
                  fullWidth
                  type="number"
                  value={editDialog.salePrice || ""}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      salePrice: Number(e.target.value),
                    })
                  }
                  size="small"
                />
                <TextField
                  label="Kho"
                  fullWidth
                  type="number"
                  value={editDialog.quantity || ""}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      quantity: Number(e.target.value),
                    })
                  }
                  size="small"
                />
                <Box>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editDialog.productStatus || false}
                      onChange={(e) =>
                        setEditDialog({
                          ...editDialog,
                          productStatus: e.target.checked,
                        })
                      }
                    />
                    <span>Có sẵn</span>
                  </label>
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseEditDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={handleCloseDeleteConfirm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
          Xác nhận xoá
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Box>
            {deleteConfirm.type === "variant" ? (
              <p>
                Bạn có chắc chắn muốn xoá variant{" "}
                <strong>{deleteConfirm.variantName}</strong> không? Hành động
                này không thể hoàn tác.
              </p>
            ) : (
              <p>
                Bạn có chắc chắn muốn xoá option{" "}
                <strong>{deleteConfirm.optionName}</strong> không? Hành động này
                không thể hoàn tác.
              </p>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductVariantListScreen;
