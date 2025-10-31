import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  useTheme,
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
  } = useProductByCategory();

  useEffect(() => {
    if (categoryId) {
      getListManufacturerByCategory(Number(categoryId));
      getListProductByCategoryId(Number(categoryId));
    }
  }, [categoryId]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        px: 20,
        background: colors.greenAccent[700],
        paddingBottom: 4,
      }}
    >
      {/* title */}
      <Typography my={2} fontWeight="bold" variant="h2">
        {categoryName || ""}
      </Typography>

      {/* list manufacturers  */}
      <ManufacturerTabs items={manufacturers} />

      <Box display="flex" flexDirection="row">
        {/* left : sideBarFilter */}
        <FilterSideBar />
        {/* right: filter + list products */}
        <Box>
          {/* filter */}
          <Box display="flex" justifyContent="flex-end" p={2} mb={2}>
            <Autocomplete
              sx={{ width: 200, height: 32, background: colors.primary[400] }}
              options={options}
              value={selectedValue}
              onChange={(event, newValue) => setSelectedValue(newValue || "")}
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
          <ProductVariantList data={variants} />
        </Box>
      </Box>
    </Box>
  );
};

export default ProductsByCategory;
