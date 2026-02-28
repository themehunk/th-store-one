export const PLATFORM_CONFIG = {
  FACEBOOK: {
    label: "Facebook",
    share: "https://www.facebook.com/sharer/sharer.php?u={PAGE_URL}",
    profile: "https://facebook.com/username",
  },
  INSTAGRAM: {
    label: "Instagram",
    share: null, // Instagram web share supported nahi karta
    profile: "https://instagram.com/{username}",
  },
  TWITTER: {
    label: "X",
    share: "https://twitter.com/intent/tweet?url={PAGE_URL}&text={TITLE}",
    profile: "https://x.com/{username}",
  },
  LINKEDIN: {
    label: "LinkedIn",
    share: "https://www.linkedin.com/sharing/share-offsite/?url={PAGE_URL}",
    profile: "https://linkedin.com/in/{username}",
  },
  YOUTUBE: {
    label: "YouTube",
    share: null, // YouTube direct share endpoint nahi deta
    profile: "https://youtube.com/@{username}",
  },
  PINTEREST: {
    label: "Pinterest",
    share:
      "https://pinterest.com/pin/create/button/?url={PAGE_URL}&description={TITLE}",
    profile: "https://pinterest.com/{username}",
  },
  TIKTOK: {
    label: "TikTok",
    share: null,
    profile: "https://www.tiktok.com/@{username}",
  },
  SNAPCHAT: {
    label: "Snapchat",
    share: null,
    profile: "https://www.snapchat.com/add/{username}",
  },
  /* ================= MESSAGING ================= */
  whatsapp: {
    group: "messaging",
    share: "https://wa.me/?text={PAGE_URL}",
    profile:
      "https://api.whatsapp.com/send?phone={MOBILE_NUMBER}&text={YOUR_MESSAGE}",
  },
  telegram: {
    group: "messaging",
    share: "https://t.me/share/url?url={PAGE_URL}",
    profile: "https://t.me/{username}",
  },
  messenger: {
    group: "messaging",
    share: null,
    profile: "https://m.me/{username}",
  },
  viber: {
    group: "messaging",
    share: "viber://forward?text={PAGE_URL}",
    profile: "viber://chat?number={MOBILE_NUMBER}&text={YOUR_MESSAGE}",
  },

  wechat: {
    group: "messaging",
    share: null,
    profile: "weixin://dl/chat?{username}",
  },

  line: {
    group: "messaging",
    share: "https://social-plugins.line.me/lineit/share?url={PAGE_URL}",
    profile: "https://line.me/R/ti/p/{username}",
  },
  skype: {
    group: "messaging",
    share: null,
    profile: "skype:{username}?chat",
  },

  discord: {
    group: "messaging",
    share: null,
    profile: "https://discord.gg/{username}",
  },
  /* ================= CONTACT ================= */
  email: {
    group: "contact",
    share: null,
    profile: "mailto:{email@example.com}",
  },
  phone: {
    group: "contact",
    share: null,
    profile: "tel:{+911234567890}",
  },
  sms: {
    group: "contact",
    share: null,
    profile: "sms:{+911234567890}",
  },
  gmail: {
    group: "contact",
    share: null,
    profile:
      "https://mail.google.com/mail/?view=cm&fs=1&to={EMAIL}&su={SUBJECT}&body={BODY}",
  },
  outlook: {
    group: "contact",
    share: null,
    profile:
      "https://outlook.live.com/mail/0/deeplink/compose?to={EMAIL}&subject={SUBJECT}&body={BODY}",
  },

  /* ================= PROFESSIONAL ================= */

  github: {
    group: "professional",
    share: null,
    profile: "https://github.com/{username}",
  },

  gitlab: {
    group: "professional",
    share: null,
    profile: "https://gitlab.com/{username}",
  },

  stackoverflow: {
    group: "professional",
    share: null,
    profile: "https://stackoverflow.com/users/{user_id}",
  },

  behance: {
    group: "professional",
    share: null,
    profile: "https://behance.net/{username}",
  },

  dribbble: {
    group: "professional",
    share: null,
    profile: "https://dribbble.com/{username}",
  },

  /* ================= BUSINESS ================= */

google_business: {
  group: "business",
  share: null,
  profile: "https://www.google.com/maps/place/{business_name}",
},

google_maps: {
  group: "business",
  share: null,
  profile: "https://maps.google.com/?q={business_name}",
},

yelp: {
  group: "business",
  share: null,
  profile: "https://www.yelp.com/biz/{business_slug}",
},

trustpilot: {
  group: "business",
  share: null,
  profile: "https://www.trustpilot.com/review/{domain}",
},

tripadvisor: {
  group: "business",
  share: null,
  profile: "https://www.tripadvisor.com/{business_path}",
},

  /* ================= OTHER ================= */


website: {
  group: "other",
  share: null,
  profile: "{CUSTOM_URL}", // user jo dale wahi direct link
},

share: {
  group: "other",
  share: "{CUSTOM_URL}", // universal share link
  profile: null,
},

rss: {
  group: "other",
  share: null,
  profile: "{CUSTOM_URL}", // example.com/feed
},

};
