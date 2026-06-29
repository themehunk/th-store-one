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
    discount_value = "20%",
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

    dynamic_offer_title = "Buy [XQTY], get this gift free",
    dynamic_badge_text = "FREE GIFT",
    dynamic_price_text = "[DELPRICE] Worth [PRICE]",
    dynamic_short_description = "Included with your purchase",
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

  /* =========================================================
     1. BOGO RULE MODE (Single Row)
     ========================================================= */
  if (ruleType === "bogo") {
    const bogoValues = {
      DELPRICE: "$3150",
      PRICE: "$630",
      XQTY: 1,
    };

    return (
      <div className="th-offer-style-2">
        <style>{customStyles}</style>
        <div className="th-layout-card active" style={parentLayoutStyles}>
          <div className="th-radio-container">
            <div className="th-custom-radio" />
          </div>

          <div className="th-card-content">
            <h4 className="th-card-title">
              {replaceShortcodes(bogo_offer_title, bogoValues)}
            </h4>
            <div className="th-content-meta-row">
              <span className="th-gift-badge">{bogo_badge_text}</span>
            </div>
            <div className="th-price-info">
              <span>Price</span>
              <del>{bogoValues.DELPRICE}</del>
              <span>{bogoValues.PRICE}</span>
            </div>
            <p className="th-card-desc">{bogo_price_text}</p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
   2. BUY X GET Y RULE MODE (Two Default Rows)
   ========================================================= */
  if (ruleType === "buyxgety") {
    const bxgyValues1 = {
      DELPRICE: "$2500",
      PRICE: "$500",
      XQTY: 3,
      YQTY: 1,
    };

    const bxgyValues2 = {
      DELPRICE: "$5000",
      PRICE: "$1000",
      XQTY: 5,
      YQTY: 2,
    };

    return (
      <div className="th-offer-style-2">
        <style>{customStyles}</style>

        {/* First Offer */}
        <div className="th-layout-card active" style={parentLayoutStyles}>
          <div className="th-radio-container">
            <div className="th-custom-radio" />
          </div>

          <div className="th-gift-image">🎁</div>

          <div className="th-card-content">
            <h4 className="th-card-title">
              {replaceShortcodes(bxgy_offer_title, bxgyValues1)}
            </h4>

            <div className="th-content-meta-row">
              <span className="th-gift-badge">{bxgy_badge_text}</span>
            </div>

            <div className="th-price-info">
              <span>Price</span>
              <del>{bxgyValues1.DELPRICE}</del>
              <span>Worth {bxgyValues1.PRICE}</span>
            </div>

            <p className="th-card-desc">{bxgy_short_description}</p>
          </div>
        </div>

        {/* Second Offer */}
        <div
          className="th-layout-card"
          style={{
            ...parentLayoutStyles,
            marginTop: "15px",
          }}
        >
          <div className="th-radio-container">
            <div className="th-custom-radio" />
          </div>

          <div className="th-gift-image">🎁</div>

          <div className="th-card-content">
            <h4 className="th-card-title">
              {replaceShortcodes(bxgy_offer_title, bxgyValues2)}
            </h4>

            <div className="th-content-meta-row">
              <span className="th-gift-badge">{bxgy_badge_text}</span>
            </div>

            <div className="th-price-info">
              <span>Price</span>
              <del>{bxgyValues2.DELPRICE}</del>
              <span>Worth {bxgyValues2.PRICE}</span>
            </div>

            <p className="th-card-desc">{bxgy_short_description}</p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     3. DYNAMIC OFFER MODE (3 Rows List Like image (1).png)
     ========================================================= */
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

  const [activeIndex, setActiveIndex] = useState(1); // Row 2 Selected by Default

  return (
    <div className="th-offer-style-2">
      <style>{customStyles}</style>
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
            className={`th-layout-card ${activeIndex === i ? "active" : ""}`}
            onClick={() => setActiveIndex(i)}
            style={parentLayoutStyles}
          >
            {/* {row.isPopular && (
              <div className="th-popular-ribbon">Most Popular</div>
            )} */}
            <div className="th-radio-container">
              <div className="th-custom-radio" />
            </div>

            <div className="th-card-content">
              <h4 className="th-card-title">
                {replaceShortcodes(dynamic_offer_title, values)}
              </h4>
              <div className="th-content-meta-row">
                <span className="th-gift-badge">
                  {replaceShortcodes(dynamic_badge_text, values)}
                </span>
              </div>
              <div className="th-price-info">
                <span dangerouslySetInnerHTML={{ __html: processedPrice }} />
              </div>
              <p className="th-card-desc">
                <p className="th-card-desc">
                  {replaceShortcodes(dynamic_short_description, values)}
                </p>
              </p>
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
const customStyles = `
 
`;

export default Style2;
