import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { CART_ICON_OPTIONS } from "./cart-icons";
const currency = th_StoreOneAdmin?.currency_symbol || "$";

const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;
const MobileSideCartPreview = ({ settings = {} }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);

  /* =========================================================
     Mobile Menu Cart
  ========================================================= */

  const menuDisabled = settings.taiowcp_dsble_mnu_crt === true;

  const menuQuantityDisabled = settings.taiowcp_dsble_mnu_crt_qnty === true;

  const menuPriceDisabled = settings.taiowcp_dsble_mnu_crt_price === true;

  /* =========================================================
     Fixed / Floating Cart
  ========================================================= */

  const fixedDisabled = settings.taiowcp_dsble_fxd_crt === true;

  const fixedQuantityDisabled = settings.taiowcp_dsble_fxd_crt_qnty === true;

  const fixedPosition =
    settings.taiowcp_fxd_cart_mobile_position === "fxd-left" ? "left" : "right";

  /* =========================================================
     Mobile Cart Panel
  ========================================================= */

  const mobileCartEffect = settings.taiowcp_cart_mobile_effect || "global";

  const isBottomCart = mobileCartEffect === "mobiletopslide";

  /*
   * Default/global cart position.
   *
   * Same global setting used by Side Cart.
   */
  const globalCartPosition =
    settings.taiowc_cart_effect === "taiowc-slide-left" ? "left" : "right";

  const panelPosition = isBottomCart ? "bottom" : globalCartPosition;

  /* =========================================================
     Mobile Cart Settings
  ========================================================= */

  const disableShipping = settings.taiowcp_dsble_mob_ship === true;

  const disableCoupon = settings.taiowcp_dsble_mob_coupan === true;

  const disableRelated = settings.taiowcp_dsble_mob_rel_prd_crt === true;

  /* =========================================================
     Cart Icon
  ========================================================= */

  const selectedIcon =
    CART_ICON_OPTIONS.find((icon) => icon.id === settings?.taiowc_cart_icon) ||
    CART_ICON_OPTIONS[0];

  const CartIcon = () => {
    /*
     * Image icon
     */
    if (settings?.taiowc_icontype === "image" && settings?.taiowc_image_url) {
      return <img src={settings.taiowc_image_url} alt="" />;
    }

    /*
     * Custom SVG
     */
    if (
      settings?.taiowc_icontype === "custom_svg" &&
      settings?.taiowc_custom_svg
    ) {
      return (
        <span
          className="s1-mobile-preview-cart-svg"
          dangerouslySetInnerHTML={{
            __html: settings.taiowc_custom_svg,
          }}
        />
      );
    }

    /*
     * Selected icon
     */
    return (
      <span className="s1-mobile-preview-cart-svg">{selectedIcon.icon}</span>
    );
  };

  /* =========================================================
     Open Cart
  ========================================================= */

  const openCart = () => {
    setCartOpen(true);
  };

  const closeCart = () => {
    setCartOpen(false);
  };

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
    borderColor: "transparent",
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

  const mobileMenuCartStyle = {
    background: getBg(settings.taiowc_bg_color),
  };

  const mobileMenuCartIconStyle = {
    color: getBg(settings.taiowc_icon_color),
  };

  const mobileMenuCartCountStyle = {
    background: getBg(settings.taiowc_quantity_bg),
    color: getBg(settings.taiowc_quantity_color),
  };

  const mobileMenuCartPriceStyle = {
    color: getBg(settings.taiowc_price_color),
  };

  const mobilecartStyle = {
    background: getBg(settings.taiowc_fixed_bg),
  };

  const mobileiconStyle = {
    color: getBg(settings.taiowc_fixed_icon_color),
  };

  const mobilepriceStyle = {
    color: getBg(settings.taiowc_fixed_price_color),
  };

  const mobileqtyStyle = {
    background: getBg(settings.taiowc_fixed_quantity_bg),
    color: getBg(settings.taiowc_fixed_quantity_color),
  };

  return (
    <div
      className={`s1-mobile-side-cart-preview ${
        cartOpen ? "cart-is-open" : ""
      }`}
    >
      {/* =====================================================
          MOBILE WEBSITE
      ===================================================== */}

      <div className="s1-mobile-preview-page">
        {/* Header */}

        {!menuDisabled && (
          <header className="s1-mobile-preview-header">
            <div className="s1-mobile-preview-brand">
              <div className="s1-mobile-preview-brand-icon">S</div>

              <strong>MEGASTORE</strong>
            </div>

            <button
              type="button"
              className="s1-mobile-preview-menu-cart"
              onClick={openCart}
              style={mobileMenuCartStyle}
            >
              <span
                className="s1-mobile-preview-cart-icon"
                style={mobileMenuCartIconStyle}
              >
                <CartIcon />
              </span>

              {!menuQuantityDisabled && (
                <span
                  className="s1-mobile-preview-cart-count"
                  style={mobileMenuCartCountStyle}
                >
                  2
                </span>
              )}

              {!menuPriceDisabled && (
                <strong style={mobileMenuCartPriceStyle}>₹1,008.00</strong>
              )}
            </button>
          </header>
        )}

        {/* Mobile Content */}

        <div className="s1-mobile-preview-content">
          <div className="s1-mobile-preview-hero">
            <span></span>
            <span></span>
          </div>

          <div className="s1-mobile-preview-title">
            <span></span>
            <span></span>
          </div>

          <div className="s1-mobile-preview-products">
            {[1, 2, 3, 4].map((item) => (
              <div className="s1-mobile-preview-product" key={item}>
                <div className="s1-mobile-preview-product-image"></div>

                <div className="s1-mobile-preview-product-lines">
                  <span></span>
                  <span></span>
                </div>

                <button type="button" className="s1-mobile-preview-add">
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            Floating Cart
        ================================================= */}

        {!fixedDisabled && (
          <button
            type="button"
            className={`s1-mobile-preview-fixed-cart ${fixedPosition}`}
            onClick={openCart}
            style={mobilecartStyle}
          >
            <span
              className="s1-mobile-preview-cart-icon"
              style={mobileiconStyle}
            >
              <CartIcon />
            </span>

            {!fixedQuantityDisabled && <b style={mobileqtyStyle}>2</b>}
          </button>
        )}
      </div>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      {cartOpen && (
        <div className="s1-mobile-cart-overlay" onClick={closeCart} />
      )}

      {/* =====================================================
          CART PANEL
      ===================================================== */}

      <div
        className={`s1-mobile-cart-panel ${cartOpen ? "is-open" : ""} ${
          panelPosition === "bottom"
            ? "is-bottom"
            : panelPosition === "left"
            ? "is-left"
            : "is-right"
        }`}
      >
        {/* Panel Header */}

        <div className="s1-mobile-cart-panel-header" style={headerStyle}>
          <div className="s1-mobile-cart-panel-title">
            <span
              className="s1-mobile-preview-cart-icon"
              style={headerIconStyle}
            >
              <CartIcon />
            </span>

            <strong style={headerTitleStyle}>
              {settings.taiowc_cart_hd || __("Your Cart", "th-store-one")}
            </strong>

            <span className="s1-mobile-panel-count">2</span>
          </div>

          <button
            type="button"
            className="s1-mobile-cart-panel-close"
            onClick={closeCart}
            style={closeStyle}
          >
            ×
          </button>
        </div>

        {/* Products */}

        <div className="s1-mobile-cart-panel-products" style={bodyStyle}>
          {!disableShipping &&
            (settings.taiowcp_free_shipping_style_type === "milestone" ? (
              <div className="s1-mobile-panel-shipping s1-mobile-milestone-preview">
                <div className="s1-mobile-milestone-title">
                  {settings.taiowcp_milestone_unlock_text ||
                    "All rewards unlocked! Congrats!"}
                </div>

                <div className="s1-mobile-milestone-progress">
                  {/* Milestone 1 */}
                  <div className="s1-mobile-milestone-item">
                    <div className="s1-mobile-milestone-line-wrap">
                      <div className="s1-mobile-milestone-icon">
                        {settings.taiowcp_milestone_1_icon === "gift"
                          ? "🎁"
                          : "$"}
                      </div>
                    </div>

                    <div className="s1-mobile-milestone-amount">
                      {formatPrice(
                        parseFloat(settings.taiowcp_milestone_1_amount) || 50,
                      )}
                    </div>

                    <div className="s1-mobile-milestone-label">
                      {settings.taiowcp_milestone_1_label || "10% Discount"}
                    </div>
                  </div>

                  {/* Milestone 2 */}
                  <div className="s1-mobile-milestone-item">
                    <div className="s1-mobile-milestone-line-wrap">
                      <div className="s1-mobile-milestone-icon">
                        {settings.taiowcp_milestone_2_icon === "discount"
                          ? "$"
                          : settings.taiowcp_milestone_2_icon === "shipping"
                          ? "🚚"
                          : "🎁"}
                      </div>
                    </div>

                    <div className="s1-mobile-milestone-amount">
                      {formatPrice(
                        parseFloat(settings.taiowcp_milestone_2_amount) || 75,
                      )}
                    </div>

                    <div className="s1-mobile-milestone-label">
                      {settings.taiowcp_milestone_2_label || "Free Gift"}
                    </div>
                  </div>

                  {/* Milestone 3 */}
                  <div className="s1-mobile-milestone-item">
                    <div className="s1-mobile-milestone-line-wrap">
                      <div className="s1-mobile-milestone-icon">
                        {settings.taiowcp_milestone_3_icon === "discount"
                          ? "$"
                          : settings.taiowcp_milestone_3_icon === "gift"
                          ? "🎁"
                          : "🚚"}
                      </div>
                    </div>

                    <div className="s1-mobile-milestone-amount">
                      {formatPrice(
                        parseFloat(settings.taiowcp_milestone_3_amount) || 100,
                      )}
                    </div>

                    <div className="s1-mobile-milestone-label">
                      {settings.taiowcp_milestone_3_label || "Free Shipping"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Mobile Shipping Bar */
              <div className="s1-mobile-panel-shipping" style={shippingStyle}>
                <div className="s1-mobile-shipping-wrap">
                  <div className="s1-mobile-shipping-track" style={trackStyle}>
                    <div
                      className="s1-mobile-shipping-fill"
                      style={{
                        ...fillStyle,
                        width: "72%",
                      }}
                    ></div>
                  </div>

                  <div
                    className="s1-mobile-shipping-icon"
                    style={{
                      ...iconCircleStyle,
                      left: "72%",
                    }}
                  >
                    🚚
                  </div>
                </div>

                <div
                  className="s1-mobile-shipping-text"
                  style={shippingTextStyle}
                >
                  {__("Spend", "th-store-one")}{" "}
                  <strong style={shippingAmountStyle}>₹258.00</strong>{" "}
                  {__("more for FREE shipping.", "th-store-one")}
                </div>
              </div>
            ))}

          <div className="s1-mobile-panel-product" style={productStyle}>
            <div className="s1-mobile-panel-product-image"></div>

            <div className="s1-mobile-panel-product-info">
              <span style={titleStyle}></span>
              <span style={titleStyle}></span>

              <strong style={textStyle}>₹900.00</strong>
            </div>
          </div>

          <div className="s1-mobile-panel-product" style={productStyle}>
            <div className="s1-mobile-panel-product-image"></div>

            <div className="s1-mobile-panel-product-info">
              <span style={titleStyle}></span>
              <span style={titleStyle}></span>

              <strong style={textStyle}>₹108.00</strong>
            </div>
          </div>
        </div>

        {/* Coupon */}

        {!disableCoupon && (
          <div className="s1-mobile-panel-coupon" style={footerStyle}>
            <button
              type="button"
              className="s1-mobile-panel-coupon-toggle"
              onClick={() => setCouponOpen((open) => !open)}
            >
              <span className="s1-mobile-panel-coupon-title">
                {__("Coupon", "th-store-one")}
              </span>

              <span
                className={`s1-mobile-panel-coupon-arrow ${
                  couponOpen ? "is-open" : ""
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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

            {couponOpen && (
              <div className="s1-mobile-panel-coupon-form">
                <span>{__("Coupon code", "th-store-one")}</span>

                <button type="button">{__("Apply", "th-store-one")}</button>
              </div>
            )}
          </div>
        )}

        {/* You May Like */}

        {/* {!disableRelated && (
          <div className="s1-mobile-panel-related">
            <strong>{__("You may also like", "th-store-one")}</strong>

            <div className="s1-mobile-panel-related-items">
              <div className="s1-mobile-related-product">
                <div></div>
                <span></span>
              </div>

              <div className="s1-mobile-related-product">
                <div></div>
                <span></span>
              </div>
            </div>
          </div>
        )} */}

        {/* Total */}

        {/* =====================================================
    ORDER SUMMARY
===================================================== */}

        <div className="s1-mobile-panel-summary" style={footerStyle}>
          <h5 style={footerHeadingStyle}>
            {__("ORDER SUMMARY", "th-store-one")}
          </h5>

          <div className="s1-mobile-panel-summary-row">
            <span>{__("Subtotal", "th-store-one")}</span>

            <span>₹1,220.00</span>
          </div>

          <div className="s1-mobile-panel-summary-row total">
            <strong>{__("ORDER TOTAL", "th-store-one")}</strong>

            <strong>₹720.00</strong>
          </div>
          <button
            style={checkoutButtonStyle}
            type="button"
            className="s1-mobile-panel-checkout"
          >
            {__("Checkout", "th-store-one")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSideCartPreview;
