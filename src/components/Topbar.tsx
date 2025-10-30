import { useContext, useEffect, useState } from "react";

import { ColorModeContext, tokens } from "../theme/theme";

import {
  Box,
  Button,
  IconButton,
  Menu,
  Typography,
  useTheme,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";

import { MenuItem } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";

//user
import { CustomerApi } from "../api/customer/CustomerApi";
import type { ReadableCustomer } from "../models/customer/ReadableCustomer";

const Topbar: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  //navigate
  const navigate = useNavigate();

  //customer info
  const [user, setUser] = useState<ReadableCustomer | null>(null);

  const getCustomerById = async () => {
    const id = localStorage.getItem("id");
    if (id != null) {
      const data = await CustomerApi.getById(id);
      console.log(data);

      setUser(data);
    }
  };

  useEffect(() => {
    getCustomerById();
  }, []);

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
        >
          <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
          <IconButton type="button" sx={{ p: 1 }}>
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
              variant="body1"
              fontWeight="bold"
              sx={{
                color: colors.primary[100],
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {user.name}
            </Typography>

            <IconButton
              onClick={() => {
                localStorage.clear();
                setUser(null);
                navigate("/login");
              }}
            >
              <LogoutIcon sx={{ color: colors.primary[100] }} />
            </IconButton>
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
            bgcolor: colors.blueAccent[200],
            color: colors.primary[900],
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "none",
            "&:hover": {
              bgcolor: colors.blueAccent[400],
            },
          }}
        >
          {" "}
          <Typography component="span" fontWeight="bold">
            0 ₫
          </Typography>
        </Button>

        <Menu
          // anchorEl={anchorEl}
          open={false}
          // onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem>
            <IconButton
              sx={{ display: "flex", flexDirection: "row", gap: "4px" }}
            >
              <LogoutIcon />
              <Typography>Log out</Typography>
            </IconButton>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
