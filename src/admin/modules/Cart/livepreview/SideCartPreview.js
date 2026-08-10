import { __ } from "@wordpress/i18n";
import { CART_ICON_OPTIONS } from "./cart-icons";
import { useState } from "@wordpress/element";
const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

const SideCartPreview = ({ settings = {}, previewType }) => {
  const [couponOpen, setCouponOpen] = useState(false);
  const products = [
    {
      id: 1,
      name: "Classic Red Sneakers",
      price: 900,
      qty: 1,
      rating: 5,
    },

    ...(settings?.taiowc_show_ai_suggestion === false
      ? [
          {
            id: 2,
            name: "Minimalist White Tee",
            price: 108,
            qty: 1,
            rating: 5,
            isAi: false,
          },
        ]
      : ""),
  ];

  const aiProducts = [
    {
      id: 101,
      name: "Ribbed Tank",
      price: 99,
      qty: 1,
      rating: 0,
    },
  ];

  const coupons = [
    {
      id: 1,
      code: "8677pjcz",
      description: "",
      applied: false,
    },
    {
      id: 2,
      code: "9dva2d2r",
      description: "",
      applied: true,
    },
  ];
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
        style={{ background: getBg(settings.taiowc_cart_pan_bg_clr) }}
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
        {settings.taiowc_show_shipping_bar == true && (
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
        )}

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

          {/* AI Product Suggestions */}

          {settings.taiowc_show_ai_suggestion === true && (
            <div className="s1-ai-suggestion">
              {/* AI Heading */}
              <div className="s1-ai-suggestion-header">
                <span>
                  {settings.taiowc_ai_suggestion_heading ||
                    __("AI Product Suggestions", "th-store-one")}
                </span>
              </div>

              {/* AI Products */}
              {aiProducts.map((product) => (
                <div
                  className="s1-cart-item s1-ai-cart-item"
                  style={productStyle}
                  key={product.id}
                >
                  {settings.taiowc_show_prd_img && (
                    <div className="s1-cart-thumb"></div>
                  )}

                  <div className="s1-cart-content">
                    {settings.taiowc_show_prd_title && (
                      <h4 style={titleStyle}>{product.name}</h4>
                    )}

                    {settings.taiowc_show_prd_price && (
                      <div className="s1-cart-price" style={textStyle}>
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>

                  {/* AI Add Button */}
                  <button type="button" className="s1-ai-add-button">
                    +
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="s1-side-cart-footer" style={footerStyle}>
          <h5 style={footerHeadingStyle}>
            {__("ORDER SUMMARY", "th-store-one")}
          </h5>

          {/* Coupons */}

          {settings.taiowc_show_coupon === true && (
            <div className="s1-coupon-section">
              {/* Coupon Header */}

              <button
                type="button"
                className="s1-coupon-toggle"
                onClick={() => setCouponOpen((open) => !open)}
              >
                <span className="s1-coupon-title">
                  {__("Coupons", "th-store-one")}
                </span>

                <span className="s1-coupon-arrow">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: couponOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform .2s ease",
                    }}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {/* Coupon Slider */}

              {couponOpen && (
                <>
                  <div className="s1-coupon-form">
                    <input
                      type="text"
                      className="s1-coupon-input"
                      placeholder={__("Coupon code", "th-store-one")}
                    />

                    <button type="button" className="s1-coupon-btn">
                      {__("Apply", "th-store-one")}
                    </button>
                  </div>

                  <div className="s1-coupon-preview-list">
                    {coupons.map((coupon) => (
                      <div
                        className={`s1-coupon-card ${
                          coupon.applied ? "is-applied" : ""
                        }`}
                        key={coupon.id}
                      >
                        <div className="s1-coupon-left">
                          <div className="s1-coupon-code">{coupon.code}</div>

                          {coupon.description && (
                            <div className="s1-coupon-desc">
                              {coupon.description}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`s1-apply-coupon ${
                            coupon.applied ? "is-applied" : ""
                          }`}
                        >
                          {coupon.applied
                            ? __("Applied", "th-store-one")
                            : __("Apply", "th-store-one")}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="s1-coupon-pagination">
                    <span className="active"></span>
                    <span></span>
                  </div>

                  <div className="s1-applied-coupons">
                    <div className="s1-applied-coupon">
                      <span>9dva2d2r</span>

                      <button type="button" className="s1-remove-coupon">
                        ×
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

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
