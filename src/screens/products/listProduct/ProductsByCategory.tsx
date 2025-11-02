import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  useTheme,
  Button,
  CircularProgress,
  Container,
} from "@mui/material";
import { useEffect, useState } from "react";
import useProductByCategory from "./ProductByCategory.hook";
import ManufacturerTabs from "../../../components/manufacturer/ManufacturerTabs";
import FilterSideBar, { type FilterState } from "../../../components/product/FilterSideBar";
import { useParams, useNavigate } from "react-router-dom";
import ProductVariantList from "../../../components/product/ProductVariantsList";
import { tokens } from "../../../theme/theme";

const ProductsByCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  //combo box
  const options = ["Nổi bật nhất", "Giá thấp -> cao", "Giá cao -> thấp"];
  const [selectedValue, setSelectedValue] = useState(options[0]);

  //--------------------------------------
  const {
    //manufacturer
    getListManufacturerByCategory,
    manufacturers,
    //variants
    variants,
    getListProductByCategoryId,
    //category
    categoryName,
    isLoading,
  } = useProductByCategory();

  useEffect(() => {
    if (categoryId) {
      getListManufacturerByCategory(Number(categoryId));
      getListProductByCategoryId(Number(categoryId));
    }
  }, [categoryId]);

  //filter
  const [filteredVariants, setFilteredVariants] = useState(variants);
  const [filters, setFilters] = useState<FilterState>({
    priceRanges: [],
    conditions: [],
    sources: [],
    hasPromotion: false,
  });

  useEffect(() => {
    let result = [...variants];

    // 1) Lọc: variant có option còn hàng
    result = result.filter((variant) =>
      variant.options.some(
        (opt: any) =>
          opt.availability?.productStatus === true &&
          (opt.availability?.quantity ?? 0) > 0
      )
    );

    // 2) Áp dụng filters từ sidebar
    // Filter by price ranges
    if (filters.priceRanges.length > 0) {
      result = result.filter((variant) => {
        const minPrice = Math.min(
          ...variant.options
            .filter((o: any) => o.availability?.productStatus)
            .map((o: any) => o.availability.salePrice || o.availability.regularPrice)
        );
        return filters.priceRanges.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return minPrice >= min && minPrice <= max;
        });
      });
    }

    // Filter by condition (thêm logic nếu availability có field condition)
    // if (filters.conditions.length > 0) {
    //   result = result.filter((variant) =>
    //     variant.options.some((opt) =>
    //       filters.conditions.includes(opt.condition)
    //     )
    //   );
    // }

    // Filter by source (thêm logic nếu có field source)
    // if (filters.sources.length > 0) {
    //   result = result.filter((variant) =>
    //     variant.options.some((opt) =>
    //       filters.sources.includes(opt.source)
    //     )
    //   );
    // }

    // Filter by promotion
    // if (filters.hasPromotion) {
    //   result = result.filter((variant) =>
    //     variant.options.some((opt) => opt.hasPromotion === true)
    //   );
    // }

    // 3) Sort
    const getSalePrice = (variant: any) =>
      Math.min(
        ...variant.options
          .filter((o: any) => o.availability?.productStatus)
          .map((o: any) => o.availability.salePrice || o.availability.regularPrice)
      );

    if (selectedValue === "Giá thấp -> cao") {
      result.sort((a, b) => getSalePrice(a) - getSalePrice(b));
    }

    if (selectedValue === "Giá cao -> thấp") {
      result.sort((a, b) => getSalePrice(b) - getSalePrice(a));
    }

    setFilteredVariants(result);
  }, [variants, selectedValue, filters]);

  //-------------------

  return (
    <Box
      sx={{
        bgcolor: colors.greenAccent[700],
        paddingBottom: 4,
        minHeight: "100vh",
      }}
    >
      {/* Title */}
      <Container maxWidth="lg">
        <Typography my={3} fontWeight="bold" variant="h3">
          {categoryName || "Danh mục sản phẩm"}
        </Typography>
      </Container>

      {/* Manufacturers Tabs */}
      <Box sx={{ px: { xs: 2, sm: 4, md: 8, lg: 20 }, mb: 3 }}>
        <ManufacturerTabs items={manufacturers} />
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      )}

      {/* Main Content */}
      {!isLoading && (
        <Box display="flex" flexDirection="row" sx={{ px: { xs: 2, sm: 4, md: 8, lg: 20 } }}>
          {/* left : sideBarFilter */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <FilterSideBar onFilterChange={setFilters} />
          </Box>

          {/* right: filter + list products */}
          <Box sx={{ flex: 1 }}>
            {/* filter - Sort */}
            <Box display="flex" justifyContent="flex-end" p={2} mb={2}>
              <Autocomplete
                sx={{
                  width: { xs: "100%", sm: 200 },
                  height: 40,
                  background: colors.primary[400],
                }}
                options={options}
                value={selectedValue}
                onChange={(_event, newValue) => setSelectedValue(newValue || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Sắp xếp"
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                        minHeight: "40px",
                      },
                    }}
                  />
                )}
              />
            </Box>

            {/* Empty State */}
            {filteredVariants.length === 0 && !isLoading ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 2,
                }}
              >
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  😕 Không tìm thấy sản phẩm
                </Typography>
                <Typography color="textSecondary" mb={3}>
                  Vui lòng thử lại với các bộ lọc khác hoặc quay lại trang chủ
                </Typography>
                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                  >
                    🔄 Xóa bộ lọc
                  </Button>
                  <Button variant="contained" onClick={() => navigate("/")}>
                    🏠 Quay về trang chủ
                  </Button>
                </Box>
              </Box>
            ) : (
              /* list variants */
              <ProductVariantList data={filteredVariants} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductsByCategory;
