import { __ } from "@wordpress/i18n";
import { CART_ICON_OPTIONS } from "./cart-icons";
const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

const FloatingCartPreview = ({ settings = {} }) => {
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
    background: getBg(settings.taiowc_fixed_bg),
  };

  const iconStyle = {
    color: getBg(settings.taiowc_fixed_icon_color),
  };

  const priceStyle = {
    color: getBg(settings.taiowc_fixed_price_color),
  };

  const qtyStyle = {
    background: getBg(settings.taiowc_fixed_quantity_bg),
    color: getBg(settings.taiowc_fixed_quantity_color),
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

  const position = settings?.taiowc_fixed_position || "fxd-right";
  const horizontal = Number(settings?.taiowc_fixed_horizontal ?? 15);

  const bottom = Number(settings?.taiowc_fixed_bottom ?? 90);

  const floatingPositionStyle = {
    bottom: `${bottom}px`,
    ...(position === "fxd-left"
      ? { left: `${horizontal}px` }
      : { right: `${horizontal}px` }),
  };
  return (
    <div className="s1-menu-preview">
      {/* Header - Same as Menu Cart */}

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
          <span className="s1-menu-line"></span>
        </nav>
      </header>

      {/* Existing Skeleton */}
      <div className="s1-skeleton hero"></div>

      <div className="s1-product-grid">
        {[1, 2, 3].map((i) => (
          <div className="s1-product-card" key={i}>
            <div className="thumb"></div>
            <div className="line"></div>
            <div className="price"></div>
          </div>
        ))}
      </div>

      {/* Floating Cart */}

      <div
        className={`s1-floating-cart ${
          position === "fxd-left" ? "s1-floating-left" : "s1-floating-right"
        }`}
        style={{
          ...cartStyle,
          ...floatingPositionStyle,
        }}
      >
        <div className="s1-preview-cart-icon" style={iconStyle}>
          <CartIcon />
        </div>

        {settings?.taiowc_fixed_show_quantity && (
          <span className="s1-floating-cart-count" style={qtyStyle}>
            2
          </span>
        )}
      </div>
    </div>
  );
};

export default FloatingCartPreview;
