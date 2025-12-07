import { Box, Typography, useTheme } from "@mui/material";
import type { ProductVariants } from "../../models/products/ProductVariant";
import { tokens } from "../../theme/theme";
import ProductVariant from "./ProductVariantItem";

interface ProductVariantListProps {
  data: ProductVariants[];
  title?: string;
  showTitle?: boolean;
  onItemClick?: (item: ProductVariants) => void; // callback khi click item
  maxColumns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const ProductVariantList = ({
  data,
  title,
  showTitle,
  onItemClick,
  maxColumns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
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
            xs: `repeat(${maxColumns.xs || 1}, 1fr)`,
            sm: `repeat(${maxColumns.sm || 2}, 1fr)`,
            md: `repeat(${maxColumns.md || 3}, 1fr)`,
            lg: `repeat(${maxColumns.lg || 4}, 1fr)`,
            xl: `repeat(${maxColumns.xl || 5}, 1fr)`,
          },
          gap: 3,
          width: "100%",
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
              minWidth: 0,
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
