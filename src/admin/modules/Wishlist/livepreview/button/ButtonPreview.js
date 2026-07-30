import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import WishlistIcon from "../WishlistIcon";

const ButtonPreview = ({ settings = {} }) => {
  const [preview, setPreview] = useState("shop");

  const {
    thw_add_to_wishlist_text = __("Wishlist", "th-store-one"),
    thw_browse_wishlist_text = __("Browse", "th-store-one"),

    thw_wishlist_add_icon = "heart-outline",
    th_wishlist_brws_icon = "heart-filled",

    thw_wishlist_add_icon_color = "#111",
    thw_wishlist_btn_bg_color = "#6a4df5",
    thw_wishlist_btn_txt_color = "#ffffff",

    thw_redirect_wishlist_page_icon_size = 24,

    thw_btn_style_theme = true,
  } = settings;

  const buttonStyle = thw_btn_style_theme
    ? {}
    : {
        background: thw_wishlist_btn_bg_color,
        color: thw_wishlist_btn_txt_color,
        borderColor: thw_wishlist_btn_bg_color,
      };

  return (
    <div className="s1-button-preview">
      <h4 className="s1-preview-title">
        {__("Wishlist Preview", "th-store-one")}
      </h4>

      <div className="s1-table-style-tabs">
        <button
          className={`s1-table-style-tab ${preview === "shop" ? "active" : ""}`}
          onClick={() => setPreview("shop")}
        >
          {__("Shop", "th-store-one")}
        </button>

        <button
          className={`s1-table-style-tab ${
            preview === "single" ? "active" : ""
          }`}
          onClick={() => setPreview("single")}
        >
          {__("Single", "th-store-one")}
        </button>
      </div>

      {preview === "shop" && (
        <div
          className="s1-preview-shop-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {[1, 2].map((item) => (
            <div
              key={item}
              className="s1-preview-product-card"
              style={{
                maxWidth: "100%",
                padding: "20px",
                background: "#fff",
                borderRadius: "12px",
                textAlign: "-webkit-center",
              }}
            >
              <div className="s1-sk s1-sk-image"></div>

              <div className="s1-sk s1-sk-title"></div>

              <div className="s1-sk s1-sk-price"></div>

              <div className="s1-sk s1-sk-rating"></div>

              <div className="s1-sk s1-sk-cart"></div>

              <div className="s1-sk-buttons">
                <button
                  className={`s1-preview-btn ${
                    thw_btn_style_theme ? "theme-style" : ""
                  }`}
                  style={buttonStyle}
                >
                  <WishlistIcon
                    icon={thw_wishlist_add_icon}
                    color={thw_wishlist_add_icon_color}
                    size={thw_redirect_wishlist_page_icon_size}
                  />
                  <span>{thw_add_to_wishlist_text}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview === "single" && (
        <div
          className="s1-preview-single"
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            padding: "20px",
            background: "#fff",
            borderRadius: "12px",
          }}
        >
          <div className="s1-preview-gallery">
            <div className="s1-sk s1-sk-gallery"></div>

            <div className="s1-sk-thumbs">
              <div className="s1-sk s1-sk-thumb"></div>
              <div className="s1-sk s1-sk-thumb"></div>
              <div className="s1-sk s1-sk-thumb"></div>
              <div className="s1-sk s1-sk-thumb"></div>
            </div>
          </div>

          <div className="s1-preview-summary">
            <div className="s1-sk s1-sk-title"></div>

            <div className="s1-sk s1-sk-rating"></div>

            <div className="s1-sk s1-sk-price"></div>

            <div className="s1-sk s1-sk-line"></div>
            <div className="s1-sk s1-sk-line short"></div>

            <div className="s1-sk-buttons">
              <div className="s1-sk s1-sk-qty"></div>

              <div className="s1-sk s1-sk-cart"></div>
            </div>
            <button
              className={`s1-preview-btn ${
                thw_btn_style_theme ? "theme-style" : ""
              }`}
              style={buttonStyle}
            >
              <WishlistIcon
                icon={thw_wishlist_add_icon}
                color={thw_wishlist_add_icon_color}
                size={thw_redirect_wishlist_page_icon_size}
              />
              <span>{thw_add_to_wishlist_text}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonPreview;
