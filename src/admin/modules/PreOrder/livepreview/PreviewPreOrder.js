/* ------------------------ imports ------------------------ */
import "./live-style.css";
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";

const PreviewPreOrder = ({ settings = {} }) => {
  const s = settings || {};

  /* ---------------- DEVICE ---------------- */

  const devices = s?.visibility?.devices || [];

  const [previewDevice, setPreviewDevice] = useState(devices[0] || "desktop");

  const [previewType, setPreviewType] = useState("single");

  const isOnlyMobile = devices.length === 1 && devices.includes("mobile");

  const activeDevice = isOnlyMobile
    ? "mobile"
    : devices.includes(previewDevice)
    ? previewDevice
    : devices[0] || "desktop";

  const getPreviewWidth = () => {
    if (activeDevice === "mobile") {
      return "375px";
    }

    if (activeDevice === "tablet") {
      return "768px";
    }

    return "100%";
  };

  /* ---------------- BUTTON STYLE ---------------- */
  const isCustomStyle = s?.btn_style === "custom_btn_style";
  const getBtnStyle = () => {
    if (s?.btn_style !== "custom_btn_style") {
      return {};
    }

    return {
      background: s?.btn_bg_clr || "#111111",

      color: s?.btn_text_clr || "#ffffff",

      padding: `
        ${s?.btn_padding?.top || 12}px
        ${s?.btn_padding?.right || 18}px
        ${s?.btn_padding?.bottom || 12}px
        ${s?.btn_padding?.left || 18}px
      `,

      borderStyle: s?.btn_border?.style || "solid",

      borderColor: s?.btn_border?.color || "#111111",

      borderWidth: `
        ${s?.btn_border?.width?.top || 1}px
        ${s?.btn_border?.width?.right || 1}px
        ${s?.btn_border?.width?.bottom || 1}px
        ${s?.btn_border?.width?.left || 1}px
      `,

      borderRadius: `
        ${s?.btn_border?.radius?.top || 6}px
        ${s?.btn_border?.radius?.right || 6}px
        ${s?.btn_border?.radius?.bottom || 6}px
        ${s?.btn_border?.radius?.left || 6}px
      `,
    };
  };

  /* ---------------- PREORDER BOX ---------------- */

  const getBoxStyle = () => {
    return {
      background: s?.box_bg_color || "#ffffff",

      color: s?.box_text_color || "#111827",

      border: `1px solid ${s?.box_border_color || "#e5e7eb"}`,

      borderRadius: "18px",

      padding: "24px",

      marginTop: "20px",
    };
  };

  const getMessageStyle = () => {
    return {
      color: s?.message_text_color || "#111827",

      fontSize: `${s?.message_font_size || 16}px`,

      lineHeight: "1.7",
    };
  };

  const getPriceStyle = () => {
    return {
      color: s?.price_color || "#111827",

      fontSize: `${s?.price_font_size || 24}px`,

      fontWeight: "700",

      textDecoration: "none",
    };
  };

  const getOldPriceStyle = () => {
    return {
      color: s?.price_old_color || "#9ca3af",

      opacity: ".8",
    };
  };

  const getBadgeStyle = () => {
    return {
      background: s?.badge_bg_color || "#111827",

      color: s?.badge_text_color || "#ffffff",

      display: "inline-flex",

      padding: "6px 12px",

      borderRadius: "30px",

      fontSize: "12px",

      fontWeight: "600",

      marginTop: "10px",
    };
  };

  return (
    <div className="s1-preview-wrap">
      {/* VIEW SWITCHER */}

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

      {/* DEVICE SWITCHER */}

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

      {/* PREVIEW */}

      <div
        className={`s1-preview-device ${activeDevice}`}
        style={{
          maxWidth: getPreviewWidth(),
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* SINGLE */}

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
                    <button
                      className="th-pre-buy-now-btn"
                      style={getBtnStyle()}
                    >
                      {s?.button_text || __("Pre Order Now", "th-store-one")}
                    </button>
                  )}
                </div>

                {/* PREORDER BOX */}

                <div className="th-preorder-box-preview" style={getBoxStyle()}>
                  <div
                    className="th-preorder-message-preview"
                    style={getMessageStyle()}
                  >
                    {s?.preorder_message ||
                      __(
                        "This product is available for pre-order.",
                        "th-store-one",
                      )}
                  </div>

                  {s?.date_mode === "calendar" && (
                    <div className="th-preorder-date-preview">
                      <strong>{__("Available On:", "th-store-one")}</strong>

                      <span>{s?.availability_date || "May 14, 2026"}</span>
                    </div>
                  )}

                  {/* {s?.date_mode === "manual" && (
                    <div
                      className="th-preorder-badge-preview"
                      style={getBadgeStyle()}
                    >
                      {__("Pre-Order Available", "th-store-one")}
                    </div>
                  )} */}

                  {/* {s?.price_type !== "product_price" && (
                    <div className="th-preorder-price-wrap-preview">
                      <span className="th-preorder-price-label-preview">
                        {__("Pre-order Price", "th-store-one")}
                      </span>

                      <div className="th-preorder-price-preview">
                        <del style={getOldPriceStyle()}>$15.00</del>

                        <ins style={getPriceStyle()}>$10.00</ins>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SHOP */}

        {previewType === "shop" && (
          <div className="s1-shop-preview">
            {[1].map((i) => (
              <div className="s1-product-badges-wrap" key={i}>
                <div className="s1-preview-product s1-trust-badges">
                  <div className="s1-preview-image-skeleton"></div>

                  <div className="s1-preview-title-skeleton">
                    <span />
                    <span />
                  </div>

                  <div
                    className="s1-preview-price-skeleton"
                    style={{
                      marginBottom: "10px",
                    }}
                  />

                  {isCustomStyle && (
                    <button
                      className="th-pre-buy-now-btn"
                      style={getBtnStyle()}
                    >
                      {s?.button_text || __("Pre Order Now", "th-store-one")}
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

export default PreviewPreOrder;
