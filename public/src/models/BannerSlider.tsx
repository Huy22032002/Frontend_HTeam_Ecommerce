import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "swiper/css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "swiper/css/navigation";
import "../styles/BannerSlider.css";
import { useBannerApi } from "../api/cms/BannerApi";

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

const BannerSlider = () => {
  const { getActiveBanners } = useBannerApi();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data);
      } catch (error) {
        console.error("Error loading banners:", error);
        // Fallback to default banners if API fails
        setBanners([
          {
            id: 1,
            title: "Banner 1",
            imageUrl: "./banner3.jpg",
            displayOrder: 0,
            active: true,
          },
          {
            id: 2,
            title: "Banner 2",
            imageUrl: "./banner.jpg",
            displayOrder: 1,
            active: true,
          },
          {
            id: 3,
            title: "Banner 3",
            imageUrl: "./banner2.jpg",
            displayOrder: 2,
            active: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [getActiveBanners]);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 400,
          borderRadius: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (banners.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 400,
          borderRadius: 2,
          bgcolor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Chưa có banner nào
      </Box>
    );
  }

  return (
    <Swiper
      modules={[Autoplay, Navigation]}
      spaceBetween={30}
      slidesPerView={1}
      loop
      autoplay={{ delay: 3000 }}
      navigation
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <img
            src={banner.imageUrl}
            alt={banner.title}
            style={{
              width: "100%",
              borderRadius: 8,
              objectFit: "cover",
              height: 400,
            }}
            title={banner.description}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default BannerSlider;
