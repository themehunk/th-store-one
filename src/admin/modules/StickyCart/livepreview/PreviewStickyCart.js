import "./live-style.css";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";

const PreviewStickyCart = ({ settings = {} }) => {
  const s = settings || {};

  // devices
  const devices = s?.visibility?.devices || [];

  //preview switcher state
  const [previewDevice, setPreviewDevice] = useState(devices[0] || "desktop");

  // only mobile auto mode
  const isOnlyMobile =
    devices.length === 1 && devices.includes("mobile");

  //active device (FIXED LOGIC)
  const activeDevice = isOnlyMobile
    ? "mobile"
    : devices.includes(previewDevice)
    ? previewDevice
    : devices[0] || "desktop";

  //content override (mobile settings)
  const content =
    activeDevice === "mobile" && s?.content?.mobile?.enabled
      ? { ...s.content, ...s.content.mobile }
      : s.content || {};

  //button text
  const getButtonText = () => {
    if (content?.button_text) return content.button_text;

    if (content?.button_action === "buynow") {
      return __("Buy Now", "th-store-one");
    }

    return __("Add to Cart", "th-store-one");
  };

  // width control
  const getPreviewWidth = () => {
    if (activeDevice === "mobile") return "375px";
    if (activeDevice === "tablet") return "768px";
    return "100%";
  };

  return (
    <div className="s1-preview-wrap">

      {/*DEVICE SWITCHER (only when multiple devices) */}
      {devices.length > 1 && (
        <div className="s1-device-switcher s1-style-tabs">

          <button
  className={`s1-style-tab ${activeDevice === "desktop" ? "active" : ""}`}
  onClick={() => setPreviewDevice("desktop")}
  disabled={!devices.includes("desktop")}
>
  Desktop
</button>

<button
  className={`s1-style-tab ${activeDevice === "tablet" ? "active" : ""}`}
  onClick={() => setPreviewDevice("tablet")}
  disabled={!devices.includes("tablet")}
>
  Tablet
</button>

<button
  className={`s1-style-tab ${activeDevice === "mobile" ? "active" : ""}`}
  onClick={() => setPreviewDevice("mobile")}
  disabled={!devices.includes("mobile")}
>
  Mobile
</button>

        </div>
      )}

      {/* PREVIEW WRAPPER */}
      <div
        className={`s1-preview-device ${activeDevice}`}
        style={{
          maxWidth: getPreviewWidth(),
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div className="s1-product-preview s1-preview-stickybar">
    
          {/* MAIN PRODUCT */}
          <div className="s1-main-product">
            <div className="s1-main-thumb">
              <div className="static-skeleton static-main-img"></div>
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

          {/* STICKY BAR */}
          <div
            className={`s1-sticky-bar s1-${s?.general?.position || "bottom"}`}
            style={{
              background: s?.style?.bg_color,
              color: s?.style?.text_color,
            }}
          >

            {/* LEFT */}
            {/* offer */}
           {content?.show_ofrbnr && (
          <div className="s1-offer-banner"style={{
              background: s?.style?.ofr_bnr_bg,
              color: s?.style?.ofr_bnr_clr,
            }}>
            <div className="s1-offer-conetnt"> {__("Hurry! Offer will expire soon", "th-store-one")}
               {content?.show_timer && (
              <span className="s1-offer-time">{__("4:00", "th-store-one")}</span>
               )}
              </div>
          </div>
          )}
          <div className="s1-sticky-content">
            <div className="s1-sticky-left">
              {content?.show_image && (
                <div className="static-skeleton s1-thumb"></div>
              )}

              <div className="s1-info">
                {content?.show_title && (
                  <div
                    className="s1-title"
                    style={{ color: s?.style?.text_color }}
                  >
                    {__("Product Title", "th-store-one")}
                  </div>
                )}

                {content?.show_price && (
                  <div
                    className="s1-price"
                    style={{ color: s?.style?.price_color }}
                  >
                    ₹120
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="s1-sticky-right">

              {content?.show_variation && (
                <div className="s1-variation">
                  <select disabled>
                    <option>{__("Select Size", "th-store-one")}</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                  </select>
                </div>
              )}

              {content?.show_qty && (
                <div className="static-skeleton s1-qty"></div>
              )}

              <div
                className="s1-btn"
                style={{
                  background: s?.style?.btn_bg_color,
                  color: s?.style?.btn_text_color,
                }}
              >
                {getButtonText()}
              </div>

            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStickyCart;