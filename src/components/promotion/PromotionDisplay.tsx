import { Stack, Chip, CircularProgress, Typography } from '@mui/material';
import { usePromotionsByProductSku } from '../../hooks/usePromotions';

interface PromotionDisplayProps {
  sku: string;
}

const PromotionDisplay = ({ sku }: PromotionDisplayProps) => {
  const { promotions, loading, error } = usePromotionsByProductSku(sku);

  if (loading) {
    return <CircularProgress size={20} />;
  }

  if (error) {
    return <Typography variant="caption" color="error">Lỗi tải khuyến mãi</Typography>;
  }

  if (promotions.length === 0) {
    return <Chip label="Chưa có khuyến mãi" />;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {promotions.map((promo) => (
        <Chip
          key={promo.id}
          label={`${promo.promotionName}: ${
            promo.type === 'PERCENTAGE' ? `${promo.value}%` : `${promo.value.toLocaleString()}₫`
          }`}
          color="primary"
          variant="outlined"
          sx={{ cursor: 'pointer' }}
        />
      ))}
    </Stack>
  );
};

export default PromotionDisplay;
