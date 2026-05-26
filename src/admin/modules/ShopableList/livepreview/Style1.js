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
    <div className="s1-shopable-card">
      <div className="s1-shopable-media">
        <div className="s1-skeleton s1-shopable-video"></div>
        <div className="s1-video-play-icon">▶</div>

        <div className="s1-shopable-actions">
          <div className="s1-skeleton s1-action-icon"></div>
          <div className="s1-skeleton s1-action-icon"></div>
          <div className="s1-skeleton s1-action-icon"></div>
        </div>

        <div className="s1-shopable-product-bar">
          <div className="s1-shopable-product-left">
            <div className="s1-skeleton s1-product-thumb"></div>

            <div className="s1-shopable-product-content">
              <div className="s1-skeleton s1-product-title"></div>
              <div className="s1-skeleton s1-product-price"></div>
            </div>
          </div>

          <div className="s1-skeleton s1-cart-button"></div>
        </div>
      </div>
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
            {s?.title || __("Shopable List", "th-store-one")}
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
              className="s1-shopable-slider"
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
