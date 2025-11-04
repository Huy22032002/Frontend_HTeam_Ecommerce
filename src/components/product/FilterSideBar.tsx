import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import { useState } from "react";
import { tokens } from "../../theme/theme";

interface FilterSideBarProps {
  onFilterChange?: (filters: {
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
  }) => void;
}

const FilterSideBar = ({ onFilterChange }: FilterSideBarProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Price ranges mapping
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

  const handlePriceChange = (min: number, max: number) => {
    const newPrice = selectedPrice.min === min && selectedPrice.max === max 
      ? {} 
      : { min, max };
    setSelectedPrice(newPrice);
  };

  const handleAvailableChange = (checked: boolean) => {
    setAvailableOnly(checked);
  };

  const handleApplyFilters = () => {
    onFilterChange?.({
      minPrice: selectedPrice.min,
      maxPrice: selectedPrice.max,
      available: availableOnly || undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedPrice({});
    setAvailableOnly(false);
    onFilterChange?.({
      minPrice: undefined,
      maxPrice: undefined,
      available: undefined,
    });
  };

  return (
    <Box
      sx={{
        p: 2,
        border: `1px solid ${colors.primary[900]}`,
        borderRadius: 4,
        marginTop: 2,
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
