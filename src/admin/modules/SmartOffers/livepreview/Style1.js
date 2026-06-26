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

  const {
    x_qty = 2,
    y_qty = 5,
    discount_value = "20%",
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

    bxgy_price_text = "[DELPRICE] Worth [PRICE]",

    bxgy_short_description = "Included with Your Purchase",

    dynamic_offer_title = "Buy from [XQTY] to [YQTY] items for [DISCOUNT] OFF per item",

    dynamic_badge_text = "Save [DISCOUNT]",

    dynamic_price_text = "Price [DELPRICE] [PRICE]",

    dynamic_short_description = "[DISCOUNT] / each item",
  } = settings;

  const borderWidth = card_border?.width || {};
  const borderRadius = card_border?.radius || {};

  const previewStyle = {
    background: card_bg,
    "--th-radio-color": highlight_color,
    "--th-active-card": card_active_bg,
    "--th-active-boder-width": active_border_width,

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
  const shortcodeValues = {
    DELPRICE: "$408.00",
    PRICE: "$326.40",
    XQTY: x_qty,
    YQTY: y_qty,
    DISCOUNT: discount_value,
    REMAINING: 1,
  };

  /*
  ==================================
  BOGO
  ==================================
  */

  if (ruleType === "bogo") {
    return (
      <div
        className="th-smart-preview"
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
            >
              🎉 {bogo_offer_title}
            </div>

            <div
              className="th-badge"
              style={{
                background: badge_bg || "#111827",
                color: badge_color || "#ffffff",
              }}
            >
              {bogo_badge_text}
            </div>

            <div
              className="th-price"
              style={{
                color: price_color,
              }}
            >
              <del
                style={{
                  color: price_color,
                }}
              >
                $408.00
              </del>
              <span>{bogo_price_text}</span>
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
      shortcodeValues.DELPRICE,
      `<del>${shortcodeValues.DELPRICE}</del>`,
    );
    return (
      <div
        className="th-smart-preview"
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
                style={{
                  color: heading_color,
                }}
              >
                {replaceShortcodes(bxgy_offer_title, shortcodeValues)}
              </div>
            </div>

            <div
              className="th-badge"
              style={{
                background: badge_bg || "#111827",
                color: badge_color || "#ffffff",
              }}
            >
              {bxgy_badge_text}
            </div>

            <div className="th-offer-wrp">
              <div
                className="th-price"
                style={{
                  color: price_color,
                }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: replaceShortcodes(
                      bxgy_price_text,
                      shortcodeValues,
                    ).replace(
                      shortcodeValues.DELPRICE,
                      `<del style="margin-right:3px;">${shortcodeValues.DELPRICE}</del>`,
                    ),
                  }}
                />
              </div>
              <div
                className="th-desc"
                style={{
                  color: text_color,
                }}
              >
                {bxgy_short_description}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  ==================================
  DYNAMIC OFFER
  ==================================
  */

  const rows = [
    {
      x: 2,
      y: 2,
      discount: "20%",
      price: "$326.40",
    },
    {
      x: 3,
      y: 4,
      discount: "40%",
      price: "$244.80",
    },
    {
      x: 5,
      y: 8,
      discount: "60%",
      price: "$163.20",
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="th-smart-preview">
      {rows.map((item, i) => {
        const values = {
          DELPRICE: "$408.00",
          PRICE: item.price,
          XQTY: item.x,
          YQTY: item.y,
          DISCOUNT: item.discount,
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
                  style={{
                    color: heading_color,
                  }}
                >
                  {replaceShortcodes(dynamic_offer_title, values)}
                </div>
              </div>

              <div
                className="th-badge"
                style={{
                  background: badge_bg || "#111827",
                  color: badge_color || "#ffffff",
                }}
              >
                {replaceShortcodes(dynamic_badge_text, values)}
              </div>
              <div className="th-offer-wrp">
                <div className="th-price" style={{ color: price_color }}>
                  <span dangerouslySetInnerHTML={{ __html: processedPrice }} />
                </div>
                <div
                  className="th-desc"
                  style={{
                    color: text_color,
                  }}
                >
                  {replaceShortcodes(dynamic_short_description, values)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Style1;
