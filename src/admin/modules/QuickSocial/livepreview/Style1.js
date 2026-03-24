import React, { useState } from "react";
import { ICONS , getIcon} from "@th-storeone-global/icons";
import { PLATFORM_CONFIG } from "../platformConfig";

/* ================= BRAND COLORS ================= */

const BRAND_COLORS = {
  FACEBOOK: "#1877F2",
  INSTAGRAM: "#E4405F",
  TWITTER: "#000000",
  LINKEDIN: "#0A66C2",
  YOUTUBE: "#FF0000",
  PINTEREST: "#E60023",
  TIKTOK: "#000000",
  SNAPCHAT: "#FFFC00",
  TELEGRAM: "#0088CC",
  WHATSAPP: "#25D366",
  MESSENGER: "#0084FF",
  VIBER: "#7360F2",
  WECHAT: "#07C160",
  LINE: "#00C300",
  SKYPE: "#00AFF0",
  DISCORD: "#5865F2",
  EMAIL: "#EA4335",
  GMAIL: "#fff",
  OUTLOOK: "#fff",
  PHONE: "#34B7F1",
  SMS: "#4CAF50",
  GITHUB: "#181717",
  BEHANCE: "#1769FF",
  GITLAB: "#FC6D26",
  STACKOVERFLOW: "#F48024",
  DRIBBLE: "#EA4C89",
  GOOGLE_MAPS: "#fff",
  YELP: "#D32323",
  GOOGLEBUSS: "#4285F4",
  TRUSTPILOT: "#fff",
  TRIPADVISER: "#34E0A1",
  WEBSITE: "#2563EB",
  RSS: "#FF6600",
  CUSTOM: "#6B7280",
};

const ORIGINAL_ICONS = {
  GOOGLE_MAPS: (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px"><path fill="#48b564" d="M35.76,26.36h0.01c0,0-3.77,5.53-6.94,9.64c-2.74,3.55-3.54,6.59-3.77,8.06    C24.97,44.6,24.53,45,24,45s-0.97-0.4-1.06-0.94c-0.23-1.47-1.03-4.51-3.77-8.06c-0.42-0.55-0.85-1.12-1.28-1.7L28.24,22l8.33-9.88  C37.49,14.05,38,16.21,38,18.5C38,21.4,37.17,24.09,35.76,26.36z"/><path fill="#fcc60e" d="M28.24,22L17.89,34.3c-2.82-3.78-5.66-7.94-5.66-7.94h0.01c-0.3-0.48-0.57-0.97-0.8-1.48L19.76,15   c-0.79,0.95-1.26,2.17-1.26,3.5c0,3.04,2.46,5.5,5.5,5.5C25.71,24,27.24,23.22,28.24,22z"/><path fill="#2c85eb" d="M28.4,4.74l-8.57,10.18L13.27,9.2C15.83,6.02,19.69,4,24,4C25.54,4,27.02,4.26,28.4,4.74z"/><path fill="#ed5748" d="M19.83,14.92L19.76,15l-8.32,9.88C10.52,22.95,10,20.79,10,18.5c0-3.54,1.23-6.79,3.27-9.3    L19.83,14.92z"/><path fill="#5695f6" d="M28.24,22c0.79-0.95,1.26-2.17,1.26-3.5c0-3.04-2.46-5.5-5.5-5.5c-1.71,0-3.24,0.78-4.24,2L28.4,4.74 c3.59,1.22,6.53,3.91,8.17,7.38L28.24,22z"/></svg>
  ),
  TRUSTPILOT: (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px" baseProfile="basic"><path fill="#00b67a" d="M45.023,18.995H28.991L24.039,3.737l-4.968,15.259L3.039,18.98l12.984,9.44l-4.968,15.243 l12.984-9.424l12.968,9.424L32.055,28.42L45.023,18.995z"/><path fill="#005128" d="M33.169,31.871l-1.114-3.451l-8.016,5.819L33.169,31.871z"/></svg>
  ),
  SMS: (
    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M334.5-534.5Q346-546 346-563t-11.5-28.5Q323-603 306-603t-28.5 11.5Q266-580 266-563t11.5 28.5Q289-523 306-523t28.5-11.5Zm177 0Q523-546 523-563t-11.5-28.5Q500-603 483-603t-28.5 11.5Q443-580 443-563t11.5 28.5Q466-523 483-523t28.5-11.5Zm170 0Q693-546 693-563t-11.5-28.5Q670-603 653-603t-28.5 11.5Q613-580 613-563t11.5 28.5Q636-523 653-523t28.5-11.5ZM80-80v-740q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240L80-80Zm134-220h606v-520H140v600l74-80Zm-74 0v-520 520Z"/></svg>
  ),
   GMAIL: (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px"><path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/><path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/><polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/><path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"/><path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"/></svg>
  ),
  OUTLOOK:(
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="96px" height="96px" baseProfile="basic"><path fill="#40c4ff" d="M31.323,8.502L7.075,23.872l-2.085-3.29v-2.835c0-1.032,0.523-1.994,1.389-2.556l14.095-9.146    c2.147-1.393,4.914-1.394,7.061-0.001L31.323,8.502z"/><path fill="#1976d2" d="M27.317,5.911c0.073,0.043,0.145,0.088,0.217,0.135l11,7.136L11.259,30.47l-4.185-6.603 l20.017-12.713C28.988,9.95,29.071,7.241,27.317,5.911z"/><path fill="#0d47a1" d="M22.142,33.771L11.26,30.47l23.136-14.666c1.949-1.235,1.944-4.08-0.009-5.308l-0.104-0.065  l0.3,0.186l7.041,4.568c0.866,0.562,1.389,1.524,1.389,2.556v2.744L22.142,33.771z"/><path fill="#29b6f6" d="M20.886,43h15.523c3.646,0,6.602-2.956,6.602-6.602V17.797c0,1.077-0.554,2.079-1.466,2.652    l-23.09,14.498c-1.246,0.782-2.001,2.15-2.001,3.62C16.454,41.016,18.438,43,20.886,43z"/><radialGradient id="jOGZKH9xgyi24L29LbTdga" cx="-509.142" cy="-26.522" r=".07" gradientTransform="matrix(-170.8609 259.7254 674.0181 443.4041 -69097.734 144024.688)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#49deff"/><stop offset=".724" stop-color="#29c3ff"/></radialGradient><path fill="url(#jOGZKH9xgyi24L29LbTdga)" d="M27.198,42.999H11.589c-3.646,0-6.602-2.956-6.602-6.602V17.783  c0,1.076,0.552,2.076,1.461,2.649l23.067,14.543c1.263,0.796,2.029,2.185,2.029,3.678C31.544,41.053,29.598,42.999,27.198,42.999z"/><path fill="#80d8ff" d="M27.198,42.999H11.589c-3.646,0-6.602-2.956-6.602-6.602V17.783c0,1.076,0.552,2.076,1.461,2.649 l23.067,14.543c1.263,0.796,2.029,2.185,2.029,3.678C31.544,41.053,29.598,42.999,27.198,42.999z"/><path fill="#fff" d="M11.282,36.236c-1.398,0-2.545-0.437-3.442-1.312c-0.897-0.874-1.346-2.015-1.346-3.423 c0-1.486,0.455-2.689,1.366-3.607c0.911-0.918,2.103-1.377,3.577-1.377c1.393,0,2.526,0.439,3.401,1.318    c0.879,0.879,1.319,2.037,1.319,3.475c0,1.478-0.456,2.669-1.366,3.574C13.885,35.786,12.716,36.236,11.282,36.236z M11.323,34.381  c0.762,0,1.375-0.26,1.839-0.78c0.464-0.52,0.696-1.244,0.696-2.171c0-0.966-0.226-1.718-0.676-2.256   c-0.451-0.538-1.053-0.806-1.805-0.806c-0.775,0-1.4,0.278-1.873,0.833c-0.473,0.551-0.71,1.281-0.71,2.19  c0,0.923,0.237,1.653,0.71,2.19C9.977,34.114,10.583,34.381,11.323,34.381z"/><path fill="#1565c0" d="M6.453,23h10.094C18.454,23,20,24.546,20,26.453v10.094C20,38.454,18.454,40,16.547,40H6.453  C4.546,40,3,38.454,3,36.547V26.453C3,24.546,4.546,23,6.453,23z"/><path fill="#fff" d="M11.453,36.518c-1.4,0-2.55-0.452-3.449-1.355c-0.899-0.903-1.348-2.082-1.348-3.537   c0-1.536,0.456-2.778,1.369-3.726c0.913-0.949,2.107-1.423,3.584-1.423c1.396,0,2.532,0.454,3.408,1.362    c0.881,0.908,1.321,2.105,1.321,3.591c0,1.527-0.456,2.758-1.369,3.692C14.061,36.053,12.889,36.518,11.453,36.518z M11.493,34.601  c0.763,0,1.378-0.269,1.843-0.806c0.465-0.538,0.698-1.285,0.698-2.243c0-0.998-0.226-1.775-0.677-2.331    c-0.452-0.556-1.055-0.833-1.809-0.833c-0.777,0-1.403,0.287-1.877,0.861c-0.474,0.569-0.711,1.323-0.711,2.263 c0,0.953,0.237,1.707,0.711,2.263C10.145,34.326,10.752,34.601,11.493,34.601z"/></svg>
  ),
  EMAIL: (
    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm340-302L140-685v465h680v-465L480-462Zm0-60 336-218H145l335 218ZM140-685v-55 520-465Z"/></svg>
  ),
  
};

const Style1 = ({ settings = {} }) => {
  const rule = settings || {};
  const list = rule?.social_list || [];
  const [showPopup, setShowPopup] = useState(false);

  /* ================= MAX SHOW ================= */

  const maxShow = parseInt(rule?.max_show || 4);
  const visibleItems = list.slice(0, maxShow);
  const hasMore = list.length > maxShow;

  /* ================= STYLE VARIABLES ================= */

  const styleVars = {
    "--s1-icon-size": rule?.icon_size || "18px",
    "--s1-border-radius": rule?.border_radius || "50%",
    "--s1-top": rule?.position_top || "50%",
    "--s1-left": rule?.position_left || "10px",
  };

  if (!rule?.original_enabled) {
    styleVars["--s1-icon-bg"] = rule?.icon_bg_clr || "#ffffff";
    styleVars["--s1-icon-color"] = rule?.icon_clr || "#000000";
    styleVars["--s1-icon-hover-bg"] = rule?.icon_bg_hvr_clr || "#f3f4f6";
    styleVars["--s1-icon-hover-color"] = rule?.icon_hvr_clr || "#2563eb";
  }

  const getActiveData = (item) => {
    const tab = item?.itemTab || "social";
    return item?.[tab] || {};
  };

  const getTooltipLabel = (item) => {
    const data = getActiveData(item);
    const iconKey = data?.selected_icon?.toUpperCase();
    if (!iconKey) return "";

    return (
      data?.custom_label ||
      PLATFORM_CONFIG?.[iconKey]?.label ||
      iconKey
    );
  };

  const renderIcon = (item, index) => {
    const data = getActiveData(item);
    const type = data?.icontype || "icon";
    const iconKey = data?.selected_icon?.toUpperCase();
    if (!iconKey) return null;

    const brandColor = BRAND_COLORS[iconKey] || "#000";
    const tooltip = getTooltipLabel(item);

    let iconStyle = {};

    if (rule?.original_enabled) {
      iconStyle =
        iconKey === "INSTAGRAM"
          ? {
              background:
                "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)",
              color: "#fff",
            }
          : { background: brandColor, color: "#fff" };
    }

    return (
      <div
        key={index}
        className="s1-quick-social__item"
        data-tooltip={tooltip}
      >
        <div className="s1-quick-social__icon" style={iconStyle}>
          {type === "custom_svg" && data?.custom_svg && (
            <span dangerouslySetInnerHTML={{ __html: data.custom_svg }} />
          )}
          {type === "image" && data?.image_url && (
            <img src={data.image_url} alt={tooltip} />
          )}
          {type === "icon" &&
  (rule?.original_enabled
    ? ORIGINAL_ICONS[iconKey] || ICONS[iconKey]
    : ICONS[iconKey])}
        </div>
      </div>
    );
  };

  return (
    <div className="s1-product-preview social_link" style={styleVars}>
      <div className="s1-main-product">
{rule.trigger_type !== "all_single" && rule.onpage_enabled === false && (
       <>
        <div className="s1-quick-social s1-quick-social--style1">
          <div className="s1-quick-social__inner">

            {list.length > 0
              ? visibleItems.map((item, index) =>
                  renderIcon(item, index)
                )
              : [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="s1-quick-social__item s1-quick-social__skeleton"
                  >
                    <div className="s1-quick-social__icon">
                      <div className="s1-icon-placeholder" />
                    </div>
                  </div>
                ))}

            {hasMore && (
              <div
                className="s1-quick-social__item"
                onClick={() => setShowPopup(true)}
              >
                <div className="s1-quick-social__icon s1-more-icon">
                 <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
  {/* {list.length - maxShow} */}
                </div>
              </div>
            )}

          </div>
        </div>
       </>
)}

        {showPopup && (
          <div
            className="s1-popup-overlay"
            onClick={() => setShowPopup(false)}
          >
            <div
              className="s1-popup-content"
              onClick={(e) => e.stopPropagation()}
            >
              
                <button
                  className="s1-popup-close"
                  onClick={() => setShowPopup(false)}
                >
                  ✕
                </button>
             

              <div className="s1-popup-icons">
                {list.map((item, index) =>
                  renderIcon(item, index)
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT SKELETON BELOW SAME */}
        <div className="s1-main-thumb">
          <div className="static-skeleton static-main-img"></div>
        </div>

        <div className="s1-main-info">
          <div className="static-skeleton static-title"></div>
       <div className="static-skeleton static-price"></div>

          <div className="s1-btl-preview">
            <div className="static-skeleton static-btl-title"></div>
            <ul className="s1-btl-list">
               <li className="static-skeleton static-btl-title"></li>
               <li className="static-skeleton static-btl-title"></li>
           </ul>
         </div>
          <div className="s1-quick-social__inner">
{rule.trigger_type === "all_single" && rule.onpage_enabled === true && (
  <>
            {list.length > 0
              ? visibleItems.map((item, index) =>
                  renderIcon(item, index)
                )
              : [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="s1-quick-social__item s1-quick-social__skeleton"
                  >
                    <div className="s1-quick-social__icon">
                      <div className="s1-icon-placeholder" />
                    </div>
                  </div>
                ))}

            {hasMore && (
              <div
                className="s1-quick-social__item"
                onClick={() => setShowPopup(true)}
              >
                <div className="s1-quick-social__icon s1-more-icon">
                 <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
  {/* {list.length - maxShow} */}
                </div>
              </div>
            )}
            </>
          )}

          </div>
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