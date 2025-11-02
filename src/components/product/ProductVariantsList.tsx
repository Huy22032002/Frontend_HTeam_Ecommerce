import { Box, Typography, useTheme } from "@mui/material";
import type { ProductVariants } from "../../models/products/ProductVariant";
import { tokens } from "../../theme/theme";
import ProductVariant from "./ProductVariantItem";

interface ProductVariantListProps {
  data: ProductVariants[];
  title?: string;
  showTitle?: boolean;
  onItemClick?: (item: ProductVariants) => void; // callback khi click item
}

const ProductVariantList = ({
  data,
  title,
  showTitle,
  onItemClick,
}: ProductVariantListProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {showTitle && title && (
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 2, color: colors.grey[100] }}
        >
          {title}
        </Typography>
      )}

      {/* list products - CSS Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
          gap: 2,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        {data.map((item) => (
          <Box
            key={item.id}
            onClick={() => onItemClick && onItemClick(item)}
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              minWidth: 0, // Important for grid items
            }}
          >
            <ProductVariant data={item} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProductVariantList;
