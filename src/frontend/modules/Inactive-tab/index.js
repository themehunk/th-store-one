const StoreOneInactiveTab = {
  originalTitle: "",
  originalFavicon: "",
  interval: null,
  timeout: null,

  init() {
    if (!window.thInactiveTabData) return;

    this.bindEvents();
  },

  bindEvents() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.handleTabHide();
      } else {
        this.handleTabShow();
      }
    });
  },

  /* ---------- GET CURRENT FAVICON ---------- */
  getCurrentFavicon() {
    const link = document.querySelector("link[rel*='icon']");
    // Agar link tag hai toh uska href lo, warna default '/favicon.ico' try karo
    return link ? link.href : window.location.origin + "/favicon.ico";
  },

  /* ---------- REMOVE ALL FAVICONS ---------- */
  removeFavicons() {
    const rels = ["icon", "shortcut icon", "apple-touch-icon", "mask-icon"];
    rels.forEach((rel) => {
      document
        .querySelectorAll(`link[rel='${rel}']`)
        .forEach((el) => el.remove());
    });
  },

  /* ---------- CHANGE FAVICON ---------- */
  changeFavicon(data) {
    if (!data) return;
    this.removeFavicons();

    const link = document.createElement("link");
    link.rel = "icon";
    const isSvg = data.trim().toLowerCase().startsWith("<svg");

    if (isSvg) {
      if (!data.includes('xmlns="http://www.w3.org/2000/svg"')) {
        data = data.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const base64SVG = btoa(unescape(encodeURIComponent(data)));
      link.type = "image/svg+xml";
      link.href = "data:image/svg+xml;base64," + base64SVG;
    } else {
      link.href = data;
    }
    document.head.appendChild(link);
  },

  /* ---------- WHEN TAB BECOMES HIDDEN ---------- */
  handleTabHide() {
    const rules = window.thInactiveTabData.rules || [];

    // 1. Capture current state just before switching
    this.originalTitle = document.title || "Page";
    this.originalFavicon = this.getCurrentFavicon();

    rules.forEach((rule) => {
      this.timeout = setTimeout(() => {
        let i = 0;

        const update = () => {
          document.title = rule.messages[i];
          const icon = rule.icons[i] || "";
          if (icon) this.changeFavicon(icon);
          i = (i + 1) % rule.messages.length;
        };

        update(); // First Run

        if (rule.messages.length > 1) {
          this.interval = setInterval(update, rule.interval);
        }
      }, rule.delay);
    });
  },

  /* ---------- WHEN TAB BECOMES ACTIVE AGAIN ---------- */
  handleTabShow() {
    // 2. Cleanup
    clearInterval(this.interval);
    clearTimeout(this.timeout);

    // 3. Restore Title
    document.title = this.originalTitle;

    // 4. Restore Favicon
    this.removeFavicons();
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = this.originalFavicon;
    document.head.appendChild(link);
  },
};

export default StoreOneInactiveTab;
