import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PromotionApi } from '../../api/promotion/PromotionApi';
import { ProductApi } from '../../api/product/ProductApi';
import ProductVariantList from '../../components/product/ProductVariantsList';
import type { ProductVariants } from '../../models/products/ProductVariant';
import type { PromotionReadableDTO } from '../../models/promotions/Promotion';

const PromotionProductsScreen = () => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState<PromotionReadableDTO | null>(null);
  const [products, setProducts] = useState<ProductVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotionProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!promotionId) {
          setError('Không tìm thấy khuyến mãi');
          setLoading(false);
          return;
        }

        console.log('[PromotionProductsScreen] Fetching promotion with ID:', promotionId);

        // Fetch promotion by ID from public endpoint
        const promoRes = await PromotionApi.getById(parseInt(promotionId));
        const foundPromo = promoRes.data;

        console.log('[PromotionProductsScreen] Promotion data:', foundPromo);

        if (!foundPromo) {
          setError('Khuyến mãi không tồn tại hoặc đã hết hạn');
          setLoading(false);
          return;
        }

        setPromotion(foundPromo);

        // Extract products from applicable product options
        if (foundPromo.applicableProductOptions && Array.isArray(foundPromo.applicableProductOptions)) {
          console.log('[PromotionProductsScreen] Products found:', foundPromo.applicableProductOptions.length);
          
          // Fetch full product data for each variant
          const variantIds = foundPromo.applicableProductOptions.map((option: any) => option.id);
          console.log('[PromotionProductsScreen] Variant IDs:', variantIds);
          
          try {
            // Fetch full variants in parallel using public endpoint
            const variantPromises = variantIds.map((id: number) => 
              ProductApi.getVariantByIdPublic(id).catch(err => {
                console.warn(`Failed to fetch variant ${id}:`, err);
                return null;
              })
            );
            const variantResponses = await Promise.all(variantPromises);
            
            const productVariants: ProductVariants[] = variantResponses
              .filter(res => res && res.data)
              .map(res => res.data);
            
            console.log('[PromotionProductsScreen] Fetched variants:', productVariants.length);
            setProducts(productVariants);
          } catch (err) {
            console.error('[PromotionProductsScreen] Error fetching variants:', err);
            // Fallback: use basic product info from options
            const fallbackVariants: ProductVariants[] = foundPromo.applicableProductOptions.map((option: any) => ({
              id: option.id,
              sku: option.sku,
              code: option.code,
              name: option.name,
              value: option.value,
            }));
            setProducts(fallbackVariants);
          }
        } else {
          console.log('[PromotionProductsScreen] No applicable product options found');
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Error fetching promotion products:', err);
        setError(err?.response?.data?.message || 'Lỗi khi tải dữ liệu khuyến mãi');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionProducts();
  }, [promotionId]);

  const isPromotionActive = (promo: PromotionReadableDTO) => {
    if (!promo.validFrom || !promo.validTo) return false;
    const now = new Date();
    const from = new Date(promo.validFrom);
    const to = new Date(promo.validTo);
    return now >= from && now <= to;
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header with back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          Quay lại
        </Button>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : promotion ? (
          <>
            {/* Promotion Info Card */}
            <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ flex: 1 }}>
                      🎉 {promotion.code}
                    </Typography>
                    <Chip
                      label={`${promotion.discountPercentage || promotion.discountAmount}${
                        promotion.discountPercentage ? '%' : 'đ'
                      } OFF`}
                      sx={{
                        bgcolor: '#FF6B6B',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 14,
                        py: 3,
                      }}
                    />
                    {isPromotionActive(promotion) && (
                      <Chip
                        label="Đang chạy"
                        sx={{
                          bgcolor: '#4CAF50',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="body1" color="textSecondary">
                    {promotion.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2">
                      <strong>Từ:</strong> {new Date(promotion.validFrom).toLocaleDateString('vi-VN')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Đến:</strong> {new Date(promotion.validTo).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                  📦 Sản phẩm khuyến mãi ({products.length})
                </Typography>

                {products.length > 0 ? (
                  <ProductVariantList
                    data={products}
                    onItemClick={(item) => navigate(`/product/${item.id}`)}
                  />
                ) : (
                  <Alert severity="info">
                    Hiện không có sản phẩm nào áp dụng khuyến mãi này
                  </Alert>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Alert severity="warning">Không tìm thấy khuyến mãi</Alert>
        )}
      </Container>
    </Box>
  );
};

export default PromotionProductsScreen;
