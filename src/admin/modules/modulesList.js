import { __ } from "@wordpress/i18n";

export const modulesList = [
  {
    id: "frequently-bought",
    label: __("Frequently Bought Together", "th-store-one"),
    description: __(
      "Displays related products often purchased together, allowing customers to add multiple complementary items to their cart with one click.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M14 14.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          fill="currentColor"
          fill-opacity="0.2"
          stroke="currentColor"
          stroke-width="1.5"
        ></path>
        <circle
          cx="18"
          cy="18"
          r="4"
          fill="white"
          stroke="currentColor"
          stroke-width="2"
        ></circle>
        <path
          d="M18 16v4M16 18h4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        ></path>
      </svg>
    ),
    premium: true,
  },
  {
    id: "bundle-product",
    label: __("Bundle Product", "th-store-one"),
    description: __(
      "Create customizable product bundles that combine multiple items into one offer, increasing average order value and improving the shopping experience.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 7.5L12 3L3 7.5V16.5L12 21L21 16.5V7.5Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M12 21V12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M12 12L21 7.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M12 12L3 7.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M7.5 5.25L16.5 9.75"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    ),
    premium: true,
  },
  {
    id: "buy-to-list",
    label: __("Featured List", "th-store-one"),
    description: __(
      "Showcase selected products in a dedicated list to highlight promotions, bestsellers, or priority items and drive more customer attention and sales.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    ),
    premium: false,
  },
  {
    id: "quick-social",
    label: __("Quick Social Link", "th-store-one"),
    description: __(
      "Adds social media profile links to your store and lets customers share products instantly, increasing brand visibility and engagement across platforms.",
      "th-store-one",
    ),
    icon: (
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 2H6C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2091 22 18V6C22 3.79086 20.2091 2 18 2Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M17.5 6.5H17.51"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    ),
    premium: false,
  },
  {
    id: "product-brand",
    label: __("Trust Badges", "th-store-one"),
    description: __(
      "Display trust badges on your store to build customer confidence and increase conversions.",
      "th-store-one",
    ),
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path
          d="M21 16L16 11L5 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    premium: false,
  },
  {
    id: "trust-badges",
    label: __("Badge Management", "th-store-one"),
    description: __(
      "Easily create, customize, and manage badges across your store with full control.",
      "th-store-one",
    ),
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3L20 6V11C20 16 16.5 20.5 12 22C7.5 20.5 4 16 4 11V6L12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 12L11 14L15 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    premium: false,
  },
  {
    id: "product-video",
    label: __("Product Video Gallery", "th-store-one"),
    description: __(
      "Display product videos in the gallery using YouTube, Vimeo, or custom video URLs, along with featured video support.",
      "th-store-one",
    ),
    icon: (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Screen */}
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />

    {/* Play Button */}
    <path
      d="M10 9L15 12L10 15V9Z"
      fill="currentColor"
    />
  </svg>
),
    premium: false,
  },
  {
    id: "sale-notification",
    label: __("Sale Notification", "th-store-one"),
    description: __(
      "Notify customers about limited-time sales and special offers.",
      "th-store-one",
    ),
    icon: (
  <svg
  className="w-6 h-6"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {/* Bell */}
  <path
    d="M12 3C9.79 3 8 4.79 8 7V10C8 11.1 7.1 12 6 12V14H18V12C16.9 12 16 11.1 16 10V7C16 4.79 14.21 3 12 3Z"
    stroke="currentColor"
    strokeWidth="2"
  />
  
  {/* Bell bottom */}
  <path
    d="M10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17"
    stroke="currentColor"
    strokeWidth="2"
  />

  {/* Sale dot */}
  <circle cx="18" cy="6" r="2" fill="currentColor" />
</svg>
),
    premium: false,
  },
  {
  id: "sticky-cart",
  label: __("Sticky Cart Bar", "th-store-one"),
  description: __(
    "Adds a floating sticky cart bar to improve conversions by keeping the add-to-cart option always visible while scrolling.",
    "th-store-one"
  ),
  icon: (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cart */}
      <path
        d="M3 3H5L6.5 14H18L20 6H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Wheels */}
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />

      {/* Sticky indicator (top bar) */}
      <rect
        x="6"
        y="2"
        width="12"
        height="2"
        rx="1"
        fill="currentColor"
      />
    </svg>
  ),
  premium: false,
},
{
  id: "buynow-button",
  label: __("Buy Now Button", "th-store-one"),
  description: __(
    "Adds a direct Buy Now button that skips the cart and takes customers straight to checkout, helping increase quick conversions.",
    "th-store-one"
  ),
  icon: (
    <svg
  className="w-6 h-6"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {/* Button Background */}
  <rect
    x="2"
    y="5"
    width="20"
    height="14"
    rx="4"
    stroke="currentColor"
    strokeWidth="2"
  />

  {/* Cart */}
  <path
    d="M7 9H8.5L9.5 14H15L16.5 10H9"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

  {/* Wheels */}
  <circle cx="10.5" cy="16.5" r="1" fill="currentColor" />
  <circle cx="14.5" cy="16.5" r="1" fill="currentColor" />
</svg>
  ),
  premium: false,
},
{
  id: "inactive-tab",
  label: __("Inactive Tab Message", "th-store-one"),
  description: __(
    "Modify the browser tab title when visitors switch away from your store to grab attention and encourage them to return.",
    "th-store-one"
  ),
  icon: (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Browser tab */}
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Tab header */}
      <path
        d="M3 8H21"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Alert / attention indicator */}
      <circle
        cx="17"
        cy="6.5"
        r="1"
        fill="currentColor"
      />

      {/* Text lines */}
      <path
        d="M7 12H13M7 15H11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  premium: false,
},
{
  id: "stock-scarcity",
  label: __("Stock Scarcity", "th-store-one"),
  description: __(
    "Show low stock alerts and progress bars to create urgency and increase conversions.",
    "th-store-one"
  ),
  icon: (
    <svg
  className="w-6 h-6"
  viewBox="0 0 24 24"
  fill="none"
>
  {/* Container */}
  <rect
    x="3"
    y="5"
    width="18"
    height="12"
    rx="3"
    stroke="currentColor"
    strokeWidth="2"
  />

  {/* Progress bg */}
  <rect
    x="5"
    y="14"
    width="14"
    height="2.5"
    rx="1.2"
    fill="currentColor"
    opacity="0.2"
  />

  {/* Progress low */}
  <rect
    x="5"
    y="14"
    width="5"
    height="2.5"
    rx="1.2"
    fill="currentColor"
  />

  <path
    d="M12 7C13 9 10 9.5 11 11C11.5 11.7 12.5 11.5 13 10.5C13.5 9.5 13 8.5 12 7Z"
    fill="currentColor"
  />
</svg>
  ),
  premium: false,
},
{
  id: "sale-countdown",
  label: __("Sale Countdown", "th-store-one"),
  description: __(
    "Display a countdown timer for limited-time offers along with stock urgency like sold and discount quantity to boost conversions.",
    "th-store-one"
  ),
  icon: (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clock */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Clock hands */}
      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sale dot */}
      <circle cx="18" cy="6" r="2" fill="currentColor" />
    </svg>
  ),
  premium: false,
},
];