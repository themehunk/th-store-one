export const PLATFORM_CONFIG = {
    FACEBOOK: {
    label: "Facebook",
    share: "https://www.facebook.com/sharer/sharer.php?u={PAGE_URL}",
    profile: "https://facebook.com/username",
  },
  INSTAGRAM: {
    label: "Instagram",
    share: null, // Instagram web share supported nahi karta
    profile: "https://instagram.com/username",
  },
  TWITTER: {
    label: "X",
    share: "https://twitter.com/intent/tweet?url={PAGE_URL}&text={TEXT}",
    profile: "https://x.com/username",
  },
  LINKEDIN: {
    label: "LinkedIn",
    share: "https://www.linkedin.com/sharing/share-offsite/?url={PAGE_URL}",
    profile: "https://linkedin.com/in/username",
  },
  YOUTUBE: {
    label: "YouTube",
    share: null, // YouTube direct share endpoint nahi deta
    profile: "https://youtube.com/@username",
  },
  PINTEREST: {
    label: "Pinterest",
    share: "https://pinterest.com/pin/create/button/?url={PAGE_URL}&description={TEXT}",
    profile: "https://pinterest.com/username",
  },
  TIKTOK: {
    label: "TikTok",
    share: null,
    profile: "https://www.tiktok.com/@username",
  },
  SNAPCHAT: {
    label: "Snapchat",
    share: null,
    profile: "https://www.snapchat.com/add/username",
  },
  /* ================= MESSAGING ================= */
  whatsapp: {
    group: "messaging",
    share: "https://wa.me/?text=POST_URL",
    profile: "https://wa.me/phone",
  },
  telegram: {
    group: "messaging",
    share: "https://t.me/share/url?url=POST_URL",
    profile: "https://t.me/username",
  },
  messenger: {
    group: "messaging",
    share: null,
    profile: "https://m.me/username",
  },
  /* ================= CONTACT ================= */
  email: {
    group: "contact",
    share: null,
    profile: "mailto:email@example.com",
  },
  phone: {
    group: "contact",
    share: null,
    profile: "tel:+911234567890",
  },
  sms: {
    group: "contact",
    share: null,
    profile: "sms:+911234567890",
  },
  /* ================= PROFESSIONAL ================= */
  github: {
    group: "professional",
    share: null,
    profile: "https://github.com/username",
  },
  behance: {
    group: "professional",
    share: null,
    profile: "https://behance.net/username",
  },

  /* ================= BUSINESS ================= */
  google_maps: {
    group: "business",
    share: null,
    profile: "https://maps.google.com/?q=business",
  },
  yelp: {
    group: "business",
    share: null,
    profile: "https://yelp.com/biz/business",
  },

  /* ================= OTHER ================= */
  website: {
    group: "other",
    share: null,
    profile: "https://example.com",
  },
  rss: {
    group: "other",
    share: null,
    profile: "https://example.com/feed",
  },
};
