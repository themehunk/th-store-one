import "./live-style.css";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";

const Style1 = ({ settings = {} }) => {
  const s = settings || {};

  const devices = s?.visibility?.devices || [];
  const [previewDevice] = useState(devices[0] || "desktop");

  const activeDevice = devices.includes(previewDevice)
    ? previewDevice
    : "desktop";

  const getPreviewWidth = () => {
    if (activeDevice === "mobile") return "375px";
    if (activeDevice === "tablet") return "768px";
    return "100%";
  };

  /* SETTINGS */
  const isSlider = s?.slider?.enabled;
  const slides = Number(s?.slider?.slides || 3);
  const autoplay = s?.slider?.autoplay;
  const navigation = s?.slider?.navigation;

  const columns = Number(s?.columns || 3);
  const gap = Number(s?.columns_gap || 15);
  const products = Number(s?.products || 6);

  /* SKELETON CARD */
  const SkeletonCard = () => (
    <div className="s1-product-skeleton-card">
      <div className="s1-skeleton s1-image-skeleton"></div>

      <div className="s1-title-lines">
        <div className="s1-skeleton line"></div>
        <div className="s1-skeleton line small"></div>
      </div>

      <div className="s1-skeleton s1-price-skeleton"></div>

      <div className="s1-skeleton s1-btn-skeleton"></div>
    </div>
  );

  return (
    <div className="s1-preview-wrap s1-recent-view">
      <div
        className={`s1-preview-device ${activeDevice}`}
        style={{
          maxWidth: getPreviewWidth(),
          margin: "0 auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "12px",
        }}
      >
        {/* TITLE */}
        {!s?.hide_title && (
          <div
            style={{
              marginBottom: "20px",
              fontSize: "18px",
              fontWeight: "600",
              color: s?.title_color || "#212121",
            }}
          >
            {s?.title || __("Recently Viewed", "th-store-one")}
          </div>
        )}

        {/* SLIDER */}
        {isSlider ? (
          <div className="s1-slider-wrapper">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={slides}
              spaceBetween={gap}
              navigation={navigation}
              autoplay={autoplay ? { delay: 2500 } : false}
              className="s1-custom-swiper s1-recent-view s1-recent-slider"
            >
              {[...Array(products)].map((_, i) => (
                <SwiperSlide key={i}>
                  <SkeletonCard />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          /* GRID (ONLY 3 ITEMS) */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(3, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Style1;
