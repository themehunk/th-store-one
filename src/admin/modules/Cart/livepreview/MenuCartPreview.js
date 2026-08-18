import { __ } from "@wordpress/i18n";
import { CART_ICON_OPTIONS } from "./cart-icons";
const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

const MenuCartPreview = ({ settings = {} }) => {
  const getBg = (value) => {
    if (!value) return undefined;

    if (typeof value === "string") {
      return value;
    }

    return (
      value.background ||
      value.color ||
      value.value ||
      value.gradient ||
      undefined
    );
  };

  const cartStyle = {
    background: getBg(settings.taiowc_bg_color),
  };

  const priceStyle = {
    color: getBg(settings.taiowc_price_color),
  };

  const qtyStyle = {
    background: getBg(settings.taiowc_quantity_bg),
    color: getBg(settings.taiowc_quantity_color),
  };

  const iconStyle = {
    color: getBg(settings.taiowc_icon_color),
  };

  const selectedIcon =
    CART_ICON_OPTIONS.find((icon) => icon.id === settings?.taiowc_cart_icon) ||
    CART_ICON_OPTIONS[0];

  const CartIcon = () => {
    if (settings?.taiowc_icontype === "image" && settings?.taiowc_image_url) {
      return (
        <img
          className="s1-preview-cart-img"
          src={settings.taiowc_image_url}
          alt=""
        />
      );
    }

    if (
      settings?.taiowc_icontype === "custom_svg" &&
      settings?.taiowc_custom_svg
    ) {
      return (
        <span
          className="s1-preview-cart-svg"
          dangerouslySetInnerHTML={{
            __html: settings.taiowc_custom_svg,
          }}
        />
      );
    }

    return <span className="s1-preview-cart-svg">{selectedIcon.icon}</span>;
  };
  return (
    <div className="s1-menu-preview">
      {/* Header */}

      <header className="s1-menu-header">
        <div className="s1-menu-logo">
          <div className="s1-logo-icon"></div>

          <div className="s1-logo-text">
            <strong>STOREONE</strong>
          </div>
        </div>

        <nav className="s1-menu-nav">
          <span className="s1-menu-line"></span>
          <span className="s1-menu-line"></span>
        </nav>

        <div className="s1-menu-cart" style={cartStyle}>
          <div className="s1-preview-cart-icon" style={iconStyle}>
            <CartIcon />
          </div>
          {settings.taiowc_show_price && (
            <span style={priceStyle}>{formatPrice(1008)}</span>
          )}
          {settings.taiowc_show_quantity && (
            <span className="s1-menu-cart-count" style={qtyStyle}>
              2
            </span>
          )}
        </div>
      </header>

      {/* Hero */}

      <div className="s1-skeleton hero"></div>

      {/* Text */}

      <div className="s1-skeleton title"></div>

      <div className="s1-skeleton text"></div>

      {/* Products */}

      <div className="s1-product-grid">
        <div className="s1-product-card">
          <div className="thumb"></div>
          <div className="line"></div>
          <div className="price"></div>
        </div>

        <div className="s1-product-card">
          <div className="thumb"></div>
          <div className="line"></div>
          <div className="price"></div>
        </div>

        <div className="s1-product-card">
          <div className="thumb"></div>
          <div className="line"></div>
          <div className="price"></div>
        </div>
      </div>
    </div>
  );
};

export default MenuCartPreview;
