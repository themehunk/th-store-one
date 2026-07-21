const StoreOneSaleNotification = {
  items: null,
  currentIndex: 0,
  isClosed: false,
  timer: null,

  init() {
    this.items = document.querySelectorAll(".th-notification");
    if (!this.items.length) return;

    this.bindEvents();
    this.observeStickyCart();
    this.start();
  },

  bindEvents() {
    /* ================= GLOBAL EVENTS ================= */
    window.addEventListener("load", () => this.adjustNotificationOffset());
    window.addEventListener("resize", () => this.adjustNotificationOffset());

    /* ================= CLOSE BUTTON CLICK ================= */
    document.addEventListener("click", (e) => this.handleClose(e));
  },

  start() {
    /* ================= INITIAL DELAY & START ================= */
    const initialDelay = parseInt(this.items[0].dataset.initial || 3) * 1000;

    setTimeout(() => {
      this.showItem(this.currentIndex);
    }, initialDelay);
  },

  showItem(index) {
    if (!this.items[index] || this.isClosed) return;

    const el = this.items[index];

    const duration = parseInt(el.dataset.duration || 5) * 1000;
    const delayBetween = parseInt(el.dataset.delayBetween || 10) * 1000;

    const randomEnabled = el.dataset.random === "true";
    const randomRange = parseInt(el.dataset.randomRange || 0) * 1000;

    const extraDelay = randomEnabled ? this.getRandomDelay(randomRange) : 0;

    this.applyAnimation(el);

    el.classList.remove("hide");
    el.classList.add("show");

    this.startProgressBar(el, duration);

    /* wait for DOM paint then adjust */
    setTimeout(() => this.adjustNotificationOffset(), 50);

    this.timer = setTimeout(() => {
      this.hideItem(el);

      this.timer = setTimeout(() => {
        this.nextItem();
      }, delayBetween + extraDelay);
    }, duration);
  },

  hideItem(el) {
    el.classList.remove("show");
    el.classList.add("hide");
  },

  nextItem() {
    if (this.isClosed) return;

    this.currentIndex++;

    if (this.currentIndex >= this.items.length) {
      const loop = this.items[0].dataset.loop === "true";

      if (!loop) return;

      this.currentIndex = 0;
    }

    this.showItem(this.currentIndex);
  },

  handleClose(e) {
    const closeBtn = e.target.closest(".th-close-btn");

    if (closeBtn) {
      this.isClosed = true;

      if (this.timer) clearTimeout(this.timer);

      this.items.forEach((el) => {
        this.hideItem(el);

        setTimeout(() => {
          el.style.display = "none";
        }, 400);
      });
    }
  },

  observeStickyCart() {
    /* detect cart DOM change */
    const stickyCart = document.querySelector(".th-sticky-cart");

    if (stickyCart) {
      new MutationObserver(() => {
        this.adjustNotificationOffset();
      }).observe(stickyCart, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  },

  adjustNotificationOffset() {
    const cart = document.querySelector(".th-sticky-cart");
    const cartVisible = cart && cart.classList.contains("show");

    const targets = document.querySelectorAll(
      ".th-notification.th-bottom_left, .th-notification.th-bottom_right",
    );

    targets.forEach((el) => {
      if (cartVisible) {
        const cartHeight = cart.offsetHeight || 0;
        el.style.setProperty("bottom", cartHeight + 20 + "px", "important");
      } else {
        el.style.removeProperty("bottom");
      }
    });
  },

  applyAnimation(el) {
    const animation = el.dataset.animation || "slide";
    el.classList.remove("slide", "fade", "zoom");
    el.classList.add(animation);
  },

  startProgressBar(el, duration) {
    const bar = el.querySelector(".th-progress-fill");
    if (!bar) return;

    bar.style.transition = "none";
    bar.style.width = "0%";

    bar.offsetHeight; // Reflow trigger

    bar.style.transition = `width ${duration}ms linear`;
    bar.style.width = "100%";
  },

  getRandomDelay(range) {
    return Math.floor(Math.random() * range);
  },
};

export default StoreOneSaleNotification;
