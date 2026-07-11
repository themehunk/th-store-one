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

  const productInfoPosition = s?.product_info_position || "bottom";

  const currency = th_StoreOneAdmin?.currency_symbol || "$";

  const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

  /* SKELETON CARD */
  const SkeletonCard = () => (
    <div
      className="s1-shopable-card"
      style={{
        borderStyle: s?.border?.style || "solid",
        borderColor: s?.border?.color || "transparent",

        borderTopWidth: s?.border?.width?.top || "0px",
        borderRightWidth: s?.border?.width?.right || "0px",
        borderBottomWidth: s?.border?.width?.bottom || "0px",
        borderLeftWidth: s?.border?.width?.left || "0px",

        borderTopLeftRadius: s?.border?.radius?.top || "0px",
        borderTopRightRadius: s?.border?.radius?.right || "0px",
        borderBottomRightRadius: s?.border?.radius?.bottom || "0px",
        borderBottomLeftRadius: s?.border?.radius?.left || "0px",

        overflow: "hidden",
      }}
    >
      <div
        className={`s1-shopable-media s1-product-info-${productInfoPosition}`}
      >
        <div className="s1-skeleton s1-shopable-video"></div>

        <div
          className="s1-video-play-icon"
          style={{
            background: s?.vicon_bg_color || "#000",
            color: s?.vicon_color || "#fff",
          }}
        >
          ▶
        </div>

        <div
          className="s1-shopable-product-bar"
          style={{
            borderRadius: s?.prd_cart_border_radius || "10px",
            background: s?.bg_color || "#fff",
          }}
        >
          <div className="s1-shopable-product-left">
            <div className="s1-skeleton s1-product-thumb"></div>

            <div className="s1-shopable-product-content">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                {/* Small Image Skeleton */}
                <div
                  className="s1-skeleton"
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    flexShrink: 0,
                  }}
                ></div>

                {/* Title */}
                <div
                  className="s1-product-title-text"
                  style={{
                    color: s?.prd_title_color || "#111",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Title
                </div>
                <div
                  className="s1-product-price-text"
                  style={{
                    color: s?.prd_price_color || "#111",
                  }}
                >
                  {formatPrice(299)}
                </div>
              </div>
            </div>
          </div>

          <button
            className="s1-cart-button"
            style={{
              background: s?.prd_cart_bg_color || "#22c55e",
              color: s?.prd_cart_icon_color || "#fff",

              width: "35px",
              height: "35px",

              minWidth: "35px",

              borderRadius: "50%",
              border: "none",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              padding: "0",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
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
