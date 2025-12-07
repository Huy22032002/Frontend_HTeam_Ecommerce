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
<<<<<<< HEAD:public/src/models/BannerSlider.tsx
          src="./src/assets/banner.jpg"
=======
          src="./banner3.jpg"
>>>>>>> d37e9e9e6e723b322142a1c6c726525497d1679c:src/models/BannerSlider.tsx
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
<<<<<<< HEAD:public/src/models/BannerSlider.tsx
          src="./src/assets/banner.jpg"
=======
          src="./banner.jpg"
>>>>>>> d37e9e9e6e723b322142a1c6c726525497d1679c:src/models/BannerSlider.tsx
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
<<<<<<< HEAD:public/src/models/BannerSlider.tsx
          src="./src/assets/banner2.jpg"
=======
          src="./banner2.jpg"
>>>>>>> d37e9e9e6e723b322142a1c6c726525497d1679c:src/models/BannerSlider.tsx
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
