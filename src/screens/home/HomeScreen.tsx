import { Box, useTheme } from "@mui/material";
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
      {categories.length > 0 &&
        categories.map((c) => <CategoryItem key={c.id} category={c} />)}
      {/* suggestion */}
      {/* products */}
      {/* footer */}
    </Box>
  );
};

export default HomeScreen;
