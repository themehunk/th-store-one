import { __ } from "@wordpress/i18n";
import { CART_ICON_OPTIONS } from "./cart-icons";
const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

const products = [
  {
    id: 1,
    name: "Classic Red Sneakers",
    price: 900,
    qty: 1,
    rating: 5,
  },
  {
    id: 2,
    name: "Minimalist White Tee",
    price: 108,
    qty: 1,
    rating: 5,
  },
];

const SideCartPreview = ({ settings = {} }) => {
  const getBg = (value) => {
    if (!value) {
      return undefined;
    }

    if (typeof value === "string") {
      return value;
    }

    return (
      value.background ||
      value.gradient ||
      value.color ||
      value.value ||
      undefined
    );
  };

  const headerStyle = {
    background: getBg(settings.taiowc_cart_pan_hdr_bg_clr),
  };

  const headerTitleStyle = {
    color: getBg(settings.taiowc_cart_pan_hd_clr),
  };

  const headerIconStyle = {
    color: getBg(settings.taiowc_cart_pan_icon_clr),
  };

  const closeStyle = {
    color: getBg(settings.taiowc_cart_pan_cls_clr),
  };

  const bodyStyle = {
    background: getBg(settings.taiowc_cart_pan_bg_clr),
  };

  const productStyle = {
    background: getBg(settings.taiowc_cart_pan_prd_bg_clr),
    borderColor: getBg(settings.taiowc_cart_pan_prd_brd_clr),
  };

  const titleStyle = {
    color: getBg(settings.taiowc_cart_pan_prd_tle_clr),
  };

  const textStyle = {
    color: getBg(settings.taiowc_cart_pan_prd_txt_clr),
  };

  const ratingStyle = {
    color: getBg(settings.taiowc_cart_pan_prd_rat_clr),
  };

  const footerStyle = {
    background: getBg(settings.taiowc_cart_pan_pay_bg_clr),
    color: getBg(settings.taiowc_cart_pan_pay_txt_clr),
  };

  const footerHeadingStyle = {
    color: getBg(settings.taiowc_cart_pan_pay_hd_clr),
  };

  const cartButtonStyle = {
    background: getBg(settings.taiowc_cart_pan_pay_cart_bg_clr),
    color: getBg(settings.taiowc_cart_pan_pay_cart_clr),
  };

  const checkoutButtonStyle = {
    background: getBg(settings.taiowc_cart_pan_pay_btn_bg_clr),
    color: getBg(settings.taiowc_cart_pan_pay_btn_clr),
  };

  const shippingStyle = {
    background: getBg(settings.taiowc_shipping_bg),
  };

  const trackStyle = {
    background: getBg(settings.taiowc_shipping_track),
  };

  const fillStyle = {
    background: getBg(settings.taiowc_shipping_fill),
  };

  const iconCircleStyle = {
    background: getBg(settings.taiowc_shipping_icon_bg),
    borderColor: getBg(settings.taiowc_shipping_icon_border),
  };

  const shippingTextStyle = {
    color: getBg(settings.taiowc_shipping_text),
  };

  const shippingAmountStyle = {
    color: getBg(settings.taiowc_shipping_amount),
  };
  const subtotal = products.reduce(
    (total, product) => total + product.price * product.qty,
    0,
  );

  const totalItems = products.reduce(
    (total, product) => total + product.qty,
    0,
  );

  const position =
    settings?.taiowc_cart_effect === "taiowc-slide-left" ? "left" : "right";

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
    <div className="s1-side-cart-wrapper">
      {/* Background Website */}

      <div className="s1-side-cart-page">
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

          <div className="s1-menu-cart">
            <div className="s1-preview-cart-icon">
              <CartIcon />
            </div>

            <span>{formatPrice(subtotal)}</span>

            <span className="s1-menu-cart-count">{totalItems}</span>
          </div>
        </header>

        <div className="s1-skeleton hero"></div>

        <div className="s1-skeleton title"></div>

        <div className="s1-skeleton text"></div>

        <div className="s1-product-grid">
          {[1, 2, 3].map((item) => (
            <div className="s1-product-card" key={item}>
              <div className="thumb"></div>

              <div className="line"></div>

              <div className="price"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay */}

      <div className="s1-side-cart-overlay"></div>

      {/* Side Cart */}

      <div
        className={`s1-side-cart-preview ${
          position === "left" ? "position-left" : "position-right"
        }`}
      >
        <div className="s1-side-cart-header" style={headerStyle}>
          <div className="s1-side-cart-title">
            <div className="s1-preview-cart-icon" style={headerIconStyle}>
              <CartIcon />
            </div>

            <span style={headerTitleStyle}>
              {settings.taiowc_cart_hd || __("Your Cart", "th-store-one")}
            </span>

            <span className="s1-cart-count">{totalItems}</span>
          </div>

          <span
            className="dashicons dashicons-no-alt"
            style={closeStyle}
          ></span>
        </div>

        {/* Shipping */}

        <div className="s1-shipping-progress" style={shippingStyle}>
          <div className="s1-progress-wrap">
            <div className="s1-progress-track" style={trackStyle}>
              <div
                className="s1-progress-fill"
                style={{
                  ...fillStyle,
                  width: "72%",
                }}
              ></div>
            </div>

            <div
              className="s1-progress-icon"
              style={{
                ...iconCircleStyle,
                left: "72%",
              }}
            >
              🚚
            </div>
          </div>

          <p style={shippingTextStyle}>
            {__("Spend", "th-store-one")}{" "}
            <strong style={shippingAmountStyle}>{formatPrice(258)}</strong>{" "}
            {__("more for free shipping", "th-store-one")}
          </p>
        </div>

        {/* Products */}

        <div className="s1-side-cart-body" style={bodyStyle}>
          {products.map((product) => (
            <div className="s1-cart-item" style={productStyle} key={product.id}>
              {settings.taiowc_show_prd_img && (
                <div className="s1-cart-thumb"></div>
              )}

              <div className="s1-cart-content">
                {settings.taiowc_show_prd_title && (
                  <h4 style={titleStyle}>{product.name}</h4>
                )}

                {settings.taiowc_show_prd_rating && (
                  <div className="s1-cart-rating" style={ratingStyle}>
                    {"★".repeat(product.rating)}
                  </div>
                )}

                {settings.taiowc_show_prd_quantity && (
                  <div className="s1-woo-cart-qty">
                    <button type="button">−</button>

                    <span>{product.qty}</span>

                    <button type="button">+</button>
                  </div>
                )}
              </div>

              {settings.taiowc_show_prd_price && (
                <div className="s1-cart-price" style={textStyle}>
                  {formatPrice(product.price)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}

        <div className="s1-side-cart-footer" style={footerStyle}>
          <h5 style={footerHeadingStyle}>
            {__("ORDER SUMMARY", "th-store-one")}
          </h5>

          <div className="s1-summary-row">
            <span>{__("Subtotal", "th-store-one")}</span>

            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="s1-summary-row total">
            <span>{__("ORDER TOTAL", "th-store-one")}</span>

            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="s1-cart-actions">
            <button type="button" className="outline" style={cartButtonStyle}>
              {__("View Cart", "th-store-one")}
            </button>

            <button
              type="button"
              className="primary"
              style={checkoutButtonStyle}
            >
              {__("Checkout →", "th-store-one")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideCartPreview;
