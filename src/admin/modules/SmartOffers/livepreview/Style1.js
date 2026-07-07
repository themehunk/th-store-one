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

const Style1 = ({ settings = {}, rule = {} }) => {
  const ruleType = rule?.rule_type || settings?.rule_type || "bogo";
  const style = settings?.offer_style || "style1";
  //Tab click → Design SelectControl change
  const changeStyle = (value) => {
    window.dispatchEvent(
      new CustomEvent("storeone:changeListStyle", {
        detail: { style: value },
      }),
    );
  };

  if (!style) {
    return (
      <div className="s1-fbt-preview-loader">
        <div className="s1-spinner"></div>
      </div>
    );
  }

  const currency = th_StoreOneAdmin?.currency_symbol || "$";

  const formatPrice = (price) => `${currency}${Number(price).toFixed(2)}`;

  const {
    x_qty = 2,
    y_qty = 5,
    reward_type = "free_product",
    discount_value = "20",
    active_border_width = "2px",
    heading_color = "#111827",
    text_color = "#6b7280",
    price_color = "#6b7280",
    highlight_color = "#111",
    badge_bg = "#111827",
    badge_color = "#ffffff",

    radio_color = "#ef4444",

    card_bg = "#ffffff",
    card_active_bg = "#f8fafc",

    border_color = "#d1d5db",

    card_border = {},
    padding = {},

    bogo_offer_title = "Buy One, Get One",
    bogo_badge_text = "BOGO SALE",
    bogo_price_text = "FREE",

    bxgy_offer_title = "Buy [XQTY] Products & Get This Gift FREE",

    bxgy_badge_text = "FREE GIFT",

    bxgy_price_text = "[original_price] Worth [discount_price]",

    bxgy_short_description = "Included with Your Purchase",

    dynamic_offer_title = "Buy from [XQTY] to [YQTY] items for [DISCOUNT] OFF per item",

    dynamic_badge_text = "Save [DISCOUNT]",

    dynamic_price_text = "Price [original_price] [discount_price]",

    dynamic_short_description = "[DISCOUNT] / each item",
  } = settings;

  const borderWidth = card_border?.width || {};
  const borderRadius = card_border?.radius || {};

  const previewStyle = {
    background: card_bg,
    "--th-radio-color": highlight_color,
    "--th-active-card": card_active_bg,

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
  // for bogo only
  const shortcodeValues = {
    original_price: formatPrice(408),
    discount_price: formatPrice(326.4),
    del_price: `<del>${formatPrice(408)}</del>`,
    title: "Product Title",
  };

  /*
  ==================================
  BOGO
  ==================================
  */

  if (ruleType === "bogo") {
    return (
      <div
        className="th-smart-preview bogo active-card"
        style={{
          ...previewStyle,
        }}
      >
        <div className="th-offer-row">
          <div className="th-radio-mark active" />
          <div className="th-offer-content">
            <div
              className="th-offer-title"
              style={{
                color: heading_color,
              }}
              dangerouslySetInnerHTML={{
                __html: `🎉 ${replaceShortcodes(
                  bogo_offer_title,
                  shortcodeValues,
                )}`,
              }}
            />

            <div
              className="th-badge"
              style={{
                background: badge_bg || "#111827",
                color: badge_color || "#ffffff",
              }}
              dangerouslySetInnerHTML={{
                __html: replaceShortcodes(bogo_badge_text, shortcodeValues),
              }}
            />

            <div className="th-price" style={{ color: price_color }}>
              <span
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(bogo_price_text, shortcodeValues),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  /*
  ==================================
  BUY X GET Y
  ==================================
  */

  if (ruleType === "buyxgety") {
    const formattedPrice = replaceShortcodes(
      bxgy_price_text,
      shortcodeValues,
    ).replace(
      shortcodeValues.original_price,
      `<del>${shortcodeValues.original_price}</del>`,
    );

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
      original_price_x: formatPrice(408.0),
      original_price_y: formatPrice(39.99),

      del_price_x: `<del>${formatPrice(408.0)}</del>`,
      del_price_y: `<del>${formatPrice(39.99)}</del>`,

      discount_price: formatPrice(19.99),
      difference_price: formatPrice(20.0),

      x_qty: 1,
      y_qty: 1,

      discount: getDiscountText(),

      title: "Product Title",
    };

    const offer2Values = {
      original_price_x: formatPrice(408.0),
      original_price_y: formatPrice(59.99),
      del_price_x: `<del>${formatPrice(408.0)}</del>`,
      del_price_y: `<del>${formatPrice(59.99)}</del>`,
      discount_price: formatPrice(29.99),
      difference_price: formatPrice(30.0),
      x_qty: 2,
      y_qty: 1,
      discount: getDiscountText(),
      title: "Product Title",
    };

    return (
      <>
        <div
          className="th-smart-preview bxgy active-card"
          style={{
            background: card_bg,
            borderColor: border_color,
            ...previewStyle,
          }}
        >
          <div className="th-offer-row">
            <div className="th-radio-mark active" />
            <div className="th-gift-image">🎁</div>

            <div className="th-offer-content">
              <div className="th-offer-left">
                <div
                  className="th-offer-title"
                  style={{ color: heading_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(bxgy_offer_title, offer1Values),
                  }}
                />
              </div>
              <div
                className="th-badge"
                style={{
                  background: badge_bg || "#111827",
                  color: badge_color || "#fff",
                }}
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(bxgy_badge_text, offer1Values),
                }}
              />
              <div className="th-offer-wrp">
                <div
                  className="th-price"
                  style={{ color: price_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(bxgy_price_text, offer1Values),
                  }}
                />
                <div
                  className="th-desc"
                  style={{ color: text_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(
                      bxgy_short_description,
                      offer1Values,
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="th-smart-preview bxgy"
          style={{
            background: card_bg,
            borderColor: border_color,
            marginTop: "15px",
            ...previewStyle,
          }}
        >
          <div className="th-offer-row">
            <div className="th-radio-mark" />
            <div className="th-gift-image">🎁</div>

            <div className="th-offer-content">
              <div className="th-offer-left">
                <div
                  className="th-offer-title"
                  style={{ color: heading_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(bxgy_offer_title, offer1Values),
                  }}
                />
              </div>

              <div
                className="th-badge"
                style={{
                  background: badge_bg || "#111827",
                  color: badge_color || "#fff",
                }}
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(bxgy_badge_text, offer1Values),
                }}
              />

              <div className="th-offer-wrp">
                <div className="th-price" style={{ color: price_color }}>
                  <div
                    className="th-price"
                    style={{ color: price_color }}
                    dangerouslySetInnerHTML={{
                      __html: replaceShortcodes(bxgy_price_text, offer1Values),
                    }}
                  />
                </div>

                <div
                  className="th-desc"
                  style={{ color: text_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(
                      bxgy_short_description,
                      offer1Values,
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /*
  ==================================
  DYNAMIC OFFER
  ==================================
  */

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
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="th-smart-preview">
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
        const processedPrice = replaceShortcodes(
          dynamic_price_text,
          values,
        ).replace(
          values.DELPRICE,
          `<del style="margin-right: 5px;">${values.DELPRICE}</del>`,
        );
        return (
          <div
            key={i}
            className={`th-dynamic-row ${activeIndex === i ? "active" : ""}`}
            onClick={() => setActiveIndex(i)}
            style={{
              background: card_bg,
              borderColor: border_color,
              ...previewStyle,
            }}
          >
            <div
              className={`th-radio-mark ${activeIndex === i ? "active" : ""}`}
            />

            <div className="th-offer-content">
              <div className="th-offer-left">
                <div
                  className="th-offer-title"
                  style={{ color: heading_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(dynamic_offer_title, values),
                  }}
                />
              </div>

              <div
                className="th-badge"
                style={{
                  background: badge_bg,
                  color: badge_color,
                }}
                dangerouslySetInnerHTML={{
                  __html: replaceShortcodes(dynamic_badge_text, values),
                }}
              />
              <div className="th-offer-wrp">
                <div
                  className="th-price"
                  style={{ color: price_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(dynamic_price_text, values),
                  }}
                />
                <div
                  className="th-desc"
                  style={{ color: text_color }}
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(
                      dynamic_short_description,
                      values,
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Style1;
