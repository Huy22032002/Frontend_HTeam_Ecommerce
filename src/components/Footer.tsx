import {
  Box,
  Grid,
  Typography,
  IconButton,
  Link,
  Divider,
  useTheme,
} from "@mui/material";
import { Facebook, YouTube, Telegram, MusicNote } from "@mui/icons-material";
import { tokens } from "../theme/theme";

const Footer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      sx={{
        pt: 6,
        pb: 2,
        px: { xs: 2, md: 8 },
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <Grid container spacing={4}>
        {/* cột trái  */}
        <Grid component="section">
          <Typography
            variant="h5"
            sx={{ color: colors.blueAccent[500], fontWeight: 700 }}
          >
            HEcommerce
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <IconButton>
              <Facebook />
            </IconButton>
            <IconButton>
              <YouTube />
            </IconButton>
            <IconButton>
              <MusicNote />
            </IconButton>
            <IconButton>
              <Telegram />
            </IconButton>
          </Box>
        </Grid>
        {/* cột giữa  */}
        <Grid
          component="section"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Thông tin hữu ích
          </Typography>
          <Link variant="body2" href="#">
            Chính sách bảo hành
          </Link>
          <Link variant="body2" href="#">
            Chính sách đổi trả
          </Link>
          <Link variant="body2" href="#">
            Chính sách vận chuyển
          </Link>
          <Link variant="body2" href="#">
            Chính sách bảo mật
          </Link>
          <Link variant="body2" href="#">
            Hướng dẫn mua hàng online
          </Link>
          <Link variant="body2" href="#">
            Về chúng tôi
          </Link>
        </Grid>

        {/* cột phải */}
        <Grid component="section">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Hotline
          </Typography>
          <Typography>📞 1900.99.8888</Typography>
        </Grid>
      </Grid>

      {/* Dòng bản quyền */}
      <Divider sx={{ my: 4 }} />
      <Typography
        variant="body2"
        textAlign="center"
        sx={{ color: colors.grey[500] }}
      >
        © HEcommerce 2025 — Trang bán hàng uy tín tại Việt Nam. Điện thoại:
        0868661275.
      </Typography>
    </Box>
  );
};

export default Footer;
