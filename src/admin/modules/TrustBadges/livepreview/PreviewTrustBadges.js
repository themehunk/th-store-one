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

  console.log(border);

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

  const rotateTransform = `
    rotateX(${transformStyle?.rotateX || 0}deg)
    rotateY(${transformStyle?.rotateY || 0}deg)
    rotateZ(${transformStyle?.rotateZ || 0}deg)
  `;

  const transform = `${rotateTransform} ${flipTransform}`;

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
    positionStyle.top = undefined;
    positionStyle.right = undefined;
    positionStyle.bottom = undefined;
    positionStyle.left = undefined;

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

  /* ---------------- BADGE STYLE ---------------- */

  const badgeStyle = {
    fontSize: style?.text_size || "18px",
    background: style?.bgclr || "#0a70ed",
    color: style?.textclr || "#fff",
    opacity: (transformStyle?.opacity || 100) / 100,
    transform,

    paddingTop: finalPadding.top,
    paddingRight: finalPadding.right,
    paddingBottom: finalPadding.bottom,
    paddingLeft: finalPadding.left,

    marginTop: margin?.top,
    marginRight: margin?.right,
    marginBottom: margin?.bottom,
    marginLeft: margin?.left,

    // BORDER ONLY FOR TEXT BADGE
    ...(isTextBadge && {
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
}),

    ...positionStyle,
  };

  const imageWidth = style?.image_width || "100px";

  /* ---------------- BADGE RENDER ---------------- */

  const renderBadge = () => {
    if (settings.badges_type === "badges_text") {
      return (
        <div className="s1-preview-badge s1-text-badge" style={badgeStyle}>
          {settings.badgetext || "Badge"}
        </div>
      );
    }

    if (settings.badges_type === "badges_images") {
      return (
        <div className="s1-preview-badge s1-text-images" style={badgeStyle}>
          {settings.badge_image && (
            <img
              src={settings.badge_image}
              style={{ width: imageWidth }}
              alt=""
            />
          )}
        </div>
      );
    }

    if (settings.badges_type === "badges_css") {

    const type = settings.badge_css_type;

    if (type === "new") {
      return (
        <div className="s1-preview-badge s1-css-badge-new" style={badgeStyle}>
          NEW
        </div>
      );
    }

    if (type === "sale") {
      return (
        <div className="s1-preview-badge s1-css-badge-sale" style={badgeStyle}>
          SALE
        </div>
      );
    }

    return null;
  }

    if (settings.badges_type === "badges_advance") {
      return (
        <div className="s1-preview-badge s1-advance-badge" style={badgeStyle}>
          ★ {settings.badgetext || "Advance"}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="s1-product-badges-wrap">
      <div className="s1-preview-product s1-trust-badges">
        {renderBadge()}

        <div className="s1-preview-image-skeleton" />

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
