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
        maxWidth: "100%",
        minWidth: 0,
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
            mb: 1,
          }}
          className="product-name"
        >
          {data.name}
        </Typography>

        {/* Price Section */}
        <Box sx={{ mb: 1.5 }}>
          {/* Sale Price (Giá khuyến mãi) */}
          <Typography
            sx={{
              color: "#FF6B6B",
              fontWeight: "bold",
              fontSize: "1rem",
              mb: 0.5,
            }}
          >
            {formatCurrency(data.options[0]?.availability?.salePrice || data.options[0]?.availability?.regularPrice)}
          </Typography>

          {/* Regular Price (Giá gốc) */}
          {data.options[0]?.availability?.salePrice && 
           data.options[0]?.availability?.salePrice !== data.options[0]?.availability?.regularPrice && (
            <Typography
              sx={{
                textDecoration: "line-through",
                color: colors.grey[500],
                fontSize: "0.875rem",
              }}
            >
              {formatCurrency(data.options[0].availability.regularPrice)}
            </Typography>
          )}

          {/* Discount Badge */}
          {data.options[0]?.availability?.salePrice && 
           data.options[0]?.availability?.salePrice < data.options[0]?.availability?.regularPrice && (
            <Typography
              sx={{
                color: "#FF6B6B",
                fontSize: "0.75rem",
                fontWeight: "600",
                mt: 0.5,
              }}
            >
              ✓ Giảm{" "}
              {Math.round(
                ((data.options[0].availability.regularPrice -
                  data.options[0].availability.salePrice) /
                  data.options[0].availability.regularPrice) *
                  100
              )}
              %
            </Typography>
          )}
        </Box>

        <Typography sx={{ fontSize: "0.875rem", mb: 1 }}>Màu</Typography>
        {/* list colors */}
        <Box display="flex" ml={1} mb={1}>
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
                    ? "#ff0000"
                    : option.value.toLowerCase() === "hồng"
                    ? "#ff00a2ff"
                    : "#999999", // default màu xám nếu chưa map
                border: "1px solid #999",
                mr: 0.5,
              }}
            />
          ))}
        </Box>
        <Typography sx={{ color: colors.grey[500], fontSize: "0.875rem" }}>
          {data.options?.length || 0} tuỳ chọn
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductVariant;
