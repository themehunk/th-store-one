import { __ } from "@wordpress/i18n";
import "./live-style.css";

/* ================= ICON GENERATOR ================= */
const getVideoIcon = (type, color) => {
  const clr = color || "#7388FFBA";

  switch (type) {
    case "triangle":
      return (
        <svg viewBox="0 0 24 24" width="34" height="34">
          <polygon points="8,5 19,12 8,19" fill={clr} />
        </svg>
      );

    case "camera":
      return (
        <svg
          viewBox="0 0 24 24"
          width="34"
          height="34"
          fill="none"
          stroke={clr}
          strokeWidth="2"
        >
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
      return (
        <svg
          width="34"
          height="34"
          fill={clr}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"></path>
          </g>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" width="34" height="34">
          <circle cx="12" cy="12" r="10" fill={clr} />
          <polygon points="10,8 16,12 10,16" fill="#fff" />
        </svg>
      );
  }
};
const getAspectClass = (aspect) => {
  if (!aspect || aspect === "default") return "th-aspect-16-9";

  switch (aspect) {
    case "16:9":
      return "th-aspect-16-9";
    case "9:16":
      return "th-aspect-9-16";
    case "4:3":
      return "th-aspect-4-3";
    case "3:2":
      return "th-aspect-3-2";
    case "1:1":
      return "th-aspect-1-1";
    case "auto":
      return "th-aspect-auto";
    default:
      return "th-aspect-16-9";
  }
};
/* ================= PREVIEW ================= */
const PreviewProductVideo = ({ settings = {}, activeTab = "gallery" }) => {
  //active tab settings se aayega
  const isFeatured = activeTab === "featured";

  //dynamic icon switch
  const iconType = isFeatured
    ? settings?.ficon || "outline"
    : settings?.icon || "outline";

  const iconColor = isFeatured
    ? settings?.ficon_clr || "#e3e3e3"
    : settings?.icon_clr || "#e3e3e3";

  const aspect = isFeatured
    ? settings?.aspectShop || "default"
    : settings?.aspect || "default";

  const aspectClass = getAspectClass(aspect);

  return (
    <div className="s1-preview-wrap">
      {/* ================= GALLERY PREVIEW ================= */}
      {!isFeatured && (
        <div className="s1-product-preview s1-video-preview">
          <div className="s1-main-product">
            <div className={`s1-main-thumb ${aspectClass}`}>
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
            <div
              className={`s1-preview-image-skeleton ${aspectClass}`}
              style={{
                "--overlay-color": settings?.foverlay || "rgba(0, 0, 0, 0.35)",
              }}
            >
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
