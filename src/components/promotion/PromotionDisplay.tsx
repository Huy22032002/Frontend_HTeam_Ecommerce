import { Stack, CircularProgress, Typography, Alert, Box } from '@mui/material';
import { usePromotionsByProductSku } from '../../hooks/usePromotions';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

interface PromotionDisplayProps {
  sku: string;
}

const PromotionDisplay = ({ sku }: PromotionDisplayProps) => {
  const { promotions, loading, error } = usePromotionsByProductSku(sku);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="caption">Đang tải khuyến mãi...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('[PromotionDisplay] Error:', error);
    return (
      <Typography variant="caption" color="error">
        Không thể tải khuyến mãi
      </Typography>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <Typography variant="caption" color="textSecondary">
        Hiện tại không có khuyến mãi cho sản phẩm này
      </Typography>
    );
  }

  return (
    <Stack direction="column" spacing={1}>
      {promotions.map((promo) => {
        const discountText = promo.discountPercentage
          ? `Giảm ${promo.discountPercentage}%`
          : `Giảm ${(promo.discountAmount || 0).toLocaleString('vi-VN')}₫`;

        return (
          <Alert
            key={promo.id}
            severity="success"
            icon={<LocalOfferIcon />}
            sx={{
              py: 1,
              px: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid #4CAF50',
              '& .MuiAlert-icon': {
                color: '#4CAF50',
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#2E7D32',
                }}
              >
                {promo.code}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                •
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#D32F2F',
                }}
              >
                {discountText}
              </Typography>
              {promo.description && (
                <>
                  <Typography variant="caption" color="textSecondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {promo.description}
                  </Typography>
                </>
              )}
            </Stack>
          </Alert>
        );
      })}
    </Stack>
  );
};

export default PromotionDisplay;
