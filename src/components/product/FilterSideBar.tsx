import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme/theme";

const FilterSideBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        p: 2,
        border: `1px solid ${colors.primary[900]}`,
        borderRadius: 4,
        marginTop: 2,
        background: `${colors.primary[400]}`,
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
        {[
          "Dưới 1 triệu",
          "1 - 2 triệu",
          "2 - 5 triệu",
          "5 - 10 triệu",
          "10 - 15 triệu",
          "15 - 20 triệu",
        ].map((label) => (
          <FormControlLabel
            key={label}
            control={<Checkbox size="small" />}
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
        {["Mới, Sealed", "Mới, Full box", "Used"].map((label) => (
          <FormControlLabel
            key={label}
            control={<Checkbox size="small" />}
            label={label}
            sx={{
              "& .MuiFormControlLabel-label": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        ))}
      </Box>

      {/* Nguồn hàng */}
      <Typography fontWeight="bold" variant="h5" sx={{ mt: 2 }}>
        Nguồn hàng
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.5,
        }}
      >
        {["Chính hãng", "Nhập khẩu"].map((label) => (
          <FormControlLabel
            key={label}
            control={<Checkbox size="small" />}
            label={label}
            sx={{
              "& .MuiFormControlLabel-label": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        ))}
      </Box>

      {/* Khuyến mại */}
      <Typography fontWeight="bold" variant="h5" sx={{ mt: 2 }}>
        Khuyến mại
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.5,
        }}
      >
        {["Có quà tặng"].map((label) => (
          <FormControlLabel
            key={label}
            control={<Checkbox size="small" />}
            label={label}
            sx={{
              "& .MuiFormControlLabel-label": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FilterSideBar;
