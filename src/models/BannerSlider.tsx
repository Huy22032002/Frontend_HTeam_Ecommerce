import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../styles/BannerSlider.css";
//icons

const BannerSlider = () => {
  return (
    <Swiper
      modules={[Autoplay, Navigation]}
      spaceBetween={30}
      slidesPerView={1}
      loop
      autoplay={{ delay: 3000 }}
      navigation
    >
      <SwiperSlide>
        <img
          src="/src/assets/banner.jpg"
          alt="banner1"
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
            height: 320,
          }}
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="/src/assets/banner.jpg"
          alt="banner2"
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
            height: 320,
          }}
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="/src/assets/banner.jpg"
          alt="banner3"
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
            height: 320,
          }}
        />
      </SwiperSlide>
    </Swiper>
  );
};

export default BannerSlider;
