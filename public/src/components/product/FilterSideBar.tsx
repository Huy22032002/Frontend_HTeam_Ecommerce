import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme,
  Button,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../theme/theme";
import { ManufacturerApi } from "../../api/manufacturer/manufacturerApi";
import { CategoryApi } from "../../api/catalog/CategoryApi";
import type { Manufacturer } from "../../models/manufacturer/Manufacturer";

interface FilterSideBarProps {
  onFilterChange?: (filters: {
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    hasSalePrice?: boolean;
    manufacturers?: string[];
    categories?: string[];
    sortBy?: string;
    sortOrder?: string;
  }) => void;
  hideCategories?: boolean;
}

const FilterSideBar = ({ onFilterChange, hideCategories }: FilterSideBarProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [hasSalePrice, setHasSalePrice] = useState(false);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");

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
    // Clear previous errors
    setValidationError("");

    // Parse values
    const minPrice = minPriceInput.trim() ? parseFloat(minPriceInput) : undefined;
    const maxPrice = maxPriceInput.trim() ? parseFloat(maxPriceInput) : undefined;

    // Validation rules
    if (minPriceInput.trim() && isNaN(minPrice!)) {
      setValidationError("❌ Giá tối thiểu phải là số hợp lệ");
      return;
    }

    if (maxPriceInput.trim() && isNaN(maxPrice!)) {
      setValidationError("❌ Giá tối đa phải là số hợp lệ");
      return;
    }

    if (minPrice !== undefined && minPrice < 0) {
      setValidationError("❌ Giá tối thiểu không thể âm");
      return;
    }

    if (maxPrice !== undefined && maxPrice < 0) {
      setValidationError("❌ Giá tối đa không thể âm");
      return;
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      setValidationError("❌ Giá tối thiểu không thể lớn hơn giá tối đa");
      return;
    }

    // Optional: warn if price range is too large
    if (minPrice !== undefined && maxPrice !== undefined) {
      const range = maxPrice - minPrice;
      if (range > 100000000) {
        // More than 100 million
        setValidationError("⚠️ Khoảng giá rất lớn, kết quả có thể không chính xác");
      }
    }

    onFilterChange?.({
      minPrice,
      maxPrice,
      available: availableOnly || undefined,
      hasSalePrice: hasSalePrice || undefined,
      manufacturers: selectedManufacturers.length > 0 ? selectedManufacturers : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy: sortBy || "newest",
      sortOrder: sortOrder || "desc",
    });
  };

  const handleClearFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setValidationError("");
    setAvailableOnly(false);
    setHasSalePrice(false);
    setSelectedManufacturers([]);
    setSelectedCategories([]);
    setSortBy("newest");
    setSortOrder("desc");
    onFilterChange?.({
      minPrice: undefined,
      maxPrice: undefined,
      available: undefined,
      hasSalePrice: undefined,
      manufacturers: undefined,
      categories: undefined,
      sortBy: "newest",
      sortOrder: "desc",
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
          display: "flex",
          gap: 1,
          mb: 2,
        }}
      >
        <TextField
          type="number"
          placeholder="Từ (₫)"
          value={minPriceInput}
          onChange={(e) => {
            setMinPriceInput(e.target.value);
            setValidationError(""); // Clear error on input change
          }}
          size="small"
          inputProps={{
            min: 0,
            step: 1000,
          }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              fontSize: 12,
            },
          }}
        />
        <TextField
          type="number"
          placeholder="Đến (₫)"
          value={maxPriceInput}
          onChange={(e) => {
            setMaxPriceInput(e.target.value);
            setValidationError(""); // Clear error on input change
          }}
          size="small"
          inputProps={{
            min: 0,
            step: 1000,
          }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              fontSize: 12,
            },
          }}
        />
      </Box>

      {/* Validation Error Message */}
      {validationError && (
        <Box
          sx={{
            mb: 2,
            p: 1,
            bgcolor: validationError.includes("⚠️") ? "#fff3cd" : "#f8d7da",
            border: `1px solid ${validationError.includes("⚠️") ? "#ffc107" : "#f5c6cb"}`,
            borderRadius: 1,
            color: validationError.includes("⚠️") ? "#856404" : "#721c24",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          {validationError}
        </Box>
      )}

      {/* Sắp xếp */}
      <Typography fontWeight="bold" variant="h5" sx={{ mt: 2 }}>
        Sắp xếp
      </Typography>
      <Select
        fullWidth
        size="small"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        sx={{ mb: 1 }}
      >
        <MenuItem value="newest">Mới nhất</MenuItem>
        <MenuItem value="price">Theo giá</MenuItem>
        <MenuItem value="rating">Theo rating</MenuItem>
        <MenuItem value="sold">Bán chạy nhất</MenuItem>
      </Select>

      <Select
        fullWidth
        size="small"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="asc">Tăng dần</MenuItem>
        <MenuItem value="desc">Giảm dần</MenuItem>
      </Select>

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
