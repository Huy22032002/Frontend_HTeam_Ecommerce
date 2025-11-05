import { Box, Card, CardContent, Typography, Stack, CircularProgress, Chip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePromotionsByActive } from '../../hooks/usePromotions';
import { tokens } from '../../theme/theme';
import DiscountIcon from '@mui/icons-material/LocalOffer';

const ActivePromotionsCarousel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { promotions, loading, error } = usePromotionsByActive(true);

  console.log('[ActivePromotionsCarousel] promotions:', promotions, 'loading:', loading, 'error:', error);

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2, mb: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('[ActivePromotionsCarousel] Error:', error);
    return (
      <Card sx={{ borderRadius: 2, mb: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', bgcolor: '#fff3e0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography color="error">⚠️ Lỗi khi tải khuyến mãi: {String(error)}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!promotions || promotions.length === 0) {
    console.log('[ActivePromotionsCarousel] No promotions found');
    return (
      <Card sx={{ borderRadius: 2, mb: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', bgcolor: '#e8f5e9' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography color="textSecondary">📝 Hiện tại không có khuyến mãi đang chạy</Typography>
        </CardContent>
      </Card>
    );
  }

  const handlePromotionClick = (promotionId: number) => {
    navigate(`/promotions/${promotionId}/products`);
  };

  const isPromotionActive = (promo: any) => {
    const now = new Date();
    const from = new Date(promo.validFrom);
    const to = new Date(promo.validTo);
    return now >= from && now <= to;
  };

  return (
    <Card sx={{ borderRadius: 2, mb: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <CardContent sx={{ p: 4, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <DiscountIcon sx={{ color: '#FF6B6B', fontSize: 28 }} />
          <Typography variant="h4" fontWeight="bold">
            🎉 Khuyến mãi đang chạy
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {promotions.map((promo) => (
            <Box
              key={promo.id}
              onClick={() => handlePromotionClick(promo.id)}
              sx={{
                cursor: 'pointer',
                p: 2,
                bgcolor: colors.primary[400],
                borderRadius: 2,
                border: `2px solid transparent`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 16px rgba(255, 107, 107, 0.3)',
                  borderColor: '#FF6B6B',
                },
              }}
            >
              <Stack spacing={1.5}>
                {/* Discount Badge */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Chip
                    label={`${promo.discountPercentage || promo.discountAmount}${promo.discountPercentage ? '%' : 'đ'} OFF`}
                    sx={{
                      bgcolor: '#FF6B6B',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 12,
                      height: 'auto',
                      py: 1,
                    }}
                  />
                  {isPromotionActive(promo) && (
                    <Chip
                      label="Đang chạy"
                      sx={{
                        bgcolor: '#4CAF50',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 11,
                        height: 'auto',
                        py: 1,
                      }}
                    />
                  )}
                </Box>

                {/* Promotion Code */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#FF6B6B',
                      fontSize: 14,
                      wordBreak: 'break-word',
                    }}
                  >
                    {promo.code}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'textSecondary',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {promo.description}
                </Typography>

                {/* Validity */}
                <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>
                  Đến: {new Date(promo.validTo).toLocaleDateString('vi-VN')}
                </Typography>

                {/* Click to view products */}
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1976d2',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textDecorationStyle: 'dashed',
                    cursor: 'pointer',
                  }}
                >
                  Xem sản phẩm →
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivePromotionsCarousel;
