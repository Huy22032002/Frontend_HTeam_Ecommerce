import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from "@mui/material";
import type { Category } from "../models/catalogs/Category";
import { tokens } from "../theme/theme";

const CategoryItem = ({ category }: { category: Category }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Card
      sx={{
        maxWidth: 160,
        maxHeight: 169,
        background: "transparent",
        boxShadow: "none",
        "&:hover": {
          background: colors.greenAccent[500],
          textDecoration: "underline",
        },
      }}
    >
      <CardActionArea>
        <CardMedia
          component="img"
          className="card-media"
          image={category.imageUrl}
          title={category.code}
          sx={{
            height: 100,
            objectFit: "contain", // hình không bị méo
            p: 1,
            transition: "transform 0.4s ease", // mượt khi hover
            "&:hover": {
              transform: "rotate(4deg)",
            },
          }}
        />
        <CardContent>
          <Typography variant="subtitle1" align="center" fontWeight="bold">
            {category.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryItem;
