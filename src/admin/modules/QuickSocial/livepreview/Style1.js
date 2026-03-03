// import React from "react";
// import { ICONS } from "@storeone-global/icons";

// /* ================= BRAND COLORS ================= */

// const BRAND_COLORS = {
//   FACEBOOK: "#1877F2",
//   INSTAGRAM: "#E4405F",
//   TWITTER: "#000000",
//   LINKEDIN: "#0A66C2",
//   YOUTUBE: "#FF0000",
//   PINTEREST: "#E60023",
//   TIKTOK: "#000000",
//   SNAPCHAT: "#FFFC00",
//   TELEGRAM: "#0088CC",
//   WHATSAPP: "#25D366",
//   MESSENGER: "#0084FF",
//   VIBER: "#7360F2",
//   WECHAT: "#07C160",
//   LINE: "#00C300",
//   SKYPE: "#00AFF0",
//   DISCORD: "#5865F2",
//   EMAIL: "#EA4335",
//   GMAIL: "#EA4335",
//   OUTLOOK: "#0078D4",
//   PHONE: "#34B7F1",
//   SMS: "#4CAF50",
//   GITHUB: "#181717",
//   BEHANCE: "#1769FF",
//   GITLAB: "#FC6D26",
//   STACKOVERFLOW: "#F48024",
//   DRIBBLE: "#EA4C89",
//   GOOGLE_MAPS: "#EA4335",
//   YELP: "#D32323",
//   GOOGLEBUSS: "#4285F4",
//   TRUSTPILOT: "#00B67A",
//   TRIPADVISER: "#34E0A1",
//   WEBSITE: "#2563EB",
//   RSS: "#FF6600",
//   CUSTOM: "#6B7280",
// };

// /* ================= COMPONENT ================= */

// const Style1 = ({ settings = {} }) => {
//   const rule = settings || {};
//   const list = rule?.social_list || [];

//   /* ================= STYLE VARIABLES ================= */

//   const styleVars = {
//     "--s1-icon-size": rule?.icon_size || "18px",
//     "--s1-border-radius": rule?.border_radius || "50%",
//      /*POSITION APPLY HERE */
//     "--s1-top": rule?.position_top || "50%",
//     "--s1-left": rule?.position_left || "10px",
//   };

//   if (!rule?.original_enabled) {
//     styleVars["--s1-icon-bg"] = rule?.icon_bg_clr || "#ffffff";
//     styleVars["--s1-icon-color"] = rule?.icon_clr || "#000000";
//     styleVars["--s1-icon-hover-bg"] =
//       rule?.icon_bg_hvr_clr || "#f3f4f6";
//     styleVars["--s1-icon-hover-color"] =
//       rule?.icon_hvr_clr || "#2563eb";
//   }

//   /* ================= GET ACTIVE TAB DATA ================= */

//   const getActiveData = (item) => {
//     const tab = item?.itemTab || "social";
//     return item?.[tab] || {};
//   };

//   /* ================= ICON RENDER ================= */

//   const renderIcon = (item, index) => {
//     const data = getActiveData(item);
//     const type = data?.icontype || "icon";
//     const iconKey = data?.selected_icon?.toUpperCase();

//     if (!iconKey) return null;

//     const brandColor = BRAND_COLORS[iconKey] || "#000";

//     /* -------- ORIGINAL MODE -------- */

//     let iconStyle = {};

//     if (rule?.original_enabled) {
//       if (iconKey === "INSTAGRAM") {
//         iconStyle = {
//           background:
//             "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)",
//           color: "#ffffff",
//         };
//       } else {
//         iconStyle = {
//           background: brandColor,
//           color: "#ffffff",
//         };
//       }
//     }

//     /* -------- CUSTOM SVG -------- */

//     if (type === "custom_svg" && data?.custom_svg) {
//       return (
//         <div key={index} className="s1-quick-social__item">
//           <div
//             className="s1-quick-social__icon"
//             style={iconStyle}
//             dangerouslySetInnerHTML={{ __html: data.custom_svg }}
//           />
//         </div>
//       );
//     }

//     /* -------- IMAGE -------- */

//     if (type === "image" && data?.image_url) {
//       return (
//         <div key={index} className="s1-quick-social__item">
//           <div
//             className="s1-quick-social__icon"
//             style={iconStyle}
//           >
//             <img src={data.image_url} alt="" />
//           </div>
//         </div>
//       );
//     }

//     /* -------- DEFAULT ICON -------- */

//     const IconElement = ICONS[iconKey];

//     if (!IconElement) return null;

//     return (
//       <div key={index} className="s1-quick-social__item">
//         <div
//           className="s1-quick-social__icon"
//           style={iconStyle}
//         >
//           {IconElement}
//         </div>
//       </div>
//     );
//   };

//   /* ================= RENDER ================= */

//   return (
//     <div
//       className="s1-product-preview social_link"
//       style={styleVars}
//     >
//       <div className="s1-main-product">

//         {/* QUICK SOCIAL */}
//         <div className="s1-quick-social s1-quick-social--style1">
//           <div className="s1-quick-social__inner">
//             {list.length > 0
//               ? list.map((item, index) =>
//                   renderIcon(item, index)
//                 )
//               : [1, 2, 3].map((i) => (
//                   <div
//                     key={i}
//                     className="s1-quick-social__item s1-quick-social__skeleton"
//                   >
//                     <div className="s1-quick-social__icon">
//                       <div className="s1-icon-placeholder" />
//                     </div>
//                   </div>
//                 ))}
//           </div>
//         </div>

//         {/* PRODUCT SKELETON */}
//         <div className="s1-main-thumb">
//           <div className="static-skeleton static-main-img"></div>
//         </div>

//         <div className="s1-main-info">
//           <div className="static-skeleton static-title"></div>
//           <div className="static-skeleton static-price"></div>

//           <div className="s1-btl-preview">
//             <div className="static-skeleton static-btl-title"></div>
//             <ul className="s1-btl-list">
//               <li className="static-skeleton static-btl-title"></li>
//               <li className="static-skeleton static-btl-title"></li>
//             </ul>
//           </div>

//           <div className="s1-main-cart">
//             <div className="static-skeleton static-qty"></div>
//             <div className="static-skeleton static-btn"></div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Style1;


import React, { useState } from "react";
import { ICONS } from "@storeone-global/icons";
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
  GMAIL: "#EA4335",
  OUTLOOK: "#0078D4",
  PHONE: "#34B7F1",
  SMS: "#4CAF50",
  GITHUB: "#181717",
  BEHANCE: "#1769FF",
  GITLAB: "#FC6D26",
  STACKOVERFLOW: "#F48024",
  DRIBBLE: "#EA4C89",
  GOOGLE_MAPS: "#EA4335",
  YELP: "#D32323",
  GOOGLEBUSS: "#4285F4",
  TRUSTPILOT: "#00B67A",
  TRIPADVISER: "#34E0A1",
  WEBSITE: "#2563EB",
  RSS: "#FF6600",
  CUSTOM: "#6B7280",
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
          {type === "icon" && ICONS[iconKey]}
        </div>
      </div>
    );
  };

  return (
    <div className="s1-product-preview social_link" style={styleVars}>
      <div className="s1-main-product">

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