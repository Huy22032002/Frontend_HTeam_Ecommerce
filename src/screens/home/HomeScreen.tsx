import {
  Box,
  Typography,
  useTheme,
  Container,
  Stack,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import CategoryItem from "../../components/categories/CategoryItem";
import { useEffect } from "react";
import { tokens } from "../../theme/theme";
//hooks
import useHome from "./Home.hook";
import ProductVariantList from "../../components/product/ProductVariantsList";
import type { ProductVariants } from "../../models/products/ProductVariant";
import BannerSlider from "../../models/BannerSlider";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const HomeScreen = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const {
    //categories
    categories,
    getAllCategories,
    //search
    listTopSearch,
    //products
    suggestProducts,
    getAllSuggestProducts,
  } = useHome();

  useEffect(() => {
    getAllCategories();
    getAllSuggestProducts();
  }, []);

  return (
    <Box sx={{ bgcolor: colors.greenAccent[700], minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Banner Section */}
        <Box sx={{ width: "100%", mb: 6, borderRadius: 2, overflow: "hidden" }}>
          <BannerSlider />
        </Box>

        {/* Features Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 6 }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2.5,
              bgcolor: colors.primary[400],
              borderRadius: 2,
              flex: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                transform: "translateY(-4px)",
              },
            }}
          >
            <LocalShippingIcon sx={{ color: "#FF6B6B", fontSize: 32 }} />
            <Box>
              <Typography fontWeight={700} variant="body2">
                Giao hàng nhanh
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Miễn phí vận chuyển toàn quốc
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2.5,
              bgcolor: colors.primary[400],
              borderRadius: 2,
              flex: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                transform: "translateY(-4px)",
              },
            }}
          >
            <SecurityIcon sx={{ color: "#FF6B6B", fontSize: 32 }} />
            <Box>
              <Typography fontWeight={700} variant="body2">
                Bảo mật giao dịch
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Thanh toán an toàn 100%
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2.5,
              bgcolor: colors.primary[400],
              borderRadius: 2,
              flex: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                transform: "translateY(-4px)",
              },
            }}
          >
            <ThumbUpIcon sx={{ color: "#FF6B6B", fontSize: 32 }} />
            <Box>
              <Typography fontWeight={700} variant="body2">
                Hài lòng hoặc hoàn tiền
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Hoàn tiền 100% nếu không hài lòng
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Highlight Categories Section */}
        <Card sx={{ borderRadius: 2, mb: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <TrendingUpIcon sx={{ color: "#FF6B6B", fontSize: 28 }} />
              <Typography variant="h4" fontWeight="bold">
                📦 Danh mục nổi bật
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
                gap: 3,
              }}
            >
              {categories.map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                    },
                  }}
                >
                  <CategoryItem category={c} />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Top Searches Section */}
        <Card sx={{ borderRadius: 2, mb: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
              🔍 Tìm kiếm nhiều nhất
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {listTopSearch.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  onClick={() => {
                    window.location.href = `/products?search=${encodeURIComponent(v)}`;
                  }}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    fontSize: 14,
                    py: 2.5,
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Suggested Products Section */}
        {suggestProducts && Array.isArray(suggestProducts) && suggestProducts.length > 0 && (
          <Box>
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight="bold" mb={3}>
                  💡 Sản phẩm gợi ý cho bạn
                </Typography>
                <ProductVariantList
                  data={suggestProducts as ProductVariants[]}
                />
              </CardContent>
            </Card>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomeScreen;
