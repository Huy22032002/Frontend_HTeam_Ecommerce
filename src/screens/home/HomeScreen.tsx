import { Box, Button, Typography, useTheme } from "@mui/material";
import CategoryItem from "../../components/categories/CategoryItem";
import { useEffect } from "react";
import { tokens } from "../../theme/theme";
//components
import Footer from "../../components/Footer";
//hooks
import useHome from "./Home.hook";
import ProductVariantList from "../../components/product/ProductVariantsList";
import type { ProductVariants } from "../../models/products/ProductVariant";
import BannerSlider from "../../models/BannerSlider";

const HomeScreen = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const {
    //categories
    categories,
    getAllCategories,
    //search
    listTopSearch,
    //products
    suggestProducts,
    getAllSuggestProducts,
  } = useHome();

  useEffect(() => {
    getAllCategories();
    getAllSuggestProducts();
  }, []);

  return (
    <Box
      p={4}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: colors.greenAccent[700],
        gap: 2,
      }}
    >
      {/* header */}
      {/* banner */}
      <Box sx={{ width: "100%", maxWidth: 1200, mb: 4 }}>
        <BannerSlider />
      </Box>

      {/* highlights category */}
      <Typography fontWeight="bold" textAlign="start" variant="h2">
        Danh mục nổi bật
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
          mt: 2,
        }}
      >
        {categories.map((c) => (
          <CategoryItem key={c.id} category={c} />
        ))}
      </Box>

      {/* suggestion */}
      {suggestProducts && (
        <ProductVariantList data={suggestProducts as ProductVariants[]} />
      )}

      {/* top searchs */}
      <Box
        px={{ xs: 2, sm: 8, md: 16, lg: 26 }}
        sx={{ alignSelf: "flex-start" }}
      >
        <Typography fontWeight="bold" variant="h3" mb={2}>
          Tìm kiếm nhiều nhất
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1.5}>
          {listTopSearch.map((v) => (
            <Button
              key={v}
              variant="contained"
              color="info"
              sx={{ borderRadius: "20px", textTransform: "none" }}
            >
              {v}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HomeScreen;
