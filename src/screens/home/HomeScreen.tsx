import { Box, Typography, useTheme } from "@mui/material";
import useHome from "./Home.hook";
import CategoryItem from "../../components/CategoryItem";
import { useEffect } from "react";
import { tokens } from "../../theme/theme";

const HomeScreen = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { categories, getAllCategories } = useHome();

  useEffect(() => {
    getAllCategories();
  }, []);

  return (
    <Box
      p={4}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: colors.greenAccent[900],
      }}
    >
      {/* header */}
      {/* banner */}
      <Box sx={{ width: "100%", maxWidth: 1200, mb: 4 }}>
        <img
          src="/src/assets/banner.jpg"
          alt="Banner"
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
          }}
        />
      </Box>

      {/* category */}
      <Typography fontWeight="bold" textAlign="start" variant="h2">
        Danh mục nổi bật
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
          mt: 2,
        }}
      >
        {categories.map((c) => (
          <CategoryItem key={c.id} category={c} />
        ))}
      </Box>

      {/* suggestion */}
      {/* products */}
      {/* footer */}
    </Box>
  );
};

export default HomeScreen;
