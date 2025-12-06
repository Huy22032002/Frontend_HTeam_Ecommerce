import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  useTheme,
  Pagination,
} from "@mui/material";
import { useEffect, useState } from "react";
import useProductByCategory from "./ProductByCategory.hook";
import ManufacturerTabs from "../../../components/manufacturer/ManufacturerTabs";
import FilterSideBar from "../../../components/product/FilterSideBar";
import { useParams } from "react-router-dom";
import ProductVariantList from "../../../components/product/ProductVariantsList";
import { tokens } from "../../../theme/theme";

const ProductsByCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  //combo box
  const options = ["Nổi bật nhất", "Giá thấp -> cao", "Giá cao -> thấp"];
  const [selectedValue, setSelectedValue] = useState(options[0]);

  const {
    //manufacturer
    getListManufacturerByCategory,
    manufacturers,
    //variants
    variants,
    getListProductByCategoryId,
    getListProductWithFilters,
    //category
    categoryName,
    currentPage,
    totalPages,
  } = useProductByCategory();

  useEffect(() => {
    if (categoryId) {
      getListManufacturerByCategory(Number(categoryId));
      getListProductByCategoryId(Number(categoryId), 0);
    }
  }, [categoryId]);

  //filter
  const [filteredVariants, setFilteredVariants] = useState(variants);
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    hasSalePrice?: boolean;
    manufacturers?: string[];
  }>({});

  const handleFilterChange = async (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Call API with new filters for server-side filtering
    await getListProductWithFilters({
      ...newFilters,
      page: 0,
    });
  };

  useEffect(() => {
    let result = [...variants];

    // 1) Lọc: variant có option còn hàng (default)
    result = result.filter((variant) =>
      variant.options.some(
        (opt) =>
          opt.availability?.productStatus === true &&
          (opt.availability?.quantity ?? 0) > 0
      )
    );

    // 2) Sort
    const getSalePrice = (variant: any) =>
      Math.min(
        ...variant.options
          .filter((o: any) => o.availability?.productStatus)
          .map((o: any) => o.availability.salePrice)
      );

    if (selectedValue === "Giá thấp -> cao") {
      result.sort((a, b) => getSalePrice(a) - getSalePrice(b));
    }

    if (selectedValue === "Giá cao -> thấp") {
      result.sort((a, b) => getSalePrice(b) - getSalePrice(a));
    }

    setFilteredVariants(result);
  }, [variants, selectedValue]);

  //-------------------

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        px: { xs: 2, sm: 4, md: 8, lg: 20 },
        background: colors.greenAccent[700],
        paddingBottom: 4,
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* title */}
      <Typography my={2} fontWeight="bold" variant="h2">
        {categoryName || ""}
      </Typography>

      {/* list manufacturers  */}
      <ManufacturerTabs items={manufacturers} />

      <Box display="flex" flexDirection="row" sx={{ width: "100%", gap: 2 }}>
        {/* left : sideBarFilter */}
        <FilterSideBar onFilterChange={handleFilterChange} />
        {/* right: filter + list products */}
        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {/* filter */}
          <Box display="flex" justifyContent="flex-end" p={2} mb={2}>
            <Autocomplete
              sx={{ width: 200, height: 32, background: colors.primary[400] }}
              options={options}
              value={selectedValue}
              onChange={(_event, newValue) => setSelectedValue(newValue || "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 32, // set height của input
                      minHeight: "32px",
                    },
                  }}
                />
              )}
            />
          </Box>
          {/* list variants  */}
          <Box sx={{ overflow: "hidden" }}>
            <ProductVariantList data={filteredVariants} />
          </Box>
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_event, page) => {
                  getListProductByCategoryId(Number(categoryId), page - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductsByCategory;
