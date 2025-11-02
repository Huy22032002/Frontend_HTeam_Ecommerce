import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme/theme";
import type { ProductVariants } from "../../models/products/ProductVariant";
import { formatCurrency } from "../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

const ProductVariant = ({ data }: { data: ProductVariants }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: colors.primary[400],
        padding: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
          transform: "translateY(-8px)",
        },
        "&:hover .product-img": {
          transform: "scale(1.05)",
          transition: "transform 0.3s ease",
          cursor: "pointer",
        },
        "&:hover .product-name": {
          textDecoration: "underline",
          cursor: "pointer",
        },
      }}
      onClick={() => navigate(`/product/${data.id}`)}
    >
      <CardMedia
        component="img"
        className="product-img"
        src={
          (data.options?.[0]?.images?.[0]?.productImageUrl ||
            data.options?.[0]?.image?.[0]?.productImageUrl) ??
          "/src/assets/laptop.png"
        }
        alt="product image"
        sx={{
          width: "100%",
          height: 160,
          objectFit: "contain",
          borderRadius: "8px",
          p: 1,
          bgcolor: "#ffffff",
        }}
      />

      <CardContent>
        <Typography
          sx={{
            minHeight: 56,
            width: "100%", // chiếm hết width của Card
            fontWeight: "bold",
            wordWrap: "break-word", // xuống dòng khi quá dài
            overflowWrap: "break-word",
          }}
          className="product-name"
        >
          {data.name}
        </Typography>
        <Typography sx={{ color: colors.redAccent[500] }}>
          {formatCurrency(data.options[0].availability.regularPrice)}
        </Typography>
        <Typography>Voucher</Typography>
        <Box display="flex" flexDirection="row">
          <Typography>Màu</Typography>
          {/* list colors */}
          <Box display="flex" ml={1}>
            {data.options?.map((option) => (
              <Box
                key={option.id}
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor:
                    option.value.toLowerCase() === "đen"
                      ? "#000000"
                      : option.value.toLowerCase() === "đỏ"
                      ? "#333affff"
                      : option.value.toLowerCase() === "trắng"
                      ? "#ffffffff"
                      : option.value.toLowerCase() === "hồng"
                      ? "#ff00a2ff"
                      : option.value.toLowerCase() === "xanh dương"
                      ? "#333affff"
                      : option.value.toLowerCase() === "bạc"
                      ? "#909090ff"
                      : "#999999", // default màu xám nếu chưa map
                  border: "1px solid #999",
                  mr: 0.5,
                }}
              />
            ))}
          </Box>
        </Box>
        <Typography sx={{ color: colors.grey[500] }}>Thong so 9</Typography>
      </CardContent>
    </Card>
  );
};

export default ProductVariant;
