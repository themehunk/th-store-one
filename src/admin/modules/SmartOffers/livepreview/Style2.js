import { useState } from "@wordpress/element";

const replaceShortcodes = (text = "", values = {}) => {
  if (!text) return "";

  let str = text;

  Object.keys(values).forEach((key) => {
    str = str.replaceAll(`{${key}}`, values[key]);
    str = str.replaceAll(`[${key}]`, values[key]);
  });

  return str;
};

const Style2 = ({ settings = {}, rule = {} }) => {
  const ruleType = rule?.rule_type || settings?.rule_type || "bogo";
  const style = settings?.offer_style || "style1";

  if (!style) {
    return (
      <div className="s1-fbt-preview-loader">
        <div className="s1-spinner"></div>
      </div>
    );
  }

  // Destructuring all settings
  const {
    x_qty = 2,
    y_qty = 5,
    reward_type = "free_product",
    discount_value = "20",
    active_border_width = "2px",
    heading_color = "#0f172a",
    text_color = "#64748b",
    price_color = "#334155",
    highlight_color = "#0f172a",
    badge_bg = "#0f172a",
    badge_color = "#ffffff",
    card_bg = "#ffffff",
    border_color = "#e2e8f0",

    bogo_offer_title = "Buy 1, get this gift free",
    bogo_badge_text = "FREE GIFT",
    bogo_price_text = "[DELPRICE] Worth [PRICE]",
    bogo_short_description = "Included with your purchase",

    bxgy_offer_title = "Buy [XQTY], get this gift free",
    bxgy_badge_text = "FREE GIFT",
    bxgy_price_text = "[DELPRICE] Worth [PRICE]",
    bxgy_short_description = "Included with your purchase",

    dynamic_offer_title = "Buy from {from_qty} to {to_qty} items for {discount} OFF per item",
    dynamic_badge_text = "Save {discount}",
    dynamic_price_text = "Price {del_price} {discount_price}",
    dynamic_short_description = "{discount_price} / each item",
    card_border = {},
    padding = {},
  } = settings;

  const borderWidth = card_border?.width || {};
  const borderRadius = card_border?.radius || {};

  // Base layout inline-style to handle potential background color updates
  const parentLayoutStyles = {
    "--th-card-bg": card_bg,
    "--th-border-color": border_color,
    "--th-radio-color": highlight_color,
    "--th-heading-color": heading_color,
    "--th-text-color": text_color,
    "--th-price-color": price_color,
    "--th-badge-bg": badge_bg,
    "--th-badge-color": badge_color,

    borderStyle: card_border?.style || "solid",
    borderColor: card_border?.color || "#d1d5db",

    borderTopWidth: borderWidth.top || "1px",
    borderRightWidth: borderWidth.right || "1px",
    borderBottomWidth: borderWidth.bottom || "1px",
    borderLeftWidth: borderWidth.left || "1px",

    borderTopLeftRadius: borderRadius.top || "16px",
    borderTopRightRadius: borderRadius.right || "16px",
    borderBottomRightRadius: borderRadius.bottom || "16px",
    borderBottomLeftRadius: borderRadius.left || "16px",

    paddingTop: padding?.top || "14px",
    paddingRight: padding?.right || "14px",
    paddingBottom: padding?.bottom || "14px",
    paddingLeft: padding?.left || "14px",
  };

  const currency = th_StoreOneAdmin?.currency_symbol || "$";

  const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;
  /* =========================================================
   1. BOGO RULE MODE (Single Row)
   ========================================================= */
  if (ruleType === "bogo") {
    const shortcodeValues = {
      original_price: formatPrice(408),
      discount_price: formatPrice(326.4),
      del_price: `<del>${formatPrice(408)}</del>`,
      title: "Product Title",
    };

    return (
      <div className="th-offer-style-2">
        <style>{customStyles}</style>

        <div className="th-layout-card active" style={parentLayoutStyles}>
          <div className="th-radio-container">
            <div className="th-custom-radio" />
          </div>

          <div className="th-card-content">
            <h4
              className="th-card-title"
              style={{ color: heading_color }}
              dangerouslySetInnerHTML={{
                __html: replaceShortcodes(bogo_offer_title, shortcodeValues),
              }}
            />

            <div className="th-content-meta-row">
              <span
                className="th-gift-badge"
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(bogo_badge_text, shortcodeValues),
                }}
              />
            </div>

            <div
              className="th-price-info"
              dangerouslySetInnerHTML={{
                __html: replaceShortcodes(bogo_price_text, shortcodeValues),
              }}
            />

            <p
              className="th-card-desc"
              dangerouslySetInnerHTML={{
                __html: replaceShortcodes(
                  bogo_short_description,
                  shortcodeValues,
                ),
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
   2. BUY X GET Y RULE MODE (Two Default Rows)
   ========================================================= */
  if (ruleType === "buyxgety") {
    const getDiscountText = () => {
      switch (reward_type) {
        case "free_product":
          return "100% OFF";

        case "discount_percent":
          return `${discount_value}% OFF`;

        case "discount_fixed":
          return `-${formatPrice(discount_value)}`;

        case "discount_fixed_price":
          return formatPrice(discount_value);

        default:
          return "";
      }
    };

    const offer1Values = {
      original_price_x: formatPrice(408),
      original_price_y: formatPrice(39.99),

      del_price_x: `<del>${formatPrice(408)}</del>`,
      del_price_y: `<del>${formatPrice(39.99)}</del>`,

      discount_price: formatPrice(19.99),
      difference_price: formatPrice(20),

      x_qty: 1,
      y_qty: 1,

      discount: getDiscountText(),

      title: "Product Title",
    };

    const offer2Values = {
      original_price_x: formatPrice(408),
      original_price_y: formatPrice(59.99),

      del_price_x: `<del>${formatPrice(408)}</del>`,
      del_price_y: `<del>${formatPrice(59.99)}</del>`,

      discount_price: formatPrice(29.99),
      difference_price: formatPrice(30),

      x_qty: 2,
      y_qty: 1,

      discount: getDiscountText(),

      title: "Product Title",
    };

    const renderOffer = (values, active = false) => (
      <div
        className={`th-layout-card ${active ? "active" : ""}`}
        style={{
          ...parentLayoutStyles,
          ...(active ? {} : { marginTop: "15px" }),
        }}
      >
        <div className="th-radio-container">
          <div className="th-custom-radio" />
        </div>

        <div className="th-gift-image">🎁</div>

        <div className="th-card-content">
          <h4
            className="th-card-title"
            dangerouslySetInnerHTML={{
              __html: replaceShortcodes(bxgy_offer_title, values),
            }}
          />

          <div className="th-content-meta-row">
            <span
              className="th-gift-badge"
              dangerouslySetInnerHTML={{
                __html: replaceShortcodes(bxgy_badge_text, values),
              }}
            />
          </div>

          <div
            className="th-price-info"
            dangerouslySetInnerHTML={{
              __html: replaceShortcodes(bxgy_price_text, values),
            }}
          />

          <p
            className="th-card-desc"
            dangerouslySetInnerHTML={{
              __html: replaceShortcodes(bxgy_short_description, values),
            }}
          />
        </div>
      </div>
    );

    return (
      <div className="th-offer-style-2">
        <style>{customStyles}</style>

        {renderOffer(offer1Values, true)}
        {renderOffer(offer2Values)}
      </div>
    );
  }

  /* =========================================================
   3. DYNAMIC OFFER MODE
   ========================================================= */

  const getTierDiscount = (offer, value) => {
    switch (offer) {
      case "percent":
        return `${value}%`;

      case "fixed":
        return formatPrice(value);

      case "fixed_price":
        return formatPrice(value);

      default:
        return "";
    }
  };

  const tiers = rule.quantity_tiers?.length
    ? rule.quantity_tiers
    : [
        {
          from_qty: 1,
          to_qty: 5,
          offer: "percent",
          value: 20,
        },
      ];

  const rows = tiers.map((tier) => ({
    from_qty: tier.from_qty,
    to_qty: tier.to_qty,
    qty: tier.from_qty,

    original_price: formatPrice(408),
    del_price: `<del>${formatPrice(408)}</del>`,

    discount_price: formatPrice(326.4),
    difference_price: formatPrice(81.6),

    discount: getTierDiscount(tier.offer, tier.value),
    del_price: `<del>${formatPrice(408)}</del>`,
  }));

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="th-offer-style-2">
      <style>{customStyles}</style>

      {rows.map((item, i) => {
        const values = {
          from_qty: item.from_qty,
          to_qty: item.to_qty,
          qty: item.qty,

          original_price: item.original_price,
          del_price: item.del_price,

          discount_price: item.discount_price,
          difference_price: item.difference_price,

          discount: item.discount,
        };

        return (
          <div
            key={i}
            className={`th-layout-card ${activeIndex === i ? "active" : ""}`}
            onClick={() => setActiveIndex(i)}
            style={parentLayoutStyles}
          >
            <div className="th-radio-container">
              <div className="th-custom-radio" />
            </div>

            <div className="th-card-content">
              <h4
                className="th-card-title"
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(dynamic_offer_title, values),
                }}
              />

              <div className="th-content-meta-row">
                <span
                  className="th-gift-badge"
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(dynamic_badge_text, values),
                  }}
                />
              </div>

              <div
                className="th-price-info"
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(dynamic_price_text, values),
                }}
              />

              <p
                className="th-card-desc"
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(dynamic_short_description, values),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   COMMON REUSABLE CSS STYLES (Screenshot Matched)
   ========================================================= */
const customStyles = ``;

export default Style2;
