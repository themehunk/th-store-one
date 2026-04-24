import "./live-style.css";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";

const PreviewBuyNow = ({ settings = {} }) => {
  const s = settings || {};

  // devices
  const devices = s?.visibility?.devices || [];

  const [previewDevice, setPreviewDevice] = useState(devices[0] || "desktop");
  const [previewType, setPreviewType] = useState("single");

  const isOnlyMobile = devices.length === 1 && devices.includes("mobile");

  const activeDevice = isOnlyMobile
    ? "mobile"
    : devices.includes(previewDevice)
    ? previewDevice
    : devices[0] || "desktop";

  // width control
  const getPreviewWidth = () => {
    if (activeDevice === "mobile") return "375px";
    if (activeDevice === "tablet") return "768px";
    return "100%";
  };

  // Button Style (SYNC with backend)
  const getBtnStyle = () => {
    if (s?.btn_style !== "custom_btn_style") return {};

    return {
      background: s?.btn_bg_clr,
      color: s?.btn_text_clr,
      padding: `${s?.btn_padding?.top} ${s?.btn_padding?.right} ${s?.btn_padding?.bottom} ${s?.btn_padding?.left}`,
      borderStyle: s?.btn_border?.style,
      borderColor: s?.btn_border?.color,
      borderWidth: `${s?.btn_border?.width?.top} ${s?.btn_border?.width?.right} ${s?.btn_border?.width?.bottom} ${s?.btn_border?.width?.left}`,
      borderRadius: `${s?.btn_border?.radius?.top} ${s?.btn_border?.radius?.right} ${s?.btn_border?.radius?.bottom} ${s?.btn_border?.radius?.left}`,
    };
  };
  const isCustomStyle = s?.btn_style === "custom_btn_style";
  return (
    <div className="s1-preview-wrap">
      {/* 🔹 VIEW SWITCHER */}
      <div className="s1-style-tabs">
        <button
          className={`s1-style-tab ${previewType === "single" ? "active" : ""}`}
          onClick={() => setPreviewType("single")}
        >
          Single
        </button>

        <button
          className={`s1-style-tab ${previewType === "shop" ? "active" : ""}`}
          onClick={() => setPreviewType("shop")}
        >
          Shop
        </button>
      </div>

      {/* 🔹 DEVICE SWITCHER */}
      {devices.length > 1 && (
        <div className="s1-device-switcher s1-style-tabs">
          <button
            className={`s1-style-tab ${
              activeDevice === "desktop" ? "active" : ""
            }`}
            onClick={() => setPreviewDevice("desktop")}
            disabled={!devices.includes("desktop")}
          >
            Desktop
          </button>

          <button
            className={`s1-style-tab ${
              activeDevice === "tablet" ? "active" : ""
            }`}
            onClick={() => setPreviewDevice("tablet")}
            disabled={!devices.includes("tablet")}
          >
            Tablet
          </button>

          <button
            className={`s1-style-tab ${
              activeDevice === "mobile" ? "active" : ""
            }`}
            onClick={() => setPreviewDevice("mobile")}
            disabled={!devices.includes("mobile")}
          >
            Mobile
          </button>
        </div>
      )}

      {/* 🔹 PREVIEW WRAPPER */}
      <div
        className={`s1-preview-device ${activeDevice}`}
        style={{
          maxWidth: getPreviewWidth(),
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* ================= SINGLE PRODUCT ================= */}
        {previewType === "single" && (
          <div className="s1-product-preview">
            <div className="s1-main-product">
              <div className="s1-main-thumb">
                <div className="static-skeleton static-main-img"></div>
              </div>

              <div className="s1-main-info">
                <div className="static-skeleton static-title"></div>
                <div className="static-skeleton static-price"></div>

                <div className="s1-main-cart">
                  <div className="static-skeleton static-qty"></div>
                  {isCustomStyle && (
                    <button className="th-buy-now-btn" style={getBtnStyle()}>
                      {s?.single_btn_text || __("Buy Now", "th-store-one")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SHOP GRID ================= */}
        {previewType === "shop" && (
          <div className="s1-shop-preview">
            {[1].map((i) => (
              <div className="s1-product-badges-wrap" key={i}>
                <div className="s1-preview-product s1-trust-badges">
                  {/* IMAGE + BADGE */}
                  <div className="s1-preview-image-skeleton"></div>

                  {/* TITLE */}
                  <div className="s1-preview-title-skeleton">
                    <span />
                    <span />
                  </div>

                  {/* PRICE */}
                  <div
                    className="s1-preview-price-skeleton"
                    style={{ marginBottom: "10px" }}
                  />

                  {/*BUY NOW BUTTON */}
                  {isCustomStyle && (
                  <button className="th-buy-now-btn" style={getBtnStyle()}>
                    {s?.archive_btn_text || __("Buy Now", "th-store-one")}
                  </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewBuyNow;
