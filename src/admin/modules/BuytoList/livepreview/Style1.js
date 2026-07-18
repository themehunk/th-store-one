import React from "react";
import { __ } from "@wordpress/i18n";
import { ICONS } from "@th-storeone-global/icons";

const Style1 = ({ settings = {} }) => {
  /* ================= ICON MAP ================= */
  const iconMap = {
    check: ICONS.CheckSVG,
    star: ICONS.StarSVG,
    heart: ICONS.HeartSVG,
    bolt: ICONS.BoltSVG,
    rocket: ICONS.RocketSVG,
  };

  const renderItemIcon = (item = {}) => {
    // Prefer item settings, fallback to rule
    const iconType = item.icontype || settings.icontype || "icon";
    const selectedIcon =
      item.selected_icon || settings.selected_icon || "check";

    const imageUrl = item.image_url || settings.image_url;
    const customSvg = item.custom_svg || settings.custom_svg;

    // 1. Preset Icon
    if (iconType === "icon") {
      const IconComponent = iconMap[selectedIcon] || ICONS.CheckSVG;

      if (typeof IconComponent === "function") {
        return <IconComponent />;
      }

      return React.isValidElement(IconComponent) ? (
        IconComponent
      ) : (
        <ICONS.CheckSVG />
      );
    }

    // 2. Custom SVG
    if (iconType === "custom_svg" && customSvg?.trim()) {
      return (
        <span
          className="s1-custom-svg"
          dangerouslySetInnerHTML={{ __html: customSvg }}
        />
      );
    }

    // 3. Image
    if (iconType === "image" && imageUrl) {
      return (
        <img
          src={imageUrl}
          alt=""
          className="s1-icon-image"
          style={{
            width: "16px",
            height: "16px",
            objectFit: "contain",
          }}
        />
      );
    }

    return null;
  };

  /* ================= MAIN RETURN ================= */
  return (
    <div className="s1-product-preview btl-style-1">
      <div className="s1-main-product">
        {/* Dummy Product Image */}
        <div className="s1-main-thumb">
          <div className="static-skeleton static-main-img"></div>
        </div>

        <div className="s1-main-info">
          <div className="static-skeleton static-title"></div>
          <div className="static-skeleton static-price"></div>

          {/* ================= BUY TO LIST ================= */}
          <div
            className="s1-btl-preview s1-btl-preview-1"
            style={{
              background: settings.btl_bg_clr || "#fff",
              borderColor: settings.btl_border_clr || "#e5e7eb",
              borderRadius: settings.btl_border_radius || "8px",
            }}
          >
            {/* Title */}
            <div
              className="s1-btl-title"
              style={{
                color: settings.btl_title_clr || "#111",
              }}
            >
              {settings.list_title || "Featured List"}
            </div>

            {/* List */}
            <ul className="s1-btl-list">
              {(settings.buy_list || []).map((item) => (
                <li key={item.id} className="s1-btl-item">
                  {item.icon_enabled && (
                    <span
                      className="s1-btl-icon"
                      style={{
                        background:
                          item.icontype === "image"
                            ? "transparent"
                            : settings.btl_icon_bg_clr || "#fff",
                        color: settings.btl_icon_clr || "#2563eb",
                      }}
                    >
                      {renderItemIcon(item)}
                    </span>
                  )}

                  <span
                    className="s1-btl-text"
                    style={{ color: settings.btl_list_clr || "#111" }}
                  >
                    {item.text || ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* ================= END BUY TO LIST ================= */}

          <div className="s1-main-cart">
            <div className="static-skeleton static-qty"></div>
            <div className="static-skeleton static-btn"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Style1;
