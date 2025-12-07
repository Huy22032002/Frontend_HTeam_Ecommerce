// FlashSaleCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";
import { useNavigate } from "react-router-dom";

interface FlashSaleCardProps {
  item: FlashSaleItemDTO;
}

const DiscountLabel = styled(Box)(() => ({
  position: "absolute",
  top: 8,
  left: 8,
  backgroundColor: "#FFC107",
  color: "#fff",
  padding: "2px 6px",
  borderRadius: 4,
  fontWeight: "bold",
  fontSize: 12,
}));

const RemainingLabel = styled(Box)(() => ({
  backgroundColor: "#FF5722",
  color: "#fff",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: "bold",
  display: "inline-block",
}));

const FlashSaleDetailCard: React.FC<FlashSaleCardProps> = ({ item }) => {
  const navigate = useNavigate();

  if (!item.option) return null;

  const discountPercent = Math.round(
    ((item.option.availability.regularPrice - item.flashPrice) /
      item.option.availability.regularPrice) *
      100
  );

  return (
    <Card
      sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}
      onClick={() => {
        if (!item.option?.variantId) return;
        navigate(`/product/${item.option.variantId}`);
      }}
    >
      <DiscountLabel>-{discountPercent}%</DiscountLabel>
      <img
        src={item?.option?.images?.[0]?.productImageUrl || undefined}
        alt={item?.option?.name ? item.option.name : undefined}
        style={{ width: "100%", height: 180, objectFit: "cover" }}
      />
      <CardContent>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, height: 40, overflow: "hidden" }}
        >
          {item?.option?.name ? item.option.name : undefined}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: "bold", color: "red" }}>
            {item.flashPrice.toLocaleString("vi-VN")} ₫
          </Typography>
          <Typography
            variant="body2"
            sx={{ textDecoration: "line-through", color: "#999" }}
          >
            {item.option?.availability.regularPrice
              ? item.option.availability.regularPrice.toLocaleString("vi-VN")
              : null}{" "}
            ₫
          </Typography>
        </Stack>
        <Box sx={{ mt: 1 }}>
          <RemainingLabel>
            Chỉ còn {item.limitQuantity - (item.soldQuantity ?? 0)}
          </RemainingLabel>
        </Box>
        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ mt: 1, textTransform: "none" }}
        >
          Mua Ngay
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlashSaleDetailCard;
