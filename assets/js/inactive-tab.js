(function () {
  if (!window.thInactiveTabData) return;

  const rules = thInactiveTabData.rules;

  // Global variables
  let originalTitle = document.title;
  let originalFavicon = "";
  let interval = null;
  let timeout = null;

  /* ---------- GET CURRENT FAVICON ---------- */
  const getCurrentFavicon = () => {
    const link = document.querySelector("link[rel*='icon']");
    // Agar link tag hai toh uska href lo, warna default '/favicon.ico' try karo
    return link ? link.href : window.location.origin + "/favicon.ico";
  };

  /* ---------- REMOVE ALL FAVICONS ---------- */
  const removeFavicons = () => {
    const rels = ["icon", "shortcut icon", "apple-touch-icon", "mask-icon"];
    rels.forEach((rel) => {
      document.querySelectorAll(`link[rel='${rel}']`).forEach((el) => el.remove());
    });
  };

  /* ---------- CHANGE FAVICON ---------- */
  const changeFavicon = (data) => {
    if (!data) return;
    removeFavicons();

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
  };

  /* ---------- MAIN ---------- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // 1. Capture current state just before switching
      originalTitle = document.title || "Page"; 
      originalFavicon = getCurrentFavicon();

      rules.forEach((rule) => {
        timeout = setTimeout(() => {
          let i = 0;
          
          const update = () => {
            document.title = rule.messages[i];
            const icon = rule.icons[i] || "";
            if (icon) changeFavicon(icon);
            i = (i + 1) % rule.messages.length;
          };

          update(); // First Run

          if (rule.messages.length > 1) {
            interval = setInterval(update, rule.interval);
          }
        }, rule.delay);
      });
    } else {
      // 2. Cleanup
      clearInterval(interval);
      clearTimeout(timeout);

      // 3. Restore Title
      document.title = originalTitle;

      // 4. Restore Favicon
      removeFavicons();
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = originalFavicon;
      document.head.appendChild(link);
    }
  });
})();