import { useContext, useEffect, useState } from "react";

import { ColorModeContext, tokens } from "../theme/theme";

import {
  Box,
  Button,
  IconButton,
  Menu,
  Typography,
  useTheme,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";

import { useNavigate } from "react-router-dom";

//customer api
import { CustomerApi } from "../api/customer/CustomerApi";
//redux
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { login, logout } from "../store/customerSlice";
import CartPopup from "./cart/CartPopup";
import { CartApi } from "../api/cart/cartApi";
import { setCart } from "../store/cartSlice";

const Topbar: React.FC = () => {
  //redux
  const dispatch = useDispatch();

  //cart from reduux
  const cart = useSelector((state: RootState) => state.cart.cart);

  const subtotal =
    cart?.items?.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0
    ) || 0;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  //navigate
  const navigate = useNavigate();

  //customer info
  const user = useSelector((state: RootState) => state.customerAuth.customer);

  const getCustomerById = async () => {
    const id = localStorage.getItem("id");
    if (id != null) {
      const data = await CustomerApi.getById(id);
      //save to Redux toolkit
      if (data) {
        dispatch(login(data));
      }
    }
  };

  const [openCartPopup, setOpenCartPopup] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  //get or create Cart
  const getCartByCustomerId = async () => {
    if (user?.id) {
      const data = await CartApi.getOrCreateByCustomerId(user.id);
      console.log("cart: ", data);
      if (data) {
        dispatch(setCart(data)); // lưu cart vào redux
      }
    }
  };

  useEffect(() => {
    getCustomerById();
  }, []);

  useEffect(() => {
    // Khi user thay đổi (sau khi Redux login), mới gọi API cart
    if (user?.id) {
      getCartByCustomerId();
    }
  }, [user]);

  return (
    <Box
      bgcolor={colors.greenAccent[900]}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      px={{ xs: 2, sm: 8, md: 16, lg: 30 }}
    >
      {/* left box */}
      <Box display="flex" gap={2}>
        {/* logo */}
        <Box
          component="img"
          src="/src/assets/logo1.png"
          alt="Logo"
          sx={{
            height: 52,
            borderRadius: "26px",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        />

        {/* SEARCH BAR */}
        <Box
          sx={{ width: 300 }}
          display="flex"
          bgcolor={colors.primary[400]}
          borderRadius="20px"
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchInput.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchInput)}`);
            }
          }}
        >
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {/* right box */}
      {/*  ICON */}
      <Box display="flex" gap={2}>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>

        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* Nếu có user thì hiện tên, nếu không thì hiện nút đăng nhập */}
        {user ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              onClick={() => navigate("/customer/account-info")}
              variant="body1"
              fontWeight="bold"
              sx={{
                color: colors.primary[100],
                cursor: "pointer",
                "&:hover": {
                  background: colors.blueAccent[900],
                  borderRadius: 4,
                  p: 2,
                  boxSizing: "border-box",
                },
              }}
            >
              {user.name || user.username}
            </Typography>
          </Box>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            variant="contained"
            startIcon={<PersonOutlinedIcon />}
            sx={{
              bgcolor: colors.primary[900],
              color: colors.primary[100],
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: "bold",
              px: 2.5,
              py: 1,
              boxShadow: "none",
              "&:hover": {
                bgcolor: colors.blueAccent[800],
                boxShadow: "none",
              },
            }}
          >
            Đăng nhập
          </Button>
        )}

        {/* cart  */}
        <Button
          variant="contained"
          startIcon={<ShoppingBagOutlinedIcon />}
          sx={{
            position: "relative", // để số lượng dùng absolute
            bgcolor: colors.blueAccent[200],
            color: colors.primary[900],
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "none",
            px: 3,
            py: 1,
            "&:hover": {
              bgcolor: colors.blueAccent[400],
            },
          }}
          onClick={() => setOpenCartPopup(true)}
        >
          {/* Số lượng nhỏ ở góc phải trên */}
          <Box
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              bgcolor: colors.primary[700],
              color: "#fff",
              borderRadius: "50%",
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.625rem",
              fontWeight: "bold",
            }}
          >
            {cart?.items?.length || 0}
          </Box>

          {/* Nội dung nút: tổng tiền */}
          <Typography fontWeight="bold" fontSize="1rem">
            {subtotal?.toLocaleString()}₫
          </Typography>
        </Button>

        {/* Popup */}
        <CartPopup
          open={openCartPopup}
          cartItems={cart?.items || []}
          onClose={() => setOpenCartPopup(false)}
        />
        <Menu
          anchorEl={null}
          open={false}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MuiMenuItem>
            <IconButton
              sx={{ display: "flex", flexDirection: "row", gap: "4px" }}
            >
              <LogoutIcon />
              <Typography>Log out</Typography>
            </IconButton>
          </MuiMenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
