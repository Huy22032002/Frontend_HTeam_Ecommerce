import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
  Chip,
  Rating,
} from "@mui/material";
import { tokens } from "../../theme/theme";
import type { ProductVariants } from "../../models/products/ProductVariant";
import { formatCurrency } from "../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const ProductVariant = ({ data }: { data: ProductVariants }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();

  // Tính giá thấp nhất và cao nhất
  const prices = data.options
    .filter((o) => o.availability?.productStatus)
    .map((o) => o.availability.salePrice || o.availability.regularPrice);

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const regularPrice =
    data.options[0]?.availability?.regularPrice || minPrice;

  // Tính % discount
  const discountPercent =
    regularPrice > 0
      ? Math.round(((regularPrice - minPrice) / regularPrice) * 100)
      : 0;

  // Tính số sản phẩm có sẵn
  const totalStock = data.options.reduce(
    (sum, opt) => sum + (opt.availability?.quantity || 0),
    0
  );

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: colors.primary[400],
        padding: 1.5,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: "280px",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
          transform: "translateY(-8px)",
        },
        "&:hover .product-img": {
          transform: "scale(1.08)",
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
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <Chip
          icon={<LocalOfferIcon />}
          label={`-${discountPercent}%`}
          color="error"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            fontWeight: "bold",
            zIndex: 10,
            fontSize: "0.75rem",
          }}
        />
      )}

      {/* Product Image */}
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
          p: 0.75,
          bgcolor: "#ffffff",
        }}
      />

      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", py: 1, px: 1 }}>
        {/* Product Name */}
        <Typography
          sx={{
            width: "100%",
            fontWeight: "bold",
            fontSize: "0.9rem",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            minHeight: "2.4em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 0.5,
          }}
          className="product-name"
        >
          {data.name}
        </Typography>

        {/* Rating */}
        <Box display="flex" alignItems="center" gap={0.5} my={0.5}>
          <Rating value={4} readOnly size="small" />
          <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
            (128)
          </Typography>
        </Box>

        {/* Price */}
        <Box display="flex" alignItems="center" gap={0.75} my={0.75}>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: "bold",
              color: colors.redAccent[500],
            }}
          >
            {formatCurrency(minPrice)}
          </Typography>
          {discountPercent > 0 && (
            <Typography
              sx={{
                fontSize: "0.75rem",
                textDecoration: "line-through",
                color: colors.grey[500],
              }}
            >
              {formatCurrency(regularPrice)}
            </Typography>
          )}
        </Box>

        {/* Stock Info */}
        <Typography
          variant="caption"
          sx={{
            color: totalStock > 10 ? colors.greenAccent[500] : colors.redAccent[500],
            fontWeight: "500",
            mb: 0.75,
            fontSize: "0.75rem",
          }}
        >
          {totalStock > 0 ? `Còn ${totalStock}` : "Hết hàng"}
        </Typography>

        {/* Voucher Badge */}
        <Chip
          label="Khuyến mại"
          size="small"
          variant="outlined"
          sx={{
            mb: 1,
            height: "20px",
            fontSize: "0.7rem",
            color: colors.greenAccent[500],
            borderColor: colors.greenAccent[500],
          }}
        />

        {/* Colors */}
        <Box display="flex" alignItems="center" gap={0.75} mt="auto">
          <Typography variant="caption" fontWeight="600" sx={{ fontSize: "0.75rem" }}>
            {data.options.length} màu
          </Typography>
          <Box display="flex" gap={0.25}>
            {data.options?.slice(0, 4).map((option) => (
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
                      ? "#ff1493"
                      : option.value.toLowerCase() === "trắng"
                      ? "#f5f5f5"
                      : option.value.toLowerCase() === "xanh"
                      ? "#0066cc"
                      : "#999999",
                  border: "2px solid #ddd",
                  cursor: "pointer",
                  "&:hover": { transform: "scale(1.2)" },
                  transition: "all 0.2s",
                }}
                title={option.value}
              />
            ))}
            {data.options.length > 4 && (
              <Typography variant="caption" fontWeight="600" sx={{ ml: 0.25, fontSize: "0.7rem" }}>
                +{data.options.length - 4}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductVariant;
