import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "swiper/css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
          src="./banner3.jpg"
          alt="banner1"
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
            height: 400,
          }}
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="./banner.jpg"
          alt="banner2"
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
            height: 400,
          }}
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="./banner2.jpg"
          alt="banner3"
          style={{
            width: "100%",
            borderRadius: 8,
            objectFit: "cover",
            height: 400,
          }}
        />
      </SwiperSlide>
    </Swiper>
  );
};

export default BannerSlider;
