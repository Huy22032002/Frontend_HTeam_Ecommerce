import { Stack, Box, Typography } from "@mui/material";
import { usePromotionsByActive } from "../../hooks/usePromotions";

interface PromotionBannerProps {
  backgroundColor?: string;
  variant?: "banner" | "grid";
}

const PromotionBanner = ({
  backgroundColor = "#f5f5f5",
  variant = "banner",
}: PromotionBannerProps) => {
  const { promotions } = usePromotionsByActive(true);

  if (!promotions || promotions.length === 0) {
    return null;
  }

  if (variant === "grid") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 2,
          mb: 4,
        }}
      >
        {promotions.slice(0, 3).map((promo) => (
          <Box key={promo.id}>
            <Box
              sx={{
                bgcolor: backgroundColor,
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              {/* <Typography variant="h6" fontWeight={600} mb={1}>
                {promo.promotionName}
              </Typography> */}
              <Typography variant="body2" color="text.secondary" mb={1}>
                Mã: {promo.code}
              </Typography>
              {/* <Typography variant="h5" fontWeight={700} color="error" mb={1}>
                {promo.type === "PERCENTAGE"
                  ? `Giảm ${promo.value}%`
                  : `Giảm ${promo.value.toLocaleString()}₫`}
              </Typography> */}
              <Typography variant="caption" color="text.secondary">
                Đến {new Date(promo.validTo).toLocaleDateString("vi-VN")}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Banner variant
  return (
    <Box
      sx={{
        bgcolor: backgroundColor,
        p: 3,
        borderRadius: 2,
        mb: 4,
        overflow: "auto",
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={2}>
        🎉 Khuyến mãi đang chạy
      </Typography>
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
        {promotions.map((promo) => (
          <Box
            key={promo.id}
            sx={{
              minWidth: 250,
              bgcolor: "white",
              p: 2,
              borderRadius: 1,
              border: "1px solid #e0e0e0",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 2,
                borderColor: "primary.main",
              },
            }}
          >
            {/* <Typography variant="body2" fontWeight={600} mb={1}>
              {promo.promotionName}
            </Typography> */}
            {/* <Typography variant="h6" fontWeight={700} color="error" mb={1}>
              {promo.type === "PERCENTAGE"
                ? `Giảm ${promo.value}%`
                : `Giảm ${promo.value.toLocaleString()}₫`}
            </Typography> */}
            <Typography variant="caption" color="text.secondary">
              Mã: {promo.code}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default PromotionBanner;
