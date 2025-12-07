import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import type { Category } from "../../models/catalogs/Category";
import { tokens } from "../../theme/theme";
import { useNavigate } from "react-router-dom";

const CategoryItem = ({ category }: { category: Category }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product-category/${category.id}`);
  };

  return (
    <Card
      sx={{
        maxWidth: 160,
        background: "transparent",
        boxShadow: "none",
      }}
      onClick={handleClick}
    >
      <CardActionArea
        sx={{
          textAlign: "center",
          "&:hover .category-name": {
            textDecoration: "underline",
          },
        }}
      >
        {/* wrapper cho image */}
        <Box
          sx={{
            borderRadius: 2,
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 100,
            "&:hover": {
              background: colors.greenAccent[500],
            },
          }}
        >
          <CardMedia
            component="img"
            image={category.imageUrl}
            title={category.code}
            sx={{
              maxHeight: "80px",
              objectFit: "contain",
              padding: "8px",
              "&:hover": {
                transform: "rotate(8deg)",
                transition: "all 0.3s ease",
              },
            }}
          />
        </Box>

        <CardContent sx={{ p: 1 }}>
          <Typography
            className="category-name"
            variant="subtitle1"
            fontWeight="bold"
          >
            {category.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryItem;
