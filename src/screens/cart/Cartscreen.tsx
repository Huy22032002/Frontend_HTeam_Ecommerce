import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton,
  Container,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme/theme";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import type { CartItem } from "../../models/cart/CartItem";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "../../utils/formatCurrency";
import { setCart, setItemPromotion, removeItemPromotion } from "../../store/cartSlice";
import { CartApi } from "../../api/cart/cartApi";
import { PromotionApi } from "../../api/promotion/PromotionApi";

const CartScreen: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const itemPromotionsRedux = useSelector((state: RootState) => state.cart.itemPromotions);

  const [promotionLoading, setPromotionLoading] = React.useState<boolean>(false);
  // Use Redux for itemPromotions instead of local state
  const itemPromotions = new Map(Object.entries(itemPromotionsRedux).map(([k, v]) => [Number(k), v]));
  // For dropdown menu - track which item's menu is open
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null);
  const [availablePromotions, setAvailablePromotions] = React.useState<any[]>([]);

  const handleQuantityChange = async (item: CartItem, type: "inc" | "dec") => {
    if (!cart?.cartCode) return;

    const res = await CartApi.updateCartItemQuantity(
      cart.cartCode,
      item.id!,
      type
    );
    if (res) {
      dispatch(setCart(res)); // cập nhật lại cart vào redux
    } else {
      console.error("Update quantity failed");
    }
  };

  const handleRemove = async (item: CartItem) => {
    if (!cart?.cartCode) return;

    const res = await CartApi.deleteCartItem(cart.cartCode, item.id!);
    if (res) {
      dispatch(setCart(res)); // cập nhật lại cart trong redux
    } else {
      console.error("Delete cart item failed");
    }
  };

  // Fetch promotions for a specific item
  const handleApplyPromotionForItem = async (itemId: number, itemSku: string) => {
    setPromotionLoading(true);
    try {
      const response = await PromotionApi.getByProductSku(itemSku);
      if (response.data) {
        const promotions = Array.isArray(response.data) ? response.data : [response.data];
        setAvailablePromotions(promotions);
        setSelectedItemId(itemId);
      }
    } catch (error) {
      console.error("Error fetching promotion:", error);
      setAvailablePromotions([]);
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleOpenPromotionMenu = (event: React.MouseEvent<HTMLButtonElement>, itemId: number, itemSku: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
    handleApplyPromotionForItem(itemId, itemSku);
  };

  const handleClosePromotionMenu = () => {
    setAnchorEl(null);
    setSelectedItemId(null);
    setAvailablePromotions([]);
  };

  const handleSelectPromotion = (promotion: any) => {
    if (selectedItemId !== null) {
      dispatch(setItemPromotion({ itemId: selectedItemId, promotion }));
    }
    handleClosePromotionMenu();
  };

  const handleRemovePromotionForItem = (itemId: number) => {
    dispatch(removeItemPromotion({ itemId }));
  };
  const subtotal =
    cart?.items?.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0
    ) || 0;

  // Calculate discount for all items
  const calculateTotalDiscount = () => {
    let totalDiscount = 0;
    if (cart?.items) {
      cart.items.forEach((item) => {
        const promotion = itemPromotions.get(item.id!);
        if (promotion) {
          const itemTotal = item.currentPrice * item.quantity;
          if (promotion.discountPercentage) {
            totalDiscount += (itemTotal * promotion.discountPercentage) / 100;
          } else if (promotion.discountAmount) {
            totalDiscount += promotion.discountAmount;
          }
        }
      });
    }
    return totalDiscount;
  };

  const discount = calculateTotalDiscount();

  return (
    <Box
      sx={{
        px: 6,
        bgcolor: colors.greenAccent[700],
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={6}
          alignItems="flex-start"
        >
          {/* Left: Cart Items */}
          <Box
            sx={{
              flex: 1,
              borderRadius: 2,
              border: "1px solid #eee",
              p: 3,
              bgcolor: "#fff",
            }}
          >
            <Typography variant="h5" fontWeight={600} mb={2}>
              Giỏ hàng ({cart?.items?.length || 0})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {cart?.items?.length ? (
              <Stack spacing={2}>
                {cart.items.map((item) => (
                  <Stack key={item.id} spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ borderBottom: "1px solid #eee", pb: 2 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                        {item.images && item.images.length > 0 ? (
                          <Box
                            component="img"
                            src={item.images[0].productImageUrl}
                            alt={item.productName}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 1,
                              border: "1px solid #ddd",
                              bgcolor: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            🛍️
                          </Box>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1">
                            {item.productName}
                          </Typography>
                          <Typography variant="body2" color="gray">
                            SKU: {item.sku}
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color="#FF6B6B" mt={1}>
                            {formatCurrency(item.currentPrice)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => handleQuantityChange(item, "dec")}
                          size="small"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          sx={{ width: 50 }}
                          inputProps={{
                            style: { textAlign: "center" },
                            readOnly: true,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item, "inc")}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(item)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Promotion section for this item */}
                    {itemPromotions.get(item.id!) ? (
                      <Box sx={{ bgcolor: "#e8f5e9", p: 1.5, borderRadius: 1, border: "1px solid #4caf50", mt: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="#2e7d32">
                          ✓ {itemPromotions.get(item.id!).code}
                        </Typography>
                        <Typography variant="caption" display="block" color="#558b2f" sx={{ mt: 0.5 }}>
                          {itemPromotions.get(item.id!).description}
                        </Typography>
                        {itemPromotions.get(item.id!)?.discountPercentage && (
                          <Typography variant="caption" display="block" color="#558b2f" fontWeight={600}>
                            Giảm {itemPromotions.get(item.id!).discountPercentage}%
                          </Typography>
                        )}
                        {itemPromotions.get(item.id!)?.discountAmount && (
                          <Typography variant="caption" display="block" color="#558b2f" fontWeight={600}>
                            Giảm {formatCurrency(itemPromotions.get(item.id!).discountAmount)}
                          </Typography>
                        )}
                        <Stack direction="row" gap={1} mt={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemovePromotionForItem(item.id!)}
                            sx={{ flex: 1 }}
                          >
                            Xóa
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={(e) => handleOpenPromotionMenu(e, item.id!, item.sku)}
                            sx={{ flex: 1 }}
                          >
                            Đổi
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => handleOpenPromotionMenu(e, item.id!, item.sku)}
                        disabled={promotionLoading}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.8rem",
                          mt: 1,
                          alignSelf: "flex-start",
                        }}
                      >
                        + Thêm khuyến mãi
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body1" color="gray" mt={2}>
                Giỏ hàng trống. Hãy thêm sản phẩm bạn nhé!
              </Typography>
            )}
          </Box>

          {/* Right: Cart Summary */}
          <Box
            sx={{
              width: 280,
              borderRadius: 2,
              border: "1px solid #eee",
              p: 3,
              bgcolor: "#fff",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Tóm tắt đơn hàng
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Price Calculation */}
            <Stack direction="row" justifyContent="space-between">
              <Typography>Tạm tính</Typography>
              <Typography>{subtotal.toLocaleString()}₫</Typography>
            </Stack>
            {discount > 0 && (
              <Stack direction="row" justifyContent="space-between" mt={1} sx={{ color: "#d32f2f" }}>
                <Typography>Giảm giá</Typography>
                <Typography>-{discount.toLocaleString()}₫</Typography>
              </Stack>
            )}
            <Stack
              direction="row"
              justifyContent="space-between"
              mt={2}
              sx={{ pt: 1, borderTop: "2px solid #eee" }}
            >
              <Typography fontWeight={600}>Tổng cộng</Typography>
              <Typography fontWeight={600} color={discount > 0 ? "#d32f2f" : "inherit"}>
                {(subtotal - discount).toLocaleString()}₫
              </Typography>
            </Stack>
            <Button
              fullWidth
              variant="contained"
              disabled={!cart?.items?.length}
              onClick={() => {
                navigate("/checkout");
              }}
              sx={{
                mt: 3,
                bgcolor: "#00CFFF",
                textTransform: "none",
                borderRadius: 5,
                "&:disabled": {
                  bgcolor: "#ccc",
                },
              }}
            >
              Đặt hàng
            </Button>
          </Box>
        </Stack>

        {/* Promotion Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClosePromotionMenu}
          PaperProps={{
            sx: {
              maxHeight: 300,
              width: 350,
            },
          }}
        >
          {promotionLoading ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">Đang tải khuyến mãi...</Typography>
            </MenuItem>
          ) : availablePromotions.length > 0 ? (
            availablePromotions.map((promotion) => (
              <MenuItem
                key={promotion.id}
                onClick={() => handleSelectPromotion(promotion)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: "1px solid #eee",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {promotion.code}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {promotion.description}
                  </Typography>
                  <Stack direction="row" gap={2} mt={0.5}>
                    {promotion.discountPercentage && (
                      <Typography variant="caption" sx={{ color: "#d32f2f", fontWeight: 600 }}>
                        Giảm {promotion.discountPercentage}%
                      </Typography>
                    )}
                    {promotion.discountAmount && (
                      <Typography variant="caption" sx={{ color: "#d32f2f", fontWeight: 600 }}>
                        Giảm {formatCurrency(promotion.discountAmount)}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">
                ℹ️ Không có khuyến mãi nào cho sản phẩm này
              </Typography>
            </MenuItem>
          )}
        </Menu>
      </Container>
    </Box>
  );
};

export default CartScreen;
