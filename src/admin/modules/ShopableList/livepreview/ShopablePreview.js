import "./live-style.css";
import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useState } from "@wordpress/element";
import { Icon } from "@wordpress/components";
import { desktop, tablet, mobile } from "@wordpress/icons";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";

import PreviewCard from "./PreviewCard";
import PreviewPopup from "./PreviewPopup";
import { buildCards, useProducts, usePlayback } from "./usePreviewCards";
import useDeviceStore from "@th-storeone/store/device-store";

const DEVICES = {
  Desktop: { icon: desktop, width: "100%", maxColumns: Infinity },
  Tablet: { icon: tablet, width: "768px", maxColumns: 3 },
  Mobile: { icon: mobile, width: "375px", maxColumns: 2 },
};

const ShopablePreview = ({ settings = {}, variant = "style1" }) => {
  const s = settings || {};

  // Shared with the responsive controls of the settings panel.
  const device = useDeviceStore((state) => state.device);
  const setDevice = useDeviceStore((state) => state.setDevice);
  const activeDevice = DEVICES[device] ? device : "Desktop";

  /* SETTINGS */
  const isSlider = s?.slider?.enabled;
  const autoplay = s?.slider?.autoplay;
  const navigation = s?.slider?.navigation;

  // Same breakpoints as the frontend: tablet max 3, mobile max 2.
  const maxColumns = DEVICES[activeDevice].maxColumns;
  const columns = Math.min(Number(s?.columns || 3), maxColumns);
  const slides = Math.min(Number(s?.slider?.slides || 3), maxColumns);
  const gap = Number(s?.columns_gap || 15);

  const TitleTag = s?.title_tag || "h2";

  const currency = th_StoreOneAdmin?.currency_symbol || "$";
  const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

  /* CARDS / PRODUCTS / PLAYBACK - same behaviour as the frontend */
  const cards = buildCards(s, columns);
  const getProduct = useProducts(cards);
  const playback = usePlayback(cards, s);
  const [popupCard, setPopupCard] = useState(null);

  useEffect(() => {
    if (!s?.show_prd_popup) setPopupCard(null);
  }, [s?.show_prd_popup]);

  // In slider mode follow the card that is playing.
  const swiperRef = useRef(null);
  useEffect(() => {
    if (isSlider && playback.active >= 0) {
      swiperRef.current?.slideTo(playback.active, 500);
    }
  }, [isSlider, playback.active]);

  const renderCard = (items, i) => {
    const item = items[playback.itemIndex(i)];

    return (
      <PreviewCard
        variant={variant}
        s={s}
        item={item}
        product={getProduct(item.productId)}
        isActive={playback.allAutoPlay || playback.active === i}
        isPlaying={
          playback.allAutoPlay || (playback.active === i && playback.playing)
        }
        progress={playback.progress}
        showProgress={!playback.allAutoPlay}
        canPrev={playback.canJump(i, -1)}
        canNext={playback.canJump(i, 1)}
        onToggle={() => playback.toggleCard(i)}
        onOpenPopup={() => setPopupCard(i)}
        onJump={(dir) => playback.jump(i, dir)}
        videoRef={(el) => (playback.videoRefs.current[i] = el)}
        formatPrice={formatPrice}
      />
    );
  };

  return (
    <div className="s1-preview-wrap s1-recent-view">
      <div className="s1-sv-devices">
        {Object.keys(DEVICES).map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-pressed={activeDevice === name}
            className={activeDevice === name ? "is-active" : ""}
            onClick={() => setDevice(name)}
          >
            <Icon icon={DEVICES[name].icon} size={20} />
          </button>
        ))}
      </div>

      <div
        className={`s1-preview-device ${activeDevice.toLowerCase()}${
          activeDevice === "Desktop" ? "" : " s1-sv-compact"
        }`}
        style={{
          maxWidth: DEVICES[activeDevice].width,
          margin: "0 auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "12px",
          position: "relative",
          minHeight: popupCard !== null ? "520px" : undefined,
        }}
      >
        {/* TITLE */}
        {!s?.hide_title && (
          <TitleTag
            className="s1-sv-heading"
            style={{ color: s?.title_color || "#212121" }}
          >
            {s?.title || __("Shopable List", "th-store-one")}
          </TitleTag>
        )}

        {/* SLIDER */}
        {isSlider ? (
          <div
            className={`s1-slider-wrapper${
              variant === "style2" ? " s1-style-2" : ""
            }`}
          >
            <Swiper
              key={activeDevice}
              modules={[Navigation, Autoplay]}
              slidesPerView={slides}
              spaceBetween={gap}
              navigation={navigation}
              autoplay={autoplay ? { delay: 2500 } : false}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              className="s1-shopable-slider"
            >
              {cards.map((items, i) => (
                <SwiperSlide key={i}>{renderCard(items, i)}</SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          /* GRID */
          <div
            className={variant === "style2" ? "s1-style-2" : undefined}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: `${gap}px`,
            }}
          >
            {cards.map((items, i) => (
              <div key={i}>{renderCard(items, i)}</div>
            ))}
          </div>
        )}

        {popupCard !== null && (
          <PreviewPopup
            key={popupCard}
            cards={cards}
            startCard={popupCard}
            getProduct={getProduct}
            formatPrice={formatPrice}
            onClose={() => setPopupCard(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ShopablePreview;
