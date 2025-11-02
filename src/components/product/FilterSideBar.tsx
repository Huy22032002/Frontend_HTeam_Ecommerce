import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme,
  Button,
  Collapse,
  Stack,
} from "@mui/material";
import { tokens } from "../../theme/theme";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface FilterSideBarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  priceRanges: string[];
  conditions: string[];
  sources: string[];
  hasPromotion: boolean;
}

const FilterSideBar = ({ onFilterChange }: FilterSideBarProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [filters, setFilters] = useState<FilterState>({
    priceRanges: [],
    conditions: [],
    sources: [],
    hasPromotion: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    condition: true,
    source: true,
    promotion: false,
  });

  const priceRanges = [
    { label: "Dưới 1 triệu", value: "0-1000000" },
    { label: "1 - 2 triệu", value: "1000000-2000000" },
    { label: "2 - 5 triệu", value: "2000000-5000000" },
    { label: "5 - 10 triệu", value: "5000000-10000000" },
    { label: "10 - 15 triệu", value: "10000000-15000000" },
    { label: "15 - 20 triệu", value: "15000000-20000000" },
  ];

  const conditions = [
    { label: "Mới, Sealed", value: "new_sealed" },
    { label: "Mới, Full box", value: "new_fullbox" },
    { label: "Used", value: "used" },
  ];

  const sources = [
    { label: "Chính hãng", value: "authentic" },
    { label: "Nhập khẩu", value: "imported" },
  ];

  const handlePriceChange = (value: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      priceRanges: checked
        ? [...prev.priceRanges, value]
        : prev.priceRanges.filter((p) => p !== value),
    }));
  };

  const handleConditionChange = (value: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      conditions: checked
        ? [...prev.conditions, value]
        : prev.conditions.filter((c) => c !== value),
    }));
  };

  const handleSourceChange = (value: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      sources: checked
        ? [...prev.sources, value]
        : prev.sources.filter((s) => s !== value),
    }));
  };

  const handlePromotionChange = (checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      hasPromotion: checked,
    }));
  };

  // Gọi callback khi filter thay đổi
  const applyFilters = () => {
    onFilterChange?.(filters);
  };

  // Tự động apply filter khi có thay đổi
  // (bạn có thể comment lại nếu muốn button "Áp dụng")
  // useEffect(() => {
  //   applyFilters();
  // }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Box
      sx={{
        p: 2,
        border: `1px solid ${colors.primary[900]}`,
        borderRadius: 2,
        marginTop: 2,
        marginRight: 2,
        background: colors.primary[400],
        width: { xs: "100%", md: 280 },
        flexShrink: 0,
      }}
    >
      {/* Khoảng Giá */}
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => toggleSection("price")}
          sx={{ cursor: "pointer", mb: 1 }}
        >
          <Typography fontWeight="bold" variant="h6">
            💰 Khoảng Giá
          </Typography>
          {expandedSections.price ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </Box>
        <Collapse in={expandedSections.price} timeout="auto" unmountOnExit>
          <Stack spacing={0.5}>
            {priceRanges.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.priceRanges.includes(item.value)}
                    onChange={(e) =>
                      handlePriceChange(item.value, e.target.checked)
                    }
                  />
                }
                label={item.label}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            ))}
          </Stack>
        </Collapse>
      </Box>

      {/* Tình trạng */}
      <Box sx={{ mt: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => toggleSection("condition")}
          sx={{ cursor: "pointer", mb: 1 }}
        >
          <Typography fontWeight="bold" variant="h6">
            📦 Tình trạng
          </Typography>
          {expandedSections.condition ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </Box>
        <Collapse in={expandedSections.condition} timeout="auto" unmountOnExit>
          <Stack spacing={0.5}>
            {conditions.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.conditions.includes(item.value)}
                    onChange={(e) =>
                      handleConditionChange(item.value, e.target.checked)
                    }
                  />
                }
                label={item.label}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            ))}
          </Stack>
        </Collapse>
      </Box>

      {/* Nguồn hàng */}
      <Box sx={{ mt: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => toggleSection("source")}
          sx={{ cursor: "pointer", mb: 1 }}
        >
          <Typography fontWeight="bold" variant="h6">
            🏪 Nguồn hàng
          </Typography>
          {expandedSections.source ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </Box>
        <Collapse in={expandedSections.source} timeout="auto" unmountOnExit>
          <Stack spacing={0.5}>
            {sources.map((item) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.sources.includes(item.value)}
                    onChange={(e) =>
                      handleSourceChange(item.value, e.target.checked)
                    }
                  />
                }
                label={item.label}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            ))}
          </Stack>
        </Collapse>
      </Box>

      {/* Khuyến mại */}
      <Box sx={{ mt: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => toggleSection("promotion")}
          sx={{ cursor: "pointer", mb: 1 }}
        >
          <Typography fontWeight="bold" variant="h6">
            🎁 Khuyến mại
          </Typography>
          {expandedSections.promotion ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </Box>
        <Collapse in={expandedSections.promotion} timeout="auto" unmountOnExit>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={filters.hasPromotion}
                onChange={(e) => handlePromotionChange(e.target.checked)}
              />
            }
            label="Chỉ hiển thị có khuyến mại"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.9rem",
              },
            }}
          />
        </Collapse>
      </Box>

      {/* Action Buttons */}
      <Stack spacing={1} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={applyFilters}
          sx={{
            bgcolor: colors.blueAccent[700],
            textTransform: "none",
            fontWeight: "600",
            "&:hover": { bgcolor: colors.blueAccent[800] },
          }}
        >
          ✓ Áp dụng
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            setFilters({
              priceRanges: [],
              conditions: [],
              sources: [],
              hasPromotion: false,
            });
          }}
          sx={{
            textTransform: "none",
            fontWeight: "600",
          }}
        >
          🔄 Xóa bộ lọc
        </Button>
      </Stack>
    </Box>
  );
};

export default FilterSideBar;
