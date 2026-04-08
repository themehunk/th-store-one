import { __ } from '@wordpress/i18n';
import './live-style.css';

/* ================= ICON GENERATOR ================= */
const getVideoIcon = (type, color) => {
  const clr = color || "#e3e3e3";

  switch (type) {
    case "triangle":
      return (
        <svg viewBox="0 0 24 24" width="34" height="34">
          <polygon points="8,5 19,12 8,19" fill={clr} />
        </svg>
      );

    case "camera":
      return (
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke={clr} strokeWidth="2">
          <rect x="3" y="6" width="11" height="12" rx="2" />
          <polygon points="16,9 21,6 21,18 16,15" />
        </svg>
      );

    case "youtube":
      return (
        <svg viewBox="0 0 68 48" width="36" height="26">
          <rect width="68" height="48" rx="10" fill={clr} />
          <polygon points="28,18 28,30 42,24" fill="#fff" />
        </svg>
      );

    case "circle":
      return (
        <svg viewBox="0 0 24 24" width="34" height="34">
          <circle cx="12" cy="12" r="10" fill={clr} />
          <polygon points="10,8 16,12 10,16" fill="#fff" />
        </svg>
      );

    case "outline":
    default:
      return (
        <svg viewBox="0 0 24 24" width="34" height="34">
          <circle cx="12" cy="12" r="10" fill="none" stroke={clr} strokeWidth="2" />
          <polygon points="10,8 16,12 10,16" fill={clr} />
        </svg>
      );
  }
};

/* ================= PREVIEW ================= */
const PreviewProductVideo = ({ settings = {},activeTab = "gallery"  }) => {

  //active tab settings se aayega
  const isFeatured = activeTab === "featured";

  //dynamic icon switch
  const iconType = isFeatured
    ? settings?.ficon || "outline"
    : settings?.icon || "outline";

  const iconColor = isFeatured
    ? settings?.ficon_clr || "#e3e3e3"
    : settings?.icon_clr || "#e3e3e3";

  return (
    <div className="s1-preview-wrap">

      {/* ================= GALLERY PREVIEW ================= */}
      {!isFeatured && (
        <div className="s1-product-preview s1-video-preview">
          <div className="s1-main-product">

            <div className="s1-main-thumb">
              <div className="static-skeleton static-main-img"></div>

              <span className="th-video-thumb-icon">
                {getVideoIcon(iconType, iconColor)}
              </span>
            </div>

            <div className="s1-main-info">
              <div className="static-skeleton static-title"></div>
              <div className="static-skeleton static-price"></div>

              <div className="s1-main-cart">
                <div className="static-skeleton static-qty"></div>
                <div className="static-skeleton static-btn"></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= FEATURED (SHOP) PREVIEW ================= */}
      {isFeatured && (
        <div className="s1-product-preview s1-shop-preview">

          <div className="s1-preview-product s1-shop-video s1-trust-badges">
        
        <div className="s1-preview-image-skeleton">
          <span className="th-video-thumb-icon">
                {getVideoIcon(iconType, iconColor)}
              </span>
        </div>
        <div className="s1-preview-title-skeleton">
          <span />
          <span />
        </div>

        <div className="s1-preview-price-skeleton" />
      </div>

          </div>

       
      )}

    </div>
  );
};

export default PreviewProductVideo;