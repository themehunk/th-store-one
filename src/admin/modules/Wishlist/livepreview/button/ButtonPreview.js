import { __ } from "@wordpress/i18n";
import WishlistIcon from "../WishlistIcon";

const ButtonPreview = ({ settings = {} }) => {
  const {
    thw_add_to_wishlist_text = __("Wishlist", "th-store-one"),
    thw_browse_wishlist_text = __("Browse", "th-store-one"),

    thw_wishlist_add_icon = "heart-outline",
    th_wishlist_brws_icon = "heart-filled",

    thw_wishlist_add_icon_color = "#ff4d4f",
    thw_wishlist_btn_bg_color = "#6a4df5",
    thw_wishlist_btn_txt_color = "#ffffff",

    thw_redirect_wishlist_page_icon_size = 24,

    thw_btn_style_theme = false,
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

      <div className="s1-button-preview-card">
        {/* Wishlist Button */}

        <button
          type="button"
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

        {/* Browse Button */}

        <button
          type="button"
          className={`s1-preview-btn ${
            thw_btn_style_theme ? "theme-style" : ""
          }`}
          style={buttonStyle}
        >
          <WishlistIcon
            icon={th_wishlist_brws_icon}
            color={thw_wishlist_add_icon_color}
            size={thw_redirect_wishlist_page_icon_size}
          />

          <span>{thw_browse_wishlist_text}</span>
        </button>
      </div>
    </div>
  );
};

export default ButtonPreview;
