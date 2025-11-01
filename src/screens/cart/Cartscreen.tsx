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
import { setCart } from "../../store/cartSlice";
import { CartApi } from "../../api/cart/cartApi";

const CartScreen: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart.cart);

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
  const subtotal =
    cart?.items?.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0
    ) || 0;

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
                  <Stack
                    key={item.id}
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
            <Stack direction="row" justifyContent="space-between">
              <Typography>Tạm tính</Typography>
              <Typography>{subtotal.toLocaleString()}₫</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography fontWeight={600}>Tổng cộng</Typography>
              <Typography fontWeight={600}>
                {subtotal.toLocaleString()}₫
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
      </Container>
    </Box>
  );
};

export default CartScreen;
