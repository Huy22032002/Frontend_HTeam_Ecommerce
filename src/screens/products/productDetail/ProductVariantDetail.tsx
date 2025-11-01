import {
  Box,
  Button,
  CardMedia,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect } from "react";
import useVariantDetail from "./ProductVariantDetail.hook";
import { useParams } from "react-router-dom";
import { tokens } from "../../../theme/theme";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

const ProductVariantDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  //get cart from redux
  const cart = useSelector((state: RootState) => state.cart);

  const { variantId } = useParams();

  const {
    variant,
    getProductVariant,

    currentOption,
    setCurrentOption,

    //cart
    addOptionsToCart,
  } = useVariantDetail();

  useEffect(() => {
    if (variantId) getProductVariant(Number(variantId));
  }, [variantId]);

  return (
    <Box sx={{ px: 20, bgcolor: colors.greenAccent[700] }}>
      <Grid container spacing={4} py={4}>
        {/* --- LEFT: IMAGE GALLERY --- */}
        <Grid bgcolor={colors.primary[400]} item xs={12} md={6}>
          <Box>
            {/* Ảnh chính */}
            <CardMedia
              component="img"
              // src={selectedOption?.images?.[0] ?? "/src/assets/laptop.png"}
              src={"/src/assets/laptop.png"}
              alt={"hinhanh"}
              sx={{
                width: 800,
                borderRadius: 2,
                boxShadow: 3,
                mb: 2,
                p: 16,
              }}
            />

            {/* Danh sách ảnh nhỏ */}
            <Stack
              alignItems={"center"}
              justifyContent={"space-between"}
              direction="row"
              spacing={1}
            >
              {(currentOption?.images && currentOption.images.length > 0
                ? currentOption.images
                : Array(5).fill("/src/assets/laptop.png")
              ).map((img: string, i: number) => (
                <CardMedia
                  key={i}
                  component="img"
                  src={img}
                  alt={`thumb-${i}`}
                  sx={{
                    height: 80,
                    objectFit: "contain",
                    p: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": { border: `2px solid ${colors.primary[200]}` },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* --- RIGHT: PRODUCT INFO --- */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={1} direction={"column"}>
            <Typography variant="h2" fontWeight="bold">
              {variant?.name}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              SKU: {currentOption?.sku}
            </Typography>

            {/* tổng số đánh giá */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Chưa có đánh giá
            </Typography>

            {/* Option màu */}
            {/* color */}
            <Typography
              fontWeight={600}
              variant="body1"
              color={colors.primary[100]}
              sx={{ mb: 1 }}
            >
              Màu
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {variant?.options.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.value}
                  color={opt.id === currentOption?.id ? "primary" : "default"}
                  onClick={() => setCurrentOption(opt)}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Stack>

            {/* Loại hàng  */}
            <Typography
              fontWeight={600}
              variant="body1"
              color={colors.primary[100]}
              sx={{ mb: 1 }}
            >
              Loại hàng
            </Typography>
            <Box sx={{ display: "inline-block" }}>
              <Chip label="Nhập khẩu" />
            </Box>

            {/* Giá */}
            <Typography variant="h2" color="error" fontWeight={600}>
              {currentOption?.availability?.salePrice.toLocaleString()}₫
            </Typography>
            <Typography
              variant="h4"
              sx={{
                textDecoration: "line-through",
                color: "text.secondary",
                mb: 2,
              }}
            >
              {currentOption?.availability?.regularPrice.toLocaleString()}₫
            </Typography>

            {/* Khuyến mãi */}
            <Typography
              fontWeight={600}
              variant="body1"
              color={colors.primary[100]}
              sx={{ mb: 1 }}
            >
              Khuyến mãi
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {variant?.options.map(() => (
                <Chip label={"Chưa có khuyến mãi"} sx={{ cursor: "pointer" }} />
              ))}
            </Stack>

            {/* Buttons */}
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" size="large">
                Mua ngay
              </Button>
              <Button
                onClick={() => {
                  if (cart.cart?.cartCode && currentOption) {
                    addOptionsToCart(cart.cart.cartCode, currentOption);
                  } else {
                    console.log("cart code: ", cart.cart);
                    console.log("currnet option: ", currentOption);
                    console.warn("Cart code hoặc option chưa có giá trị");
                  }
                }}
                variant="outlined"
                color="primary"
                size="large"
              >
                Thêm vào giỏ
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* --- CẤU HÌNH & ĐẶC ĐIỂM --- */}
      <Box py={2} mt={1}>
        <Typography variant="h1" fontWeight={600} mb={2}>
          Cấu hình & đặc điểm
        </Typography>

        <Stack
          borderRadius={4}
          width={"50%"}
          p={2}
          bgcolor={colors.primary[400]}
          spacing={1}
        >
          {Object.entries(variant?.specs || {}).map(([key, value], index) => (
            <Stack
              key={key}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                bgcolor:
                  index % 2 === 0
                    ? `${colors.primary[900]}`
                    : `${colors.primary[400]}`, // xen kẽ trắng xám
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "left", width: "40%" }}
              >
                {key}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  textAlign: "left",
                  width: "60%",
                  color: "text.primary",
                }}
              >
                {String(value)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* --- đánh giá sản phẩm --- */}
      <Box py={2} mt={1}>
        <Typography variant="h1" fontWeight={600} mb={2}>
          Đánh giá sản phẩm
        </Typography>
        <Typography variant="body1" color={colors.primary[700]} mb={2}>
          Chưa có đánh giá nào
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductVariantDetail;
