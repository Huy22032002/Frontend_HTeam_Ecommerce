import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useCreateOrder } from "../../hooks/useCreateOrder";
import { useCustomerDeliveryAddresses } from "../../hooks/useCustomerDeliveryAddresses";
import CustomerListModal from "../../components/modals/CustomerListModal";
import ProductVariantListModal from "../../components/modals/ProductVariantListModal";
import type { ProductOption } from "../../models/products/ProductVariantOption";
import type { ProductVariants } from "../../models/products/ProductVariant";
import type { OrderItemDisplay } from "../../models/orders/CreateOrderRequest";
import { formatCurrency } from "../../utils/formatCurrency";
import { OrderApi } from "../../api/order/OrderApi";
import {
  VIETNAM_PROVINCES,
  getDistrictsByProvince,
} from "../../utils/vietnamAddresses";

const CreateOrderScreen: React.FC = () => {
  const navigate = useNavigate();
  const order = useCreateOrder();

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedItemForPromotion, setSelectedItemForPromotion] =
    useState<OrderItemDisplay | null>(null);
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch saved delivery addresses for selected customer
  const { deliveryAddresses, loading: loadingSavedAddresses } =
    useCustomerDeliveryAddresses(order.state.selectedCustomer?.id);

  // Address states
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState("");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<
    number | null
  >(null);

  // Get districts for selected province
  const availableDistricts = selectedProvince
    ? getDistrictsByProvince(selectedProvince)
    : [];

  // Handle selecting a saved delivery address
  const handleSelectSavedAddress = (address: (typeof deliveryAddresses)[0]) => {
    setSelectedSavedAddressId(address.id);

    // Set form data from saved address
    order.setReceiverPhoneNumber(address.phone);

    // Parse fullAddress
    const parts = address.fullAddress.split(",").map((p) => p.trim());

    if (parts.length >= 2) {
      const provinceName = parts[parts.length - 1];
      const districtName = parts.length >= 3 ? parts[parts.length - 2] : "";
      const street = parts
        .slice(0, parts.length - 2)
        .join(", ")
        .trim();

      // Find matching province
      const matchingProvince = VIETNAM_PROVINCES.find(
        (p) => p.name.toUpperCase() === provinceName.toUpperCase()
      );

      if (matchingProvince) {
        setSelectedProvince(matchingProvince.id);

        // Find matching district
        if (districtName) {
          const districts = getDistrictsByProvince(matchingProvince.id);
          const matchingDistrict = districts.find(
            (d) => d.name.toUpperCase() === districtName.toUpperCase()
          );

          if (matchingDistrict) {
            setSelectedDistrict(matchingDistrict.id);
          } else {
            setSelectedDistrict("");
          }
        }
      }

      setStreetAddress(street);
    }
  };

  // Handle chọn khách hàng
  const handleSelectCustomer = (customer: any) => {
    order.setCustomer(customer);
  };

  // Handle chọn sản phẩm
  const handleSelectProduct = async (
    option: ProductOption,
    variant: ProductVariants
  ) => {
    const newItem: OrderItemDisplay = {
      variantId: variant.id,
      productVariantOptionId: option.id || 0,
      sku: option.sku,
      quantity: 1,
      price: option.availability?.salePrice || 0,
      productName: "", // Sẽ được cập nhật từ API
      variantName: variant.name,
      optionValue: option.value,
    };

    order.addItem(newItem);
  };

  // Handle mở modal promotion
  const handleOpenPromotionModal = async (item: OrderItemDisplay) => {
    setSelectedItemForPromotion(item);
    setShowPromotionModal(true);
    setLoadingPromotions(true);

    try {
      const promotions = await order.fetchPromotionsForSku(item.sku);
      setAvailablePromotions(promotions || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Handle chọn promotion
  const handleSelectPromotion = (promotion: any) => {
    if (selectedItemForPromotion) {
      const discountAmount = promotion.discountValue || 0;
      order.updateItemPromotion(
        selectedItemForPromotion.productVariantOptionId,
        promotion.id,
        discountAmount,
        promotion.name
      );
    }
    setShowPromotionModal(false);
    setSelectedItemForPromotion(null);
  };

  // Handle submit order
  const handleSubmitOrder = async () => {
    // Check if any item has missing price
    const itemsWithoutPrice = order.state.selectedItems.filter(
      (item) => !item.price || item.price <= 0
    );
    if (itemsWithoutPrice.length > 0) {
      order.setError("❌ Có sản phẩm không có giá. Vui lòng kiểm tra lại!");
      return;
    }

    // Build full address from province, district, and street
    const provinceName =
      VIETNAM_PROVINCES.find((p) => p.id === selectedProvince)?.name || "";
    const districtName =
      availableDistricts.find((d) => d.id === selectedDistrict)?.name || "";

    const fullAddress = [streetAddress, districtName, provinceName]
      .filter(Boolean)
      .join(", ");

    if (!fullAddress.trim()) {
      order.setError("❌ Vui lòng nhập đầy đủ địa chỉ giao hàng");
      return;
    }

    // Update shipping address before building request
    order.setShippingAddress(fullAddress);

    const orderRequest = order.buildOrderRequest();
    if (!orderRequest) {
      return;
    }

    setSubmitLoading(true);
    try {
      await OrderApi.create(orderRequest as any);
      alert("✅ Tạo đơn hàng thành công!");
      order.reset();
      navigate("/admin/orders");
    } catch (error: any) {
      console.error("Error creating order:", error);
      order.setError(
        error?.response?.data?.message || "❌ Lỗi khi tạo đơn hàng"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 4,
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            📋 Tạo Đơn Hàng Mới
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
            Tạo và quản lý đơn hàng mới cho khách hàng
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ textTransform: "none", px: 3 }}
        >
          ← Quay Lại
        </Button>
      </Box>

      {/* Error Alert */}
      {order.state.error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 1 }}
          onClose={() => order.setError(null)}
        >
          {order.state.error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {/* Left: Full Width Form Sections */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Customer Selection */}
          <Card
            sx={{
              mb: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <CardHeader
              title="👥 Thông Tin Khách Hàng"
              sx={{
                backgroundColor: "#f5f7fa",
                borderBottom: "2px solid #e8ebf0",
              }}
            />
            <CardContent sx={{ pt: 2.5, pb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  {order.state.selectedCustomer ? (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "700", color: "#1976d2", mb: 1 }}
                      >
                        {order.state.selectedCustomer.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666", mt: 0.5, fontSize: "0.95rem" }}
                      >
                        📧 {order.state.selectedCustomer.emailAddress}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        padding: "16px 20px",
                        backgroundColor: "#fff3e0",
                        borderRadius: 1,
                        border: "1px solid #ffe0b2",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#e65100", fontWeight: "500" }}
                      >
                        ⚠️ Chưa chọn khách hàng
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setShowCustomerModal(true)}
                  sx={{ whiteSpace: "nowrap", textTransform: "none", px: 3 }}
                >
                  🔍 Chọn Khách Hàng
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card
            sx={{
              mb: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
              minHeight: 400,
            }}
          >
            <CardHeader
              title="📦 Sản Phẩm"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowProductModal(true)}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  + Thêm Sản Phẩm
                </Button>
              }
              sx={{
                backgroundColor: "#f5f7fa",
                borderBottom: "2px solid #e8ebf0",
              }}
            />
            <CardContent sx={{ pt: 2.5, pb: 2 }}>
              {order.state.selectedItems.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#f0f2f5" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "600", color: "#1976d2" }}>
                          Sản Phẩm
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "600", color: "#1976d2" }}
                        >
                          Giá
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "600", color: "#1976d2" }}
                        >
                          Số Lượng
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "600", color: "#1976d2" }}
                        >
                          Khuyến Mãi
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "600", color: "#1976d2" }}
                        >
                          Thành Tiền
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "600", color: "#1976d2" }}
                        >
                          Hành Động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.state.selectedItems.map((item) => {
                        const itemTotal =
                          item.price * item.quantity -
                          (item.discountAmount
                            ? item.discountAmount * item.quantity
                            : 0);
                        return (
                          <TableRow
                            key={item.productVariantOptionId}
                            sx={{
                              "&:hover": { backgroundColor: "#f9f9f9" },
                              borderBottom: "1px solid #e0e0e0",
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "600", color: "#1976d2" }}
                                >
                                  {item.variantName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666" }}
                                >
                                  {item.optionValue} (SKU: {item.sku})
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) =>
                                  order.updateItemQuantity(
                                    item.productVariantOptionId,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                inputProps={{ min: 1 }}
                                sx={{ width: 70 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                {item.promotionName ? (
                                  <Typography variant="caption">
                                    {item.promotionName}
                                  </Typography>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#999" }}
                                  >
                                    Không
                                  </Typography>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleOpenPromotionModal(item)}
                                >
                                  Chọn
                                </Button>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                {formatCurrency(itemTotal)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() =>
                                  order.removeItem(item.productVariantOptionId)
                                }
                              >
                                Xoá
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    backgroundColor: "#fafafa",
                    borderRadius: 1,
                    border: "2px dashed #e0e0e0",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    📭 Chưa có sản phẩm nào
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card
            sx={{
              mb: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
              minHeight: 250,
            }}
          >
            <CardHeader
              title="🏠 Địa Chỉ Giao Hàng"
              sx={{
                backgroundColor: "#f5f7fa",
                borderBottom: "2px solid #e8ebf0",
              }}
            />
            <CardContent sx={{ pt: 2.5, pb: 2 }}>
              {/* Saved Delivery Addresses Section */}
              {deliveryAddresses.length > 0 && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "#f0f8ff",
                    borderRadius: 1,
                    border: "1px solid #b3d9ff",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    📌 Chọn một địa chỉ đã lưu của khách hàng:
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {deliveryAddresses.map((addr) => (
                      <Paper
                        key={addr.id}
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          border:
                            selectedSavedAddressId === addr.id
                              ? "2px solid #1976d2"
                              : "1px solid #ddd",
                          borderRadius: 1,
                          transition: "all 0.3s",
                          backgroundColor:
                            selectedSavedAddressId === addr.id
                              ? "#e3f2fd"
                              : "transparent",
                          "&:hover": {
                            bgcolor: "#e3f2fd",
                            borderColor: "#1976d2",
                            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.1)",
                          },
                        }}
                        onClick={() => handleSelectSavedAddress(addr)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                {addr.recipientName}
                              </Typography>
                              {addr.isDefault && (
                                <Chip
                                  label="Mặc định"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              📞 {addr.phone}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, color: "#555" }}
                            >
                              {addr.fullAddress}
                            </Typography>
                          </Box>
                          {selectedSavedAddressId === addr.id && (
                            <Chip
                              label="✓ Đã chọn"
                              size="small"
                              color="success"
                              variant="filled"
                              sx={{ ml: 1, flexShrink: 0 }}
                            />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="textSecondary">
                    💡 Nhấp vào một địa chỉ để sử dụng hoặc điền thông tin thủ
                    công bên dưới
                  </Typography>
                </Box>
              )}

              {loadingSavedAddresses && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <CircularProgress size={20} />
                  <Typography variant="caption">
                    Đang tải danh sách địa chỉ đã lưu...
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Province & District Row */}
                <Box
                  sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}
                >
                  {/* Province Selection */}
                  <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: "#666" }}>
                      Tỉnh/Thành Phố
                    </InputLabel>
                    <Select
                      label="Tỉnh/Thành Phố"
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value as string);
                        setSelectedDistrict(""); // Reset district when province changes
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#1976d2",
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Chọn Tỉnh/Thành Phố --</em>
                      </MenuItem>
                      {VIETNAM_PROVINCES.map((province) => (
                        <MenuItem key={province.id} value={province.id}>
                          {province.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* District Selection */}
                  <FormControl
                    fullWidth
                    size="small"
                    disabled={!selectedProvince}
                    sx={{ flex: 1 }}
                  >
                    <InputLabel>Quận/Huyện</InputLabel>
                    <Select
                      label="Quận/Huyện"
                      value={selectedDistrict}
                      onChange={(e) =>
                        setSelectedDistrict(e.target.value as string)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": {
                            borderColor: "#1976d2",
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Chọn Quận/Huyện --</em>
                      </MenuItem>
                      {availableDistricts.map((district) => (
                        <MenuItem key={district.id} value={district.id}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Street Address */}
                <TextField
                  fullWidth
                  size="small"
                  label="Số nhà, đường phố"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="VD: 123 Đường ABC"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />

                {/* Receiver Phone Number */}
                <TextField
                  fullWidth
                  size="small"
                  label="Số điện thoại người nhận"
                  value={order.state.receiverPhoneNumber}
                  onChange={(e) => order.setReceiverPhoneNumber(e.target.value)}
                  placeholder="VD: 0987654321"
                  type="tel"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />

                {/* Display full address preview */}
                {selectedProvince && selectedDistrict && (
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: "#e3f2fd",
                      borderRadius: 1,
                      border: "1px solid #90caf9",
                      boxShadow: "0 2px 4px rgba(25, 118, 210, 0.1)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#1565c0", fontWeight: "600" }}
                    >
                      ✓ Địa chỉ giao hàng:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, color: "#1565c0", fontWeight: "500" }}
                    >
                      {streetAddress ? `${streetAddress}, ` : ""}
                      {
                        VIETNAM_PROVINCES.find((p) => p.id === selectedProvince)
                          ?.name
                      }
                      ,
                      {
                        availableDistricts.find(
                          (d) => d.id === selectedDistrict
                        )?.name
                      }
                    </Typography>
                  </Paper>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card
            sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 2 }}
          >
            <CardHeader
              title="📝 Ghi Chú Đơn Hàng"
              sx={{
                backgroundColor: "#f5f7fa",
                borderBottom: "2px solid #e8ebf0",
              }}
            />
            <CardContent sx={{ pt: 2.5, pb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Ghi chú đơn hàng"
                value={order.state.notes}
                onChange={(e) => order.setNotes(e.target.value)}
                placeholder="Nhập ghi chú cho đơn hàng..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Right: Payment & Summary */}
        <Box sx={{ width: 350, flexShrink: 0, position: "sticky", top: 80 }}>
          <Card
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <CardHeader
              title="💼 Tóm Tắt Đơn Hàng"
              sx={{ backgroundColor: "#1976d2", color: "white" }}
            />
            <CardContent sx={{ pt: 2.5, pb: 2 }}>
              {/* Payment Method */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Chọn phương thức</InputLabel>
                <Select
                  value={order.state.paymentMethod}
                  label="Chọn phương thức"
                  onChange={(e) =>
                    order.setPaymentMethod(e.target.value as "CASH" | "MOMO")
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                >
                  <MenuItem value="CASH">💵 Tiền Mặt</MenuItem>
                  <MenuItem value="MOMO">📱 Ví Điện Tử</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 3 }} />

              {/* Order Summary */}
              <Typography
                variant="body2"
                sx={{ fontWeight: "600", mb: 2, color: "#1976d2" }}
              >
                📊 Chi Tiết Đơn Hàng
              </Typography>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="body2" sx={{ color: "#666" }}>
                  📦 Số lượng:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "600", color: "#1976d2" }}
                >
                  {order.state.selectedItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}{" "}
                  cái
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Giá gốc:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "600" }}>
                  {formatCurrency(
                    order.state.selectedItems.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  pb: 2,
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Giảm giá:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "600", color: "#f44336" }}
                >
                  -
                  {formatCurrency(
                    order.state.selectedItems.reduce(
                      (sum, item) =>
                        sum +
                        (item.discountAmount
                          ? item.discountAmount * item.quantity
                          : 0),
                      0
                    )
                  )}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  backgroundColor: "#e3f2fd",
                  borderRadius: 1,
                  border: "2px solid #1976d2",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "600", color: "#1565c0" }}
                >
                  💰 TỔNG:
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#1565c0" }}
                >
                  {formatCurrency(order.state.totalAmount)}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    order.reset();
                    navigate(-1);
                  }}
                  sx={{
                    textTransform: "none",
                    borderColor: "#e0e0e0",
                    color: "#666",
                    py: 1.2,
                    "&:hover": {
                      borderColor: "#999",
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  ❌ Hủy
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmitOrder}
                  disabled={
                    submitLoading ||
                    order.state.selectedItems.length === 0 ||
                    !order.state.selectedCustomer
                  }
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#1976d2",
                    fontWeight: "600",
                    py: 1.2,
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                    "&:disabled": {
                      backgroundColor: "#ccc",
                    },
                  }}
                >
                  {submitLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: "white" }} />
                      Đang xử lý...
                    </Box>
                  ) : (
                    "✅ Tạo Đơn Hàng"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Modals */}
      <CustomerListModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelect={handleSelectCustomer}
        selectedCustomer={order.state.selectedCustomer}
      />

      <ProductVariantListModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelectOption={handleSelectProduct}
      />

      {/* Promotion Modal */}
      <Dialog
        open={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chọn Khuyến Mãi cho {selectedItemForPromotion?.optionValue}
        </DialogTitle>
        <DialogContent>
          {loadingPromotions ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {availablePromotions.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleSelectPromotion(null)}
                    fullWidth
                  >
                    Không Áp Dụng Khuyến Mãi
                  </Button>
                  {availablePromotions.map((promo) => (
                    <Paper
                      key={promo.id}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: "1px solid #ddd",
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                      onClick={() => handleSelectPromotion(promo)}
                    >
                      <Typography sx={{ fontWeight: "bold" }}>
                        {promo.name}
                      </Typography>
                      <Typography variant="body2">
                        Giảm: {formatCurrency(promo.discountValue || 0)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        {promo.description}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "#999", textAlign: "center", py: 3 }}
                >
                  Không có khuyến mãi nào cho sản phẩm này
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CreateOrderScreen;
