import {
  Box,
  Button,
  CardMedia,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
  CircularProgress,
  Card,
  CardContent,
  Rating,
  Alert,
  Container,
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import { useEffect, useState } from "react";
import useVariantDetail from "./ProductVariantDetail.hook";
import { useNavigate, useParams } from "react-router-dom";
import { tokens } from "../../../theme/theme";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { ProductImage } from "../../../models/products/ProductVariantOption";
import PromotionDisplay from "../../../components/promotion/PromotionDisplay";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreateIcon from "@mui/icons-material/Create";
import SecurityIcon from "@mui/icons-material/Security";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CircleIcon from "@mui/icons-material/Circle";

import { CustomerLogApi } from "../../../api/customer/CustomerLogApi";
import CreateReviewModal from "../../../components/review/CreateReviewModal";
import ImageModalGallery from "../../../components/ImageGallery";
import FlashSaleCountdown from "../../../components/flashSale/FlashSaleCountDown";
import type { FlashSaleItemDTO } from "../../../models/flashSale/FlashSaleItemDTO";

const ProductVariantDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  //get cart from redux
  const cart = useSelector((state: RootState) => state.cart);
  const customer = useSelector(
    (state: RootState) => state.customerAuth.customer
  );

  const { variantId } = useParams();

  const {
    variant,
    getProductVariant,
    recommendedProducts,
    currentOption,
    setCurrentOption,

    //cart
    addOptionsToCart,
    isLoading,
    setIsLoading,
    //review
    checkCanReview,
    canReview,
    openCreateReview,
    setOpenCreateReview,
    handleCreateReview,
    reviews,
    loadReviews,
    page,
    setPage,
    filter,
    setFilter,
    totalPages,
    isLoadingReview,
    //flash sale
    getFlashSaleItemBySku,
    flashSale,
  } = useVariantDetail();

  useEffect(() => {
    if (variantId) {
      getProductVariant(Number(variantId));
    }

    // Log product view to backend
    console.log("VariantId from URL:", variantId);

    if (variantId && customer) {
      console.log("Logging product view - variantId:", variantId);
      CustomerLogApi.logProductView(Number(variantId))
        .then((success) => {
          if (success) {
            console.log("Product view logged successfully");
          } else {
            console.warn("Failed to log product view");
          }
        })
        .catch((err) => {
          console.error("Failed to log product view:", err);
        });
    } else {
      console.warn("Cannot log product view - missing sessionId or variantId", {
        variantId,
      });
    }
  }, [variantId]);

  //disable Buy now and AddtoCart neu flashSale co soldQuantity > limitQuantity
  const isFlashSaleSoldOut = (item: FlashSaleItemDTO | null) => {
    if (!item) return;
    return (item.soldQuantity ?? 0) >= (item.limitQuantity ?? 0);
  };

  useEffect(() => {
    getFlashSaleItemBySku();
    loadReviews();
    checkCanReview();
  }, [filter, page, currentOption]);

  const handleAddToCart = async () => {
    // Kiểm tra nếu khách hàng chưa đăng nhập
    if (!customer) {
      navigate("/login");
      return;
    }

    if (currentOption && !isLoading) {
      setIsLoading(true);
      try {
        await addOptionsToCart(cart.cart?.cartCode, currentOption);
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 3000);
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBuyNow = async () => {
    // Kiểm tra nếu khách hàng chưa đăng nhập
    if (!customer) {
      navigate("/login");
      return;
    }

    if (currentOption) {
      // Lấy giá cuối cùng ưu tiên Flash Sale
      const flashPrice = flashSale?.flashPrice; // lấy flash sale nếu có
      const finalPrice =
        flashPrice !== undefined && flashPrice !== null
          ? flashPrice
          : currentOption.availability?.salePrice ??
            currentOption.availability?.regularPrice ??
            0;

      // Chuyển đến checkout với thông tin sản phẩm (không thêm giỏ hàng)
      navigate("/checkout", {
        state: {
          directProduct: {
            optionId: currentOption.id,
            sku: currentOption.sku,
            quantity: 1,
            currentPrice: finalPrice,
            name: variant?.name,
            images: currentOption.images,
          },
        },
      });
    }
  };

  const isOutOfStock = (currentOption?.availability?.quantity ?? 0) <= 0;

  return (
    <Box sx={{ bgcolor: colors.greenAccent[700], minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Success Alert */}
        {addedSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setAddedSuccess(false)}
          >
            ✅ Thêm vào giỏ hàng thành công!
          </Alert>
        )}

        {/* Main Product Section */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="flex-start"
        >
          {/* LEFT: Image Gallery */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
              <CardMedia
                component="img"
                src={
                  currentOption?.images?.[imageIndex]?.productImageUrl ??
                  "/src/assets/laptop.png"
                }
                alt="Main product"
                sx={{
                  width: "100%",
                  height: { xs: 300, md: 500 },
                  objectFit: "contain",
                  p: 2,
                  bgcolor: colors.primary[400],
                }}
              />
            </Card>

            {/* Thumbnail Gallery */}
            {currentOption?.images && currentOption.images.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ overflowX: "auto", pb: 1 }}
              >
                {currentOption.images.map((img: ProductImage, i: number) => (
                  <Box
                    key={i}
                    onClick={() => setImageIndex(i)}
                    sx={{
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        imageIndex === i
                          ? `3px solid ${colors.primary[100]}`
                          : "1px solid #ddd",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        borderColor: colors.primary[100],
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      src={img.productImageUrl}
                      alt={`thumb-${i}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        p: 0.5,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* RIGHT: Product Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title & SKU */}
            <Typography variant="h4" fontWeight="bold" mb={1}>
              {variant?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
              SKU: {currentOption?.sku}
            </Typography>
            {/* Stock status */}
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <CircleIcon
                fontSize="small"
                color={
                  (currentOption?.availability?.quantity ?? 0) > 0
                    ? "success"
                    : "error"
                }
              />
              <Typography
                variant="body1"
                sx={{ fontWeight: 500 }}
                color={!isOutOfStock ? "success.main" : "error.main"}
              >
                {!isOutOfStock ? "Còn hàng" : "Hết hàng"}
              </Typography>
            </Stack>

            {/* Rating */}
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Typography variant="body2" color="text.secondary">
                {currentOption?.reviewAvg || "Chưa có đánh giá"}
              </Typography>
              <Rating
                value={
                  currentOption?.reviewAvg ? Number(currentOption.reviewAvg) : 0
                }
                readOnly
                precision={0.5}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentOption?.reviewCount || "0"} đánh giá
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Color Selection */}
            <Box mb={3}>
              <Typography fontWeight={600} mb={1.5}>
                🎨 Chọn màu sắc
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {variant?.options.map((opt) => (
                  <Chip
                    key={opt.id}
                    label={opt.value}
                    onClick={() => {
                      setCurrentOption(opt);
                      setImageIndex(0);
                    }}
                    variant={
                      opt.id === currentOption?.id ? "filled" : "outlined"
                    }
                    color={opt.id === currentOption?.id ? "primary" : "default"}
                    sx={{
                      cursor: "pointer",
                      fontWeight: opt.id === currentOption?.id ? 600 : 400,
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Card
              sx={{
                bgcolor: "#fff",
                p: 2.5,
                mb: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="baseline">
                {flashSale && (
                  <FlashSaleCountdown endTime={flashSale.endTime} />
                )}
                <Typography variant="h3" fontWeight="bold" color="#FF6B6B">
                  {flashSale
                    ? flashSale.flashPrice.toLocaleString() + "₫"
                    : currentOption?.availability?.salePrice?.toLocaleString() +
                      "₫"}
                </Typography>

                {!flashSale && currentOption?.availability?.salePrice && (
                  <Typography
                    variant="h6"
                    sx={{ textDecoration: "line-through", color: "#999" }}
                  >
                    {currentOption.availability.regularPrice.toLocaleString()}₫
                  </Typography>
                )}

                {flashSale && currentOption?.availability?.regularPrice && (
                  <Chip
                    label={`-${Math.round(
                      ((currentOption.availability.regularPrice -
                        flashSale.flashPrice) /
                        currentOption.availability.regularPrice) *
                        100
                    )}%`}
                    color="error"
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Card>

            {/* Promotions */}
            {!flashSale && (
              <Box mb={3}>
                <Typography fontWeight={600} mb={1.5}>
                  🎉 Khuyến mãi
                </Typography>
                <PromotionDisplay
                  sku={currentOption?.sku || ""}
                  optionId={currentOption?.id}
                />
              </Box>
            )}

            {/* Info Cards */}
            <Stack spacing={2} mb={3}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  p: 2,
                  bgcolor: colors.primary[400],
                  borderRadius: 1,
                }}
              >
                <LocalShippingIcon sx={{ color: colors.primary[100] }} />
                <Box>
                  <Typography fontWeight={600} variant="body2">
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
                  p: 2,
                  bgcolor: colors.primary[400],
                  borderRadius: 1,
                }}
              >
                <SecurityIcon sx={{ color: colors.primary[100] }} />
                <Box>
                  <Typography fontWeight={600} variant="body2">
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
                  p: 2,
                  bgcolor: colors.primary[400],
                  borderRadius: 1,
                }}
              >
                <ThumbUpIcon sx={{ color: colors.primary[100] }} />
                <Box>
                  <Typography fontWeight={600} variant="body2">
                    Hài lòng hoặc hoàn tiền
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Hoàn tiền 100% nếu không hài lòng
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Action Buttons */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                onClick={handleBuyNow}
                variant="contained"
                size="large"
                fullWidth
                disabled={
                  isLoading ||
                  isFlashSaleSoldOut(flashSale) ||
                  !currentOption ||
                  currentOption.availability.quantity <= 0
                }
                sx={{
                  bgcolor: "#FF6B6B",
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: 16,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#FF5252",
                  },
                }}
              >
                {isLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <span>Đang xử lý...</span>
                  </Stack>
                ) : (
                  <>
                    {isOutOfStock
                      ? "Hết hàng"
                      : isFlashSaleSoldOut(flashSale)
                      ? "Đã bán hết Flash Sale"
                      : "🛍️ Mua ngay"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="outlined"
                size="large"
                fullWidth
                disabled={
                  isLoading ||
                  isOutOfStock ||
                  isFlashSaleSoldOut(flashSale) ||
                  !currentOption
                }
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: 16,
                  textTransform: "none",
                  borderColor: colors.primary[100],
                  color: colors.primary[100],
                  "&:hover": {
                    bgcolor: colors.primary[700],
                    borderColor: colors.primary[100],
                  },
                }}
              >
                {isLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <span>Đang thêm...</span>
                  </Stack>
                ) : (
                  <>
                    <AddShoppingCartIcon sx={{ mr: 1 }} />
                    {isOutOfStock
                      ? "Hết hàng"
                      : isFlashSaleSoldOut(flashSale)
                      ? "Đã bán hết Flash Sale"
                      : "Thêm vào giỏ"}
                  </>
                )}
              </Button>
            </Stack>
          </Box>
        </Stack>

        {/* Specifications Section */}
        <Card sx={{ mt: 6, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              📋 Cấu hình & đặc điểm
            </Typography>
            <Stack
              spacing={1}
              sx={{
                bgcolor: colors.primary[400],
                borderRadius: 1,
                p: 2,
              }}
            >
              {Object.entries(variant?.specs || {}).map(
                ([key, value], index) => (
                  <Stack
                    key={key}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      bgcolor:
                        index % 2 === 0
                          ? colors.primary[900]
                          : colors.primary[400],
                      px: 2,
                      py: 1.5,
                      borderRadius: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ width: "40%" }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        width: "60%",
                        textAlign: "right",
                        color: "text.primary",
                      }}
                    >
                      {String(value)}
                    </Typography>
                  </Stack>
                )
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Box sx={{ mt: 6, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            ⭐ Đánh giá sản phẩm
          </Typography>
          <Box sx={{ mb: 2, display: "flex" }}>
            {canReview ? (
              <Button
                startIcon={<CreateIcon />}
                variant="contained"
                size="small"
                onClick={() => setOpenCreateReview(true)}
              >
                Viết đánh giá
              </Button>
            ) : (
              <Button variant="outlined" size="small" disabled>
                Bạn chưa mua sản phẩm hoặc đã đánh giá rồi!
              </Button>
            )}
          </Box>

          {/* Modal Create Review */}
          {customer && openCreateReview && currentOption && (
            <CreateReviewModal
              customerId={customer.id}
              sku={currentOption?.sku}
              open={openCreateReview}
              onCreateReview={handleCreateReview}
              onClose={() => setOpenCreateReview(false)}
            />
          )}

          {/* Filter Review */}
          <Tabs
            value={filter}
            onChange={(_, v) => setFilter(v)}
            centered
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main", // màu underline indicator
                height: 3,
              },
            }}
          >
            <Tab
              value={"ALL"}
              label="Tất cả"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "&:hover": {
                  color: "primary.light",
                  opacity: 1,
                },
              }}
            />
            <Tab
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "&:hover": {
                  color: "primary.light",
                  opacity: 1,
                },
              }}
              value={"5_STAR"}
              label="5 sao"
            />
            <Tab
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "&:hover": {
                  color: "primary.light",
                  opacity: 1,
                },
              }}
              value={"4_STAR"}
              label="4 sao"
            />
            <Tab
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "&:hover": {
                  color: "primary.light",
                  opacity: 1,
                },
              }}
              value={"3_STAR"}
              label="3 sao"
            />
            <Tab
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "&:hover": {
                  color: "primary.light",
                  opacity: 1,
                },
              }}
              value={"2_STAR"}
              label="2 sao"
            />
            <Tab
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "&:hover": {
                  color: "primary.light",
                  opacity: 1,
                },
              }}
              value={"1_STAR"}
              label="1 sao"
            />
            <Tab
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                },
                "&:hover": {
                  color: "primary.light",
                  opacity: 1,
                },
              }}
              value="WITH_IMAGES"
              label="Có hình ảnh"
            />
          </Tabs>
          {/* Loading */}
          {isLoadingReview && (
            <Stack alignItems="center" mt={2} mb={2}>
              <CircularProgress size={24} />
              <Typography mt={1}>Đang tải các bài đánh giá...</Typography>
            </Stack>
          )}

          {/* No review */}
          {!isLoadingReview && reviews.length === 0 && (
            <Typography variant="body1" color="textSecondary" mt={2}>
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
            </Typography>
          )}

          {/* Danh sách reviews */}
          {!isLoadingReview &&
            reviews.map((r) => (
              <Card key={r.id} sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  {/* Header: Rating + Customer Name + Date */}
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Rating
                      value={r.reviewRating}
                      readOnly
                      precision={0.5}
                      size="small"
                    />
                    <Typography variant="body2" color="textSecondary">
                      {r.customerName} -{" "}
                      {r.reviewDate
                        ? new Date(r.reviewDate).toLocaleDateString()
                        : ""}
                    </Typography>
                  </Stack>

                  {/* Comment */}
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {r.comment}
                  </Typography>

                  {/* Images */}
                  {r.imageUrls && r.imageUrls.length > 0 && (
                    <ImageModalGallery
                      imageUrls={r.imageUrls}
                      thumbnailSize={80}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          {/* Pagination */}
          <Box mt={1}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
            />
          </Box>
        </Box>

        {/* Recommended Products Section */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <Card sx={{ mt: 6, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                💡 Sản phẩm khuyến nghị
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ overflowX: "auto", pb: 1 }}
              >
                {recommendedProducts.map((product) => (
                  <Card
                    key={product.id}
                    onClick={() => {
                      window.location.href = `/product/${product.id}`;
                    }}
                    sx={{
                      flex: "0 0 auto",
                      width: {
                        xs: "100%",
                        sm: "calc(50% - 8px)",
                        md: "calc(20% - 8px)",
                      },
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      src={
                        product.options?.[0]?.images?.[0]?.productImageUrl ??
                        "/src/assets/laptop.png"
                      }
                      alt={product.name}
                      sx={{
                        objectFit: "contain",
                        p: 1,
                        bgcolor: colors.primary[400],
                      }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          mb: 1,
                        }}
                      >
                        {product.name}
                      </Typography>

                      {/* Price Section */}
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={1}
                      >
                        {/* Sale Price */}
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            color: "#FF6B6B",
                          }}
                        >
                          {(
                            product.options?.[0]?.availability?.salePrice ||
                            product.options?.[0]?.availability?.regularPrice
                          )?.toLocaleString()}
                          ₫
                        </Typography>

                        {/* Regular Price (if different from sale price) */}
                        {product.options?.[0]?.availability?.salePrice &&
                          product.options?.[0]?.availability?.salePrice !==
                            product.options?.[0]?.availability
                              ?.regularPrice && (
                            <Typography
                              variant="caption"
                              sx={{
                                textDecoration: "line-through",
                                color: "#999",
                              }}
                            >
                              {product.options?.[0]?.availability?.regularPrice?.toLocaleString()}
                              ₫
                            </Typography>
                          )}
                      </Stack>

                      {/* Discount Badge */}
                      {product.options?.[0]?.availability?.salePrice &&
                        product.options?.[0]?.availability?.salePrice <
                          product.options?.[0]?.availability?.regularPrice && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#FF6B6B",
                              fontWeight: "600",
                              mb: 1,
                              display: "block",
                            }}
                          >
                            ✓ Giảm{" "}
                            {Math.round(
                              ((product.options?.[0]?.availability
                                ?.regularPrice -
                                product.options?.[0]?.availability?.salePrice) /
                                (product.options?.[0]?.availability
                                  ?.regularPrice || 1)) *
                                100
                            )}
                            %
                          </Typography>
                        )}

                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                          borderColor: colors.primary[100],
                          color: colors.primary[100],
                          "&:hover": {
                            bgcolor: colors.primary[500],
                          },
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default ProductVariantDetail;
