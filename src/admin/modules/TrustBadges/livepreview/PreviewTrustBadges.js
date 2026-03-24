import "./live-style.css";

const TrustBadges = ({ settings = {} }) => {
  const style = settings?.badge_style || {};
  const padding = style?.padding || {};
  const margin = style?.margin || {};
  const flip = style?.flip || {};
  const transformStyle = style?.transform || {};
  const pos = style?.position || {};
  const unit = pos.unit || "px";
  const border = style?.border || {};

  const isTextBadge = settings?.badges_type === "badges_text";

  const defaultPadding = {
    top: "12px",
    right: "15px",
    bottom: "12px",
    left: "15px",
  };

  /* ---------------- FLIP ---------------- */
  let flipTransform = "";

  if (flip?.enabled) {
    if (flip.orientation === "horizontal") flipTransform = "scaleX(-1)";
    if (flip.orientation === "vertical") flipTransform = "scaleY(-1)";
    if (flip.orientation === "both") flipTransform = "scale(-1,-1)";
  }

  /* ---------------- ROTATE ---------------- */
  const rotateTransform = `     rotateX(${transformStyle?.rotateX || 0}deg)
    rotateY(${transformStyle?.rotateY || 0}deg)
    rotateZ(${transformStyle?.rotateZ || 0}deg)
  `;

  /* ---------------- POSITION ---------------- */
  let positionStyle = { position: "absolute" };

  if (pos.mode === "custom") {
    if (pos.anchor === "top-left") {
      positionStyle = {
        position: "absolute",
        top: pos.top ? pos.top + unit : "0px",
        left: pos.left ? pos.left + unit : "0px",
      };
    }

    if (pos.anchor === "top-right") {
      positionStyle = {
        position: "absolute",
        top: pos.top ? pos.top + unit : "0px",
        right: pos.right ? pos.right + unit : "0px",
      };
    }

    if (pos.anchor === "bottom-left") {
      positionStyle = {
        position: "absolute",
        bottom: pos.bottom ? pos.bottom + unit : "0px",
        left: pos.left ? pos.left + unit : "0px",
      };
    }

    if (pos.anchor === "bottom-right") {
      positionStyle = {
        position: "absolute",
        bottom: pos.bottom ? pos.bottom + unit : "0px",
        right: pos.right ? pos.right + unit : "0px",
      };
    }
  }

  if (pos.mode === "fixed") {
    if (pos.position === "top") positionStyle.top = "10px";
    if (pos.position === "middle") positionStyle.top = "50%";
    if (pos.position === "bottom") positionStyle.bottom = "10px";

    if (pos.align === "left") positionStyle.left = "10px";

    if (pos.align === "center") {
      positionStyle.left = "50%";
      positionStyle.transform = "translateX(-50%)";
    }

    if (pos.align === "right") positionStyle.right = "10px";
  }

  /* ---------------- FINAL TRANSFORM ---------------- */
  const finalTransform = `     ${rotateTransform}
    ${flipTransform}
    ${positionStyle.transform || ""}
  `;

  /* ---------------- PADDING ---------------- */
  const finalPadding = {
    top:
      isTextBadge && (!padding.top || padding.top === "0px")
        ? defaultPadding.top
        : padding.top,

    right:
      isTextBadge && (!padding.right || padding.right === "0px")
        ? defaultPadding.right
        : padding.right,

    bottom:
      isTextBadge && (!padding.bottom || padding.bottom === "0px")
        ? defaultPadding.bottom
        : padding.bottom,

    left:
      isTextBadge && (!padding.left || padding.left === "0px")
        ? defaultPadding.left
        : padding.left,
  };

  /* ---------------- WRAPPER STYLE ---------------- */
  const wrapperStyle = {
    ...positionStyle,
    transform: finalTransform,
    opacity: (transformStyle?.opacity || 100) / 100,
    marginTop: margin?.top,
    marginRight: margin?.right,
    marginBottom: margin?.bottom,
    marginLeft: margin?.left,
  };

  /* ---------------- INNER STYLE ---------------- */
  const innerStyle = {
    fontSize: style?.text_size || "18px",
    background: style?.bgclr || "#0a70ed",
    color: style?.textclr || "#fff",

    paddingTop: finalPadding.top,
    paddingRight: finalPadding.right,
    paddingBottom: finalPadding.bottom,
    paddingLeft: finalPadding.left,

    borderStyle: border?.style || "solid",
    borderColor: border?.color || "#eee",

    borderTopWidth: border?.width?.top || "0px",
    borderRightWidth: border?.width?.right || "0px",
    borderBottomWidth: border?.width?.bottom || "0px",
    borderLeftWidth: border?.width?.left || "0px",

    borderTopLeftRadius: border?.radius?.top || "0px",
    borderTopRightRadius: border?.radius?.right || "0px",
    borderBottomRightRadius: border?.radius?.bottom || "0px",
    borderBottomLeftRadius: border?.radius?.left || "0px",
  };

  const imageWidth = style?.image_width || "100px";

  /* ---------------- RENDER FUNCTIONS ---------------- */

  const renderTextBadge = () => (
    <div className="s1-preview-badge" style={wrapperStyle}>
      {" "}
      <div className="s1-text-badge" style={innerStyle}>
        {settings.badgetext || "Badge"}{" "}
      </div>{" "}
    </div>
  );

  const renderImageBadge = () => (
    <div className="s1-preview-badge" style={wrapperStyle}>
      {settings.badge_image && (
        <img src={settings.badge_image} style={{ width: imageWidth }} alt="" />
      )}{" "}
    </div>
  );


const withUnit = (val, unit = "px") => {
  if (val === undefined || val === null || val === "") return undefined;

  // already has unit
  if (typeof val === "string" && /[a-z%]+$/i.test(val)) {
    return val;
  }

  return `${val}${unit}`;
};
  // only for css type
  const renderCssBadge = () => {
    const type = settings?.badge_css_type;

    const cssinnerStyle = {
  fontSize: withUnit(style?.text_size || 18),
  background: style?.bgclr || "#0a70ed",
  color: style?.textclr || "#fff",

  borderStyle: border?.style || "solid",
  borderColor: border?.color || "#eee",

  borderTopWidth: withUnit(border?.width?.top || 0),
  borderRightWidth: withUnit(border?.width?.right || 0),
  borderBottomWidth: withUnit(border?.width?.bottom || 0),
  borderLeftWidth: withUnit(border?.width?.left || 0),

  borderTopLeftRadius: withUnit(border?.radius?.top || 0),
  borderTopRightRadius: withUnit(border?.radius?.right || 0),
  borderBottomRightRadius: withUnit(border?.radius?.bottom || 0),
  borderBottomLeftRadius: withUnit(border?.radius?.left || 0),

  paddingTop: withUnit(padding?.top ?? 12),
  paddingRight: withUnit(padding?.right ?? 15),
  paddingBottom: withUnit(padding?.bottom ?? 12),
  paddingLeft: withUnit(padding?.left ?? 15),
};
 
    if (type === "new") {
      return (
        <div className="s1-preview-badge" style={wrapperStyle}>
          <div className="s1-css-badge-new" style={cssinnerStyle}>
            <div className="s1-css-badge-inner">
              {settings.badgetext || "NEW"}
            </div>
          </div>
        </div>
      );
    }

    if (type === "sale") {
      return (
        <div className="s1-preview-badge" style={wrapperStyle}>
          <div className="s1-css-badge-sale" style={cssinnerStyle}>
            <div className="s1-css-badge-inner">
              {settings.badgetext || "SALE"}
            </div>
          </div>
        </div>
      );
    }

    if (type === "newsale") {
      return (
        <div className="s1-ribbon-wrap-s2" style={wrapperStyle}>
          <div
            className="s1-ribbon-wrap"
            style={{
              "--badge-color": style?.bgclr,
              "--badge-txt": style?.textclr,
              "--badge-txtsize":withUnit(style?.text_size || 15),
              "--badge-padding": `${withUnit(padding?.top ?? 6)} 
                      ${withUnit(padding?.right ?? 12)} 
                      ${withUnit(padding?.bottom ?? 6)} 
                      ${withUnit(padding?.left ?? 6)}`
            }}
          >
            <div className="s1-ribbon-s2"></div>
            <div className="s1-ribbon-text">
              {settings.badgetext || "ACCESSORIES!"}
            </div>
          </div>
        </div>
      );
    }
    if (type === "sale_badge_pink") {
      return (
        <div className="s1-sale_badge_pink" style={wrapperStyle}>
          <div class="s1-sale-badge" style={{
              "--badge-salebgcolor": style?.bgclr,
              "--badge-salebgtxt": style?.textclr,
              "--badge-saletxtsize":withUnit(style?.text_size || 15),
              "--badge-salepadding": `${withUnit(padding?.top ?? 5)} 
                      ${withUnit(padding?.right ?? 5)} 
                      ${withUnit(padding?.bottom ?? 5)} 
                      ${withUnit(padding?.left ?? 5)}`
            }}>
          <span> {settings.badgetext || "Sale!"}</span>
        </div>
        </div>
      );
    }
    if (type === "saletxt") {
      return (
        <div className="s1-sale_txt" style={wrapperStyle}>
              <div class="s1-sale-underline" style={{
              "--badge-saletxtbgcolor": style?.bgclr,
              "--badge-saletxt": style?.textclr,
              "--badge-saletxtsize1":withUnit(style?.text_size || 21),
              "--badge-salepadding1": `${withUnit(padding?.top ?? 5)} 
                             ${withUnit(padding?.right ?? 5)} 
                             ${withUnit(padding?.bottom ?? 5)} 
                             ${withUnit(padding?.left ?? 5)}`
              
              
            }}>
            {settings.badgetext || "Sale!"}
            
        </div>
        </div>
      );
    }

    return null;
  };

  const renderAdvanceBadge = () => {
    const type = settings?.badge_advance_type;
    const display = settings?.displayBadge;

    const value = display === "s1-percent" ? "50%" : "50$";

    const advinnerStyle = {
      fontSize: style?.text_size || "18px",
      background: style?.bgclr || "#0a70ed",
      color: style?.textclr || "#fff",

      "--adv-bg": style?.bgclr || "#0a70ed",
    };

    if (type === "one") {
      return (
        <div className="s1-preview-badge" style={wrapperStyle}>
          <div className="s1-adv-circle" style={advinnerStyle}>
            <div>{value}</div>
            <small>OFF</small>
          </div>
        </div>
      );
    }

    if (type === "two") {
      return (
        <div className="s1-preview-badge" style={wrapperStyle}>
          <div className="s1-adv-burst" style={advinnerStyle}>
            <div>{value}</div>
            <small>OFF</small>
          </div>
        </div>
      );
    }

    if (type === "three") {
      return (
        <div className="s1-preview-badge s1-3" style={wrapperStyle}>
          <div
            className="s1-badge-svg"
            style={{
              "--badge-3-color": style?.bgclr,
              "--badge-3-txt": style?.textclr,
            }}
          >
            <svg viewBox="0 0 65.75 71.375">
              <polygon
                className="s1-secondary"
                points="58.084,0 58.084,71.375 34.875,64.365 8.916,70.625 8.916,0"
              />
              <polygon
                className="s1-primary"
                points="65.75,30.25 32.875,30.25 0,30.25 5.345,38.5 0,45.75 32.875,45.75 65.75,45.75 60.404,38.5"
              />
            </svg>
          </div>

          <div
            className="s1-badge-text"
            style={{
              "--badge-3-txt": style?.textclr,
            }}
          >
            <div className="percent">{value}</div>
            <div className="label">{"DISCOUNT"}</div>
            <div className="save">{"Save $15"}</div>
          </div>
        </div>
      );
    }

    if (type === "four") {
      return (
        <div className="s1-preview-badge s1-corner-badge" style={wrapperStyle}>
          {/* SVG SHAPE */}
          <div
            className="s1-badge-shape"
            style={{
              "--badge-4-color": style?.bgclr,
              "--badge-4-txt": style?.textclr,
            }}
          >
            <svg viewBox="0 0 91.333 91">
              <polygon points="53.666,0 91.333,38.385 91.333,91 0,0" />
            </svg>
          </div>

          {/* ROTATED TEXT */}
          <div
            className="s1-badge-text"
            style={{
              "--badge-4-color": style?.bgclr,
              "--badge-4-txt": style?.textclr,
            }}
          >
            <div className="value">-{value || "32"}</div>
          </div>
        </div>
      );
    }

    if (type === "five") {
      return (
        <div className="s1-adv-css-badge s1-5" style={wrapperStyle}>
          <div
            className="s1-css-s1"
            style={{
              "--badge-5-color": style?.bgclr,
              "--badge-5-txt": style?.textclr,
            }}
          ></div>

          <div
            className="s1-css-text"
            style={{
              "--badge-5-color": style?.bgclr,
              "--badge-5-txt": style?.textclr,
            }}
          >
            {"Only 5 availables"}
          </div>
        </div>
      );
    }
    if (type === "daimond") {
      return (
        <div className="s1-adv-css-badge s1-daimond" style={wrapperStyle}>
          <div class="s1-diamond-badge" style={{
              "--badge-daimondbgcolor": style?.bgclr,
              "--badge-daimondtxt": style?.textclr,
            }}>
           <span>-{value || "50"}</span>
        </div>
        </div>
      );
    }
    if (type === "circle") {
      return (
        <div className="s1-adv-css-badge s1-circle" style={wrapperStyle}>
        <div class="s1-off-badge" style={{
              "--badge-circlebgcolor": style?.bgclr,
              "--badge-circletxt": style?.textclr,
            }}>
        <div class="s1-off-inner">
          <span class="s1-off-value">50%</span>
          <span class="s1-off-text">OFF</span>
        </div>
        </div>
      </div>
      );
    }

    return null;
  };

  const renderBadge = () => {
    switch (settings.badges_type) {
      case "badges_text":
        return renderTextBadge();

      case "badges_images":
        return renderImageBadge();

      case "badges_css":
        return renderCssBadge();

      case "badges_advance":
        return renderAdvanceBadge();

      default:
        return null;
    }
  };

  return (
    <div className="s1-product-badges-wrap">
      <div className="s1-preview-product s1-trust-badges">
        
        <div className="s1-preview-image-skeleton">
          {renderBadge()}
        </div>
        <div className="s1-preview-title-skeleton">
          <span />
          <span />
        </div>

        <div className="s1-preview-price-skeleton" />
      </div>
    </div>
  );
};

export default TrustBadges;
