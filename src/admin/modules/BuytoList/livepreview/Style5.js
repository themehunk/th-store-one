import { __ } from "@wordpress/i18n";
import { ICONS } from "@th-storeone-global/icons";

const dummy = [
  {
    id: 1,
    img:
      th_StoreOneAdmin.homeUrl +
      "wp-content/plugins/th-store-one/assets/images/prd1.png",
    name: "Dewleaf Hydration Serum",
    price: "$119.00",
  },
  {
    id: 2,
    img:
      th_StoreOneAdmin.homeUrl +
      "wp-content/plugins/th-store-one/assets/images/prd2.png",
    name: "Rosemist Daily Cream",
    price: "$40.00",
  },
];

const Style5 = ({ settings = {} }) => {
  /* ================= ICON MAP ================= */
  const iconMap = {
    check: ICONS.CheckSVG,
    star: ICONS.StarSVG,
    heart: ICONS.HeartSVG,
    bolt: ICONS.BoltSVG,
    rocket: ICONS.RocketSVG,
  };

  /* ================= PER ITEM ICON RENDER ================= */
  const renderItemIcon = (item) => {
    // Safety checks
    if (!item || typeof item !== "object") return null;
    if (!item.icon_enabled) return null;

    const iconType = item.icontype || "icon";

    // 1. Preset SVG Icon

    if (iconType === "icon") {
      const IconComponent = iconMap[item.selected_icon] || ICONS.CheckSVG;

      if (IconComponent) {
        // Method 1: Normal (most common)
        if (typeof IconComponent === "function") {
          return <IconComponent />;
        }

        // Method 2: Agar already JSX element hai
        if (React.isValidElement(IconComponent)) {
          return IconComponent;
        }

        return <ICONS.CheckSVG />; // default fallback
      }
      return <ICONS.CheckSVG />;
    }

    // 2. Custom SVG
    if (
      iconType === "custom_svg" &&
      typeof item.custom_svg === "string" &&
      item.custom_svg.trim()
    ) {
      return (
        <span
          className="s1-custom-svg"
          dangerouslySetInnerHTML={{ __html: item.custom_svg }}
          key={item.id}
        />
      );
    }

    // 3. Image Upload
    if (
      iconType === "image" &&
      typeof item.image_url === "string" &&
      item.image_url
    ) {
      return (
        <img
          key={item.id}
          src={item.image_url}
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
  return (
    <div className="s1-product-preview btl-style-5">
      <div className="s1-main-product">
        <div className="s1-main-thumb">
          <div className="static-skeleton static-main-img"></div>
        </div>

        <div className="s1-main-info">
          <div className="static-skeleton static-title"></div>
          <div className="static-skeleton static-price"></div>

          {/* ================= BUY TO LIST ================= */}
          <div
            className="s1-btl-preview"
            style={{
              background: settings.btl_bg_clr || "#fff",
            }}
          >
            <div
              className="s1-btl-title"
              style={{
                color: settings.btl_title_clr || "#111",
              }}
            >
              {settings.list_title || "Featured List"}
            </div>

            <ul className="s1-btl-list">
              {(settings.buy_list || []).map((item) => (
                <li
                  key={item.id}
                  className="s1-btl-item"
                  style={{
                    borderColor: settings.btl_border_clr || "#fff9",
                    borderRadius: settings.btl_border_radius || "16px",
                  }}
                >
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

export default Style5;
