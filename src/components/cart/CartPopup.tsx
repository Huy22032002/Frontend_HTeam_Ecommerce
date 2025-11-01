import React from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Paper,
  colors,
  useTheme,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { CartItem } from "../../models/cart/CartItem";
import { formatCurrency } from "../../utils/formatCurrency";
import { tokens } from "../../theme/theme";
import { setCart } from "../../store/cartSlice";
import { CartApi } from "../../api/cart/cartApi";
// import { updateCartItemQuantity, removeCartItem } from "../../store/cartSlice"; // giả sử bạn có các action này

interface CartPopupProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const CartPopup: React.FC<CartPopupProps> = ({ open, onClose, cartItems }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state: RootState) => state.cart.cart);

  if (!open) return null;

  const hasItems = cartItems.length > 0;

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

  const handleClickOption = async (optionId: number | undefined) => {
    if (optionId) {
      navigate(`/product/${optionId}`);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        position: "absolute",
        top: "68px",
        right: "80px",
        width: 400,
        p: 2,
        borderRadius: 2,
        zIndex: 1000,
        background: "linear-gradient(180deg, #ffffff, #f8fbff)",
        border: "1px solid #e3e8ef",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography fontWeight={700} fontSize={20} variant="h6">
          Giỏ hàng ({cartItems.length})
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      {!hasItems ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={150}
        >
          <ShoppingBagOutlinedIcon
            sx={{ fontSize: 50, color: "primary.main" }}
          />
          <Typography variant="subtitle1" mt={1}>
            Giỏ hàng trống
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy thoải mái lựa chọn sản phẩm bạn nhé
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {cartItems.map((item) => (
            <Box
              key={item.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                borderBottom: "1px solid #e0e0e0",
                pb: 1,
                mb: 1,
              }}
              onClick={() => handleClickOption(item.id)}
            >
              {/* Hình + Tên + Giá */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flex={1}
                p={1}
              >
                {item.images && item.images.length > 0 ? (
                  <Box
                    component="img"
                    src={item.images[0].productImageUrl}
                    alt={item.productName}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      border: "1px solid #ddd",
                      bgcolor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ShoppingBagOutlinedIcon fontSize="small" />
                  </Box>
                )}

                <Box>
                  <Typography fontWeight="500">{item.productName}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.redAccent[400], fontWeight: "bold" }}
                  >
                    {formatCurrency(item.currentPrice)}
                  </Typography>
                </Box>
              </Stack>

              {/* Điều chỉnh số lượng */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(item, "dec")}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Typography width={16} textAlign="center" fontWeight={600}>
                  {item.quantity}
                </Typography>

                <IconButton
                  onClick={() => handleQuantityChange(item, "inc")}
                  size="small"
                >
                  <AddIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() => handleRemove(item)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              navigate("/cart");
              onClose();
            }}
          >
            Xem giỏ hàng
          </Button>
        </Stack>
      )}
    </Paper>
  );
};

export default CartPopup;
