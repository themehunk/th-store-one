import { __ } from "@wordpress/i18n";
import { MODULE_ICONS } from "@th-storeone-global/icons";

export const modulesList = [
  {
    id: "buy-to-list",
    label: __("Featured List", "th-store-one"),
    description: __(
      "Showcase selected products in a dedicated list to highlight promotions, bestsellers, or priority items and drive more customer attention and sales.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.BTL,
    premium: false,
  },
  {
    id: "quick-social",
    label: __("Quick Social Link", "th-store-one"),
    description: __(
      "Adds social media profile links to your store and lets customers share products instantly, increasing brand visibility and engagement across platforms.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.QS,
    premium: false,
  },
  {
    id: "product-brand",
    label: __("Trust Badges", "th-store-one"),
    description: __(
      "Display trust badges on your store to build customer confidence and increase conversions.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PBR,
    premium: false,
  },

  {
    id: "product-video",
    label: __("Product Video Gallery", "th-store-one"),
    description: __(
      "Display product videos in the gallery using YouTube, Vimeo, or custom video URLs, along with featured video support.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PDV,
    premium: false,
  },
  {
    id: "sale-notification",
    label: __("Sale Notification", "th-store-one"),
    description: __(
      "Notify customers about limited-time sales and special offers.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SN,
    premium: false,
  },
  {
    id: "sticky-cart",
    label: __("Sticky Cart Bar", "th-store-one"),
    description: __(
      "Adds a floating sticky cart bar to improve conversions by keeping the add-to-cart option always visible while scrolling.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SCT,
    premium: false,
  },
  {
    id: "buynow-button",
    label: __("Buy Now Button", "th-store-one"),
    description: __(
      "Adds a direct Buy Now button that skips the cart and takes customers straight to checkout, helping increase quick conversions.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.BNBTN,
    premium: false,
  },
  {
    id: "sale-countdown",
    label: __("Sale Countdown", "th-store-one"),
    description: __(
      "Display a countdown timer for limited-time offers along with stock urgency like sold and discount quantity to boost conversions.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SLCNT,
    premium: false,
  },
  {
    id: "recent-view",
    label: __("Recently Viewed", "th-store-one"),
    description: __(
      "Display products that users have recently viewed to improve engagement and increase chances of conversion.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.RV,
    premium: false,
  },

  {
    id: "pre-order",
    label: __("Pre Order", "th-store-one"),
    description: __(
      "Allow customers to pre-order upcoming or out-of-stock products with custom availability dates, preorder messages, and advanced rule controls.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PORDR,
    premium: false,
  },
  {
    id: "frequently-bought",
    label: __("Frequently Bought Together", "th-store-one"),
    description: __(
      "Displays related products often purchased together, allowing customers to add multiple complementary items to their cart with one click.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.FBT,
    premium: true,
  },
  {
    id: "bundle-product",
    label: __("Bundle Product", "th-store-one"),
    description: __(
      "Create customizable product bundles that combine multiple items into one offer, increasing average order value and improving the shopping experience.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.BUNDLE,
    premium: true,
  },
  {
    id: "smart-offers",
    label: __("Smart Offers", "th-store-one"),
    description: __(
      "Create powerful Buy X Get Y deals, discounts, and automated offers to boost conversions and increase average order value.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SMRTOFR,
    premium: true,
  },
  {
    id: "people-view",
    label: __("Visitor Count", "th-store-one"),
    description: __(
      "Show real-time or simulated product viewers to create urgency, increase trust, and boost conversions.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PV,
    premium: true,
  },
  {
    id: "trust-badges",
    label: __("Badge Management", "th-store-one"),
    description: __(
      "Easily create, customize, and manage badges across your store with full control.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.TBD,
    premium: true,
  },
  {
    id: "inactive-tab",
    label: __("Inactive Tab Message", "th-store-one"),
    description: __(
      "Modify the browser tab title when visitors switch away from your store to grab attention and encourage them to return.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.INTB,
    premium: true,
  },
  {
    id: "stock-scarcity",
    label: __("Stock Scarcity", "th-store-one"),
    description: __(
      "Show low stock alerts and progress bars to create urgency and increase conversions.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.STKSC,
    premium: true,
  },
];
