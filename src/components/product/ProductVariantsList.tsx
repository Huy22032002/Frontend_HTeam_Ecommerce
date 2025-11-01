import { Box, Grid, Typography, useTheme } from "@mui/material";
import type { ProductVariants } from "../../models/products/ProductVariant";
import { tokens } from "../../theme/theme";
import ProductVariant from "./ProductVariantItem";

interface ProductVariantListProps {
  data: ProductVariants[];
  title?: string;
  showTitle?: boolean;
  columns?: number;
  onItemClick?: (item: ProductVariants) => void; // callback khi click item
}

const ProductVariantList = ({
  data,
  title,
  showTitle,
  columns = 5,
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

      {/* list products */}
      <Grid container spacing={2} justifyContent="center">
        {data.map((item) => (
          <Grid
            key={item.id}
            sx={{ gridColumn: { xs: '1 / -1', sm: '1 / span 6', md: `1 / span ${Math.round(12 / columns)}` } }}
            onClick={() => onItemClick && onItemClick(item)}
          >
            <ProductVariant data={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductVariantList;
