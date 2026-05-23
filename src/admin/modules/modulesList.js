import { __ } from "@wordpress/i18n";
import { MODULE_ICONS } from "@th-storeone-global/icons";

export const modulesList = [
  {
    id: "sale-notification",
    label: __("Sale Notification", "th-store-one"),
    description: __(
      "Show real time purchase notifications and sales popups to create social proof, increase urgency, and encourage visitors to complete purchases faster.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SN,
    premium: false,
  },
  {
    id: "product-video",
    label: __("Product Video Gallery", "th-store-one"),
    description: __(
      "Display product videos from YouTube, Vimeo, or custom media sources directly inside the product gallery for better engagement and detailed product presentation.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PDV,
    premium: false,
  },
  {
    id: "product-brand",
    label: __("Trust Badges", "th-store-one"),
    description: __(
      "Show secure payment, brand logos, delivery, and guarantee badges on product and checkout pages to build customer confidence and improve purchase conversions.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PBR,
    premium: false,
  },
  {
    id: "sale-countdown",
    label: __("Sale Countdown", "th-store-one"),
    description: __(
      "Display countdown timers for sales, discounts, and limited offers to create urgency and encourage customers to purchase before deals expire.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SLCNT,
    premium: false,
  },
  {
    id: "buy-to-list",
    label: __("Featured List", "th-store-one"),
    description: __(
      "Display customizable feature highlights, bullet points, and product information lists to showcase key benefits, specifications, services, or important details directly on product pages",
      "th-store-one",
    ),
    icon: MODULE_ICONS.BTL,
    premium: false,
  },
  {
    id: "quick-social",
    label: __("Quick Social Link", "th-store-one"),
    description: __(
      "Add social sharing buttons to product pages so customers can instantly share products across platforms, improving visibility, engagement, and potential sales.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.QS,
    premium: false,
  },
  {
    id: "sticky-cart",
    label: __("Sticky Cart Bar", "th-store-one"),
    description: __(
      "Keep an always visible sticky add to cart bar while scrolling so customers can quickly purchase products without returning to the top.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SCT,
    premium: false,
  },
  {
    id: "buynow-button",
    label: __("Buy Now Button", "th-store-one"),
    description: __(
      "Add a direct Buy Now button that skips the cart page and sends customers straight to checkout for faster and smoother purchasing.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.BNBTN,
    premium: false,
  },
  {
    id: "recent-view",
    label: __("Recently Viewed", "th-store-one"),
    description: __(
      "Show products as recently viewed by customers to improve product discovery, increase engagement, and encourage returning visitors to complete purchases.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.RV,
    premium: false,
  },
  {
    id: "inactive-tab",
    label: __("Inactive Tab Message", "th-store-one"),
    description: __(
      "Change the browser tab title when visitors switch tabs to grab attention and encourage customers to return to your store.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.INTB,
    premium: false,
  },
  {
    id: "th-advanced-search",
    label: __("Advanced Search", "th-store-one"),
    description: __(
      "Enhance WooCommerce product search with AJAX live search, smart filters, and advanced search options.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.ADVSEARCH,
    premium: false,

    source: {
      type: "th-extension",
      plugin: "th-advance-product-search",
    },
  },

  {
    id: "pre-order",
    label: __("Pre Order", "th-store-one"),
    description: __(
      "Allow customers to pre order upcoming or out of stock products with custom availability dates, preorder messages, and advanced options",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PORDR,
    premium: true,
  },
  {
    id: "frequently-bought",
    label: __("Frequently Bought Together", "th-store-one"),
    description: __(
      "Display related products commonly purchased together and allow customers to add complementary items to their cart with a single click.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.FBT,
    premium: true,
  },
  {
    id: "bundle-product",
    label: __("Bundle Product", "th-store-one"),
    description: __(
      "Create customizable product bundles that combine multiple products into one offer to increase average order value and improve shopping experience.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.BUNDLE,
    premium: true,
  },
  {
    id: "smart-offers",
    label: __("Smart Offers", "th-store-one"),
    description: __(
      "Create automated Buy X Get Y offers or BOGO offers, discounts, upsells, and special promotions to boost conversions and increase average order value.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.SMRTOFR,
    premium: true,
  },
  {
    id: "people-view",
    label: __("Visitor Count", "th-store-one"),
    description: __(
      "Display live or simulated visitor counts on product pages, and across store to create urgency, build trust, and encourage faster purchasing decisions.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.PV,
    premium: true,
  },
  {
    id: "trust-badges",
    label: __("Badge Management", "th-store-one"),
    description: __(
      "Create and manage custom product badges such as Sale, New, Trending, or Limited Stock to highlight important products across your store.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.TBD,
    premium: true,
  },

  {
    id: "stock-scarcity",
    label: __("Stock Scarcity", "th-store-one"),
    description: __(
      "Show low stock alerts, inventory progress bars, and scarcity messages to create urgency and motivate customers to complete purchases quickly.",
      "th-store-one",
    ),
    icon: MODULE_ICONS.STKSC,
    premium: true,
  },
];
