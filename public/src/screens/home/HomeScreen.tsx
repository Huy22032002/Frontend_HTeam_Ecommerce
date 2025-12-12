import {
  Box,
  Typography,
  useTheme,
  Container,
  Stack,
  Card,
  CardContent,
  Chip,
  Pagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
} from "@mui/material";
import CategoryItem from "../../components/categories/CategoryItem";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme/theme";
//hooks
import useHome from "./Home.hook";
import ProductVariantList from "../../components/product/ProductVariantsList";
import ActivePromotionsCarousel from "../../components/promotion/ActivePromotionsCarousel";
import type { ProductVariants } from "../../models/products/ProductVariant";
import BannerSlider from "../../models/BannerSlider";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchIcon from "@mui/icons-material/Search";
import FlashSaleHome from "../../components/flashSale/FlashSaleHome";

const HomeScreen = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    //categories
    categories,
    getAllCategories,
    //search
    listTopSearch,
    //products
    suggestProducts,
    getAllSuggestProducts,
    currentPage,
    totalPages,
    //recommendations
    recommendedProducts,
    getRecommendations,
    isLoadingRecommendations,
    //real-time search
    searchResults,
    isSearching,
    searchProducts,
  } = useHome();

  useEffect(() => {
    getAllCategories();
    getAllSuggestProducts();
    // Lấy recommendations cho cả guest và logged-in users
    getRecommendations(10); // Số lượng recommendations là 10 sản phẩm
  }, []);

  return (
    <Box sx={{ bgcolor: colors.greenAccent[700], minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Banner Section */}
        <Box sx={{ width: "100%", mb: 6, borderRadius: 2, overflow: "hidden" }}>
          <BannerSlider />
        </Box>

        <Box onClick={() => navigate("/flash-sale")} mb={6}>
          <FlashSaleHome />
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
        <Card
          sx={{
            borderRadius: 2,
            mb: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 4, overflow: "hidden" }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <TrendingUpIcon sx={{ color: "#FF6B6B", fontSize: 28 }} />
              <Typography variant="h4" fontWeight="bold">
                📦 Danh mục nổi bật
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                  lg: "1fr 1fr 1fr 1fr",
                },
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

        {/* Active Promotions Section */}
        <ActivePromotionsCarousel />

        {/* Recommendations Section for All Users */}
        {!searchTerm.trim() &&
          (recommendedProducts.length > 0 || isLoadingRecommendations) && (
            <Card
              sx={{
                borderRadius: 2,
                mb: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 4, overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                  <Box sx={{ fontSize: 28 }}>⭐</Box>
                  <Typography variant="h4" fontWeight="bold">
                    Gợi ý dành cho bạn
                  </Typography>
                </Stack>

                {isLoadingRecommendations ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : recommendedProducts.length > 0 ? (
                  <ProductVariantList
                    data={recommendedProducts as ProductVariants[]}
                    onItemClick={(item) => navigate(`/product/${item.id}`)}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ py: 2 }}
                  >
                    Không có gợi ý nào. Hãy duyệt thêm sản phẩm để nhận gợi ý!
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

        {/* Top Searches Section */}
        <Card
          sx={{
            borderRadius: 2,
            mb: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
              🔍 Tìm sản phẩm
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập tên sản phẩm để tìm kiếm..."
              value={searchTerm}
              onChange={(e) => {
                const term = e.target.value;
                setSearchTerm(term);
                searchProducts(term);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SearchIcon sx={{ color: colors.grey[100] }} />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.primary[400],
                  borderRadius: 1,
                  fontSize: 16,
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  opacity: 0.7,
                },
              }}
            />

            {/* Top Searches Chips */}
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 3, mb: 2 }}
            >
              Tìm kiếm nhiều nhất:
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {listTopSearch.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(v)}`);
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

        {/* Search Results Section */}
        {searchTerm.trim() && (
          <Box mb={6}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 4, overflow: "hidden" }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                  <Typography variant="h4" fontWeight="bold">
                    🔍 Kết quả tìm kiếm cho "{searchTerm}"
                  </Typography>
                  {isSearching && <CircularProgress size={24} />}
                </Stack>

                {isSearching ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : searchResults.length > 0 ? (
                  <>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      Tìm thấy {searchResults.length} sản phẩm
                    </Typography>
                    <ProductVariantList
                      data={searchResults as ProductVariants[]}
                      onItemClick={(item) => navigate(`/product/${item.id}`)}
                    />
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      Không tìm thấy sản phẩm nào phù hợp với "{searchTerm}"
                    </Typography>
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="outlined"
                      sx={{ mt: 2 }}
                    >
                      Quay lại danh sách gốc
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Suggested Products Section */}
        {!searchTerm.trim() &&
          suggestProducts &&
          Array.isArray(suggestProducts) &&
          suggestProducts.length > 0 && (
            <Box>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 4, overflow: "hidden" }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={3}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      💡 Các sản phẩm nổi bật
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/all-products")}
                      sx={{
                        bgcolor: "primary.main",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      }}
                    >
                      Xem toàn bộ sản phẩm
                    </Button>
                  </Stack>
                  <ProductVariantList
                    data={suggestProducts as ProductVariants[]}
                    onItemClick={(item) => navigate(`/product/${item.id}`)}
                  />
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_event, page) => {
                          getAllSuggestProducts(page - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        color="primary"
                        size="large"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
      </Container>
    </Box>
  );
};

export default HomeScreen;
