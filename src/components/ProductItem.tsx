import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../theme/theme";

const ProductItem = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: colors.primary[900],
        padding: 2,
        display: "flex",
        "&:hover .product-img": {},
        "&:hover .product-name": {
          textDecoration: "underline",
        },
      }}
    >
      <CardMedia>
        <img
          className="product-img"
          src="/src/assests/banner.jpg"
          width="90&"
        />
      </CardMedia>

      <CardContent>
        <Typography className="product-name">Name</Typography>
        <Typography sx={{ color: colors.redAccent[500] }}>Price</Typography>
        <Typography>Voucher</Typography>
        <Box display="flex" flexDirection="row">
          <Typography>Màu</Typography>
          {/* list product option value */}
        </Box>
        <Typography sx={{ color: colors.grey[500] }}>Thong so 9</Typography>
      </CardContent>
    </Card>
  );
};

export default ProductItem;
