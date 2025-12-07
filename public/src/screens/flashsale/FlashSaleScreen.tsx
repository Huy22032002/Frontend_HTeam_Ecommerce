import { useEffect, useState } from "react";
import { FlashSaleApi } from "../../api/flashsale/FlashSaleApi";
import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";
import banner from "../../assets/flashsale.jpg";

import { Box, Card, CardMedia, Grid, Pagination } from "@mui/material";

import FlashSaleDetailCard from "../../components/flashSale/FlashSaleDetailCard";
import FlashSaleCountdown from "../../components/flashSale/FlashSaleCountDown";

const FlashSaleScreen = () => {
  const [items, setItems] = useState<FlashSaleItemDTO[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchActiveFlashSale = async () => {
    const res = await FlashSaleApi.getActiveFlashSale(page - 1, pageSize);
    setItems(res.content);
    setTotalPages(res.totalPages);
  };

  useEffect(() => {
    fetchActiveFlashSale();
  }, [page]);

  return (
    <Box sx={{ px: 24 }}>
      {/* Banner */}
      <Card sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
        <CardMedia
          component="img"
          image={banner}
          alt="Flash Sale"
          sx={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Card>

      {/* Countdown */}
      {items.length > 0 && items[0].endTime && (
        <Box sx={{ p: 2, textAlign: "center", mb: 3 }}>
          <FlashSaleCountdown endTime={items[0].endTime} />
        </Box>
      )}

      {/* Grid Item */}
      <Grid container spacing={2}>
        {items.length > 0 &&
          items.map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={item.sku}>
              <FlashSaleDetailCard item={item} />
            </Grid>
          ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>
  );
};

export default FlashSaleScreen;
