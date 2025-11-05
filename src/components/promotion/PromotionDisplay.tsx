import { Stack, CircularProgress, Typography, Alert, Box, Button } from '@mui/material';
import { usePromotionsByProductSku } from '../../hooks/usePromotions';
import { useDispatch, useSelector } from 'react-redux';
import { setItemPromotion, removeItemPromotion } from '../../store/cartSlice';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckIcon from '@mui/icons-material/Check';
import type { RootState } from '../../store/store';
import { useEffect } from 'react';

interface PromotionDisplayProps {
  sku: string;
  optionId?: number; // For "Mua ngay" direct product support
}

const PromotionDisplay = ({ sku, optionId }: PromotionDisplayProps) => {
  const { promotions, loading, error } = usePromotionsByProductSku(sku);
  const dispatch = useDispatch();
  const itemPromotionsRedux = useSelector((state: RootState) => state.cart.itemPromotions);
  
  // Use optionId as itemId for direct products
  const itemId = optionId || 0;
  const appliedPromotion = itemPromotionsRedux[itemId];

  // Clear promotion when component unmounts (user leaves the page)
  useEffect(() => {
    return () => {
      if (appliedPromotion && itemId !== 0) {
        // Only clear for "Mua ngay" (optionId), not for cart items
        dispatch(removeItemPromotion({ itemId }));
      }
    };
  }, [itemId, appliedPromotion, dispatch]);

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

  const handleApplyPromotion = (promotion: any) => {
    dispatch(setItemPromotion({ itemId, promotion }));
  };

  const handleRemovePromotion = () => {
    dispatch(removeItemPromotion({ itemId }));
  };

  return (
    <Stack direction="column" spacing={1}>
      {promotions.map((promo) => {
        const discountText = promo.discountPercentage
          ? `Giảm ${promo.discountPercentage}%`
          : `Giảm ${(promo.discountAmount || 0).toLocaleString('vi-VN')}₫`;

        const isApplied = appliedPromotion?.id === promo.id;

        return (
          <Alert
            key={promo.id}
            severity="success"
            icon={<LocalOfferIcon />}
            sx={{
              py: 1,
              px: 2,
              backgroundColor: isApplied ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)',
              border: isApplied ? '2px solid #4CAF50' : '1px solid #4CAF50',
              '& .MuiAlert-icon': {
                color: '#4CAF50',
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, flexWrap: 'wrap' }}>
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
              <Button
                size="small"
                variant={isApplied ? "contained" : "outlined"}
                color={isApplied ? "success" : "inherit"}
                onClick={() => isApplied ? handleRemovePromotion() : handleApplyPromotion(promo)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  ml: 1,
                }}
                startIcon={isApplied ? <CheckIcon /> : undefined}
              >
                {isApplied ? 'Đã áp dụng' : 'Áp dụng'}
              </Button>
            </Stack>
          </Alert>
        );
      })}
    </Stack>
  );
};

export default PromotionDisplay;
