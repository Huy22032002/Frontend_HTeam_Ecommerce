import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme/theme";
import { ManufacturerApi } from "../../api/manufacturer/manufacturerApi";
import { CategoryApi } from "../../api/catalog/CategoryApi";
import type { Manufacturer } from "../../models/manufacturer/Manufacturer";
import type { Category } from "../../models/catalogs/Category";

interface FilterSideBarProps {
  onFilterChange?: (filters: {
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    hasSalePrice?: boolean;
    manufacturers?: string[];
    categories?: string[];
  }) => void;
  hideCategories?: boolean;
}

const FilterSideBar = ({ onFilterChange, hideCategories }: FilterSideBarProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const priceRanges = [
    { label: "Dưới 1 triệu", min: 0, max: 1000000 },
    { label: "1 - 2 triệu", min: 1000000, max: 2000000 },
    { label: "2 - 5 triệu", min: 2000000, max: 5000000 },
    { label: "5 - 10 triệu", min: 5000000, max: 10000000 },
    { label: "10 - 15 triệu", min: 10000000, max: 15000000 },
    { label: "15 - 20 triệu", min: 15000000, max: 20000000 },
  ];

  const [selectedPrice, setSelectedPrice] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [availableOnly, setAvailableOnly] = useState(false);
  const [hasSalePrice, setHasSalePrice] = useState(false);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch manufacturers on component mount
  useEffect(() => {
    const fetchManufacturers = async () => {
      const data = await ManufacturerApi.getAll();
      if (data) {
        setManufacturers(data);
      }
    };
    fetchManufacturers();
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryApi.getAll();
        if (response.data) {
          // API trả về { content: [...], totalPages: ... }
          const categoryList = response.data.content || response.data;
          if (Array.isArray(categoryList)) {
            setCategories(categoryList);
            console.log("Loaded categories:", categoryList);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handlePriceChange = (min: number, max: number) => {
    const newPrice = selectedPrice.min === min && selectedPrice.max === max 
      ? {} 
      : { min, max };
    setSelectedPrice(newPrice);
  };

  const handleAvailableChange = (checked: boolean) => {
    setAvailableOnly(checked);
  };

  const handleSalePriceChange = (checked: boolean) => {
    setHasSalePrice(checked);
  };

  const handleManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturers((prev) =>
      prev.includes(manufacturer)
        ? prev.filter((m) => m !== manufacturer)
        : [...prev, manufacturer]
    );
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleApplyFilters = () => {
    onFilterChange?.({
      minPrice: selectedPrice.min,
      maxPrice: selectedPrice.max,
      available: availableOnly || undefined,
      hasSalePrice: hasSalePrice || undefined,
      manufacturers: selectedManufacturers.length > 0 ? selectedManufacturers : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedPrice({});
    setAvailableOnly(false);
    setHasSalePrice(false);
    setSelectedManufacturers([]);
    setSelectedCategories([]);
    onFilterChange?.({
      minPrice: undefined,
      maxPrice: undefined,
      available: undefined,
      hasSalePrice: undefined,
      manufacturers: undefined,
      categories: undefined,
    });
  };

  return (
    <Box
      sx={{
        p: 2,
        border: `1px solid ${colors.primary[900]}`,
        borderRadius: 4,
        background: `${colors.primary[400]}`,
        position: "sticky",
        top: 20,
      }}
    >
      {/* Khoảng Giá */}
      <Typography fontWeight="bold" variant="h5">
        Khoảng Giá
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.5,
        }}
      >
        {priceRanges.map(({ label, min, max }) => (
          <FormControlLabel
            key={label}
            control={
              <Checkbox
                size="small"
                checked={selectedPrice.min === min && selectedPrice.max === max}
                onChange={() => handlePriceChange(min, max)}
              />
            }
            label={label}
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              alignItems: "center",
              "& .MuiFormControlLabel-label": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        ))}
      </Box>

      {/* Tình trạng */}
      <Typography fontWeight="bold" variant="h5" sx={{ mt: 2 }}>
        Tình trạng
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.5,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={availableOnly}
              onChange={(e) => handleAvailableChange(e.target.checked)}
            />
          }
          label="Còn hàng"
          sx={{
            "& .MuiFormControlLabel-label": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      </Box>

      {/* Khuyến Mãi */}
      <Typography fontWeight="bold" variant="h5" sx={{ mt: 2 }}>
        Khuyến Mãi
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.5,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={hasSalePrice}
              onChange={(e) => handleSalePriceChange(e.target.checked)}
            />
          }
          label="Có giảm giá"
          sx={{
            "& .MuiFormControlLabel-label": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      </Box>

      {/* Hãng Sản Xuất */}
      <Typography fontWeight="bold" variant="h5" sx={{ mt: 2 }}>
        Hãng Sản Xuất
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.5,
        }}
      >
        {manufacturers.map((manufacturer) => (
          <FormControlLabel
            key={manufacturer.id}
            control={
              <Checkbox
                size="small"
                checked={selectedManufacturers.includes(manufacturer.name)}
                onChange={() => handleManufacturerChange(manufacturer.name)}
              />
            }
            label={manufacturer.name}
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              alignItems: "center",
              "& .MuiFormControlLabel-label": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        ))}
      </Box>

      {/* Danh Mục */}
      {!hideCategories && (
        <>
          <Typography fontWeight="bold" variant="h5" sx={{ mt: 2 }}>
            Danh Mục
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
            }}
          >
            {categories.map((category: any) => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryChange(category.name)}
                  />
                }
                label={category.name}
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  alignItems: "center",
                  "& .MuiFormControlLabel-label": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            ))}
          </Box>
        </>
      )}

      {/* Nút áp dụng / Xóa bộ lọc */}
      <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={handleApplyFilters}
          sx={{
            bgcolor: "primary.main",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Áp dụng
        </Button>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={handleClearFilters}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Xóa
        </Button>
      </Box>
    </Box>
  );
};

export default FilterSideBar;
