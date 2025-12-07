import { Box, Typography, Card, CardMedia, Button } from "@mui/material";
import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";
import FlashSaleCountdown from "./FlashSaleCountDown";

//render home

interface FlashSaleUIProps {
  items: FlashSaleItemDTO[];
}

const FlashSaleUI: React.FC<FlashSaleUIProps> = ({ items }) => {
  return (
    <Box sx={{ mt: 3, bgcolor: "white", p: 2, borderRadius: 2 }}>
      <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center" // canh giữa theo chiều dọc
          justifyContent="center"
          gap={1}
        >
          <Typography
            variant="h6"
            sx={{ color: "red", fontWeight: "bold", m: 0 }}
          >
            FLASH SALE
          </Typography>

          <FlashSaleCountdown endTime={items[0].endTime} />
        </Box>

        <Button
          variant="text"
          sx={{ ml: "auto", color: "#ff7b2fff", fontWeight: "bold" }}
        >
          Xem tất cả
        </Button>
      </Box>

      {/* WRAPPER (cuộn ngang) */}
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            background: "#ddd",
            borderRadius: 3,
          },
        }}
      >
        {items.map((item: FlashSaleItemDTO) => (
          <Card
            key={item.sku}
            sx={{
              minWidth: 150,
              cursor: "pointer",
              borderRadius: 2,
              p: 1,
            }}
          >
            {/* Ảnh sản phẩm */}
            <CardMedia
              component="img"
              height="140"
              image={item.option?.images?.[0]?.productImageUrl}
              style={{ borderRadius: 8 }}
            />

            {/* Giá Flash sale */}
            <Typography
              align="center"
              sx={{ color: "red", fontWeight: "bold", mt: 1 }}
            >
              {item.flashPrice.toLocaleString()}₫
            </Typography>

            {/* Thanh progress Đã bán */}
            <Box
              sx={{
                mt: 1,
                position: "relative",
                bgcolor: "#ff7b2fff",
                borderRadius: 5,
                height: 18,
              }}
            >
              <Box
                sx={{
                  width: `${
                    ((item.soldQuantity ?? 0) / item.limitQuantity) * 100
                  }%`,
                  bgcolor: "red",
                  height: "100%",
                  borderRadius: 5,
                }}
              />

              <Typography
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  textAlign: "center",
                  fontSize: 12,
                  lineHeight: "18px",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Chỉ còn{" "}
                {item.limitQuantity - item?.soldQuantity
                  ? item.soldQuantity
                  : null}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default FlashSaleUI;
