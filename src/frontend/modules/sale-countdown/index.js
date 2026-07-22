const StoreOneCountDown = {
  radius: 24.75,
  circumference: 24.75 * 2 * Math.PI,

  init() {
    this.initCountdowns();
  },

  pad(n) {
    return String(n).padStart(2, "0");
  },

  updateCircle(el, selector, currentValue, maxValue) {
    const circle = el.querySelector(selector);
    if (circle) {
      const safeValue = Math.max(0, Math.min(currentValue, maxValue));
      const progress = safeValue / maxValue;
      const strokeDashoffset =
        this.circumference - progress * this.circumference;
      circle.style.strokeDashoffset = strokeDashoffset;
    }
  },

  initCountdowns() {
    document.querySelectorAll(".th-cd").forEach((el) => {
      const startMs = parseInt(el.dataset.start || 0, 10) * 1000;
      const endMs = parseInt(el.dataset.end || 0, 10) * 1000;
      const serverNowMs = parseInt(el.dataset.serverNow || 0, 10) * 1000;

      if (!endMs) {
        return;
      }

      const clientNowMs = Date.now();

      // Browser/server difference
      const offset = clientNowMs - serverNowMs;

      // Progress start point
      const progressStartMs = startMs > 0 ? startMs : serverNowMs;

      let interval;

      const update = () => {
        const nowMs = Date.now() - offset;

        let diff;

        if (startMs > 0 && nowMs < startMs) {
          diff = startMs - nowMs;
        } else {
          diff = endMs - nowMs;
        }

        if (diff <= 0) {
          const bar = el.querySelector(".th-fill");

          if (bar) {
            bar.style.width = "0%";
          }

          // Reset SVG Circles on expire
          this.updateCircle(el, ".th-days-circle", 0, 30);
          this.updateCircle(el, ".th-hours-circle", 0, 24);
          this.updateCircle(el, ".th-minutes-circle", 0, 60);
          this.updateCircle(el, ".th-seconds-circle", 0, 60);

          if (el.dataset.expireAction === "hide") {
            el.style.display = "none";
          }

          clearInterval(interval);
          return;
        }

        // Progress Bar
        const bar = el.querySelector(".th-fill");

        if (bar) {
          const totalDuration = endMs - progressStartMs;
          const elapsed = nowMs - progressStartMs;
          let percent = 100 - (elapsed / totalDuration) * 100;
          percent = Math.max(0, Math.min(100, percent));
          bar.style.width = percent.toFixed(2) + "%";
        }

        // Time Units Extraction
        const days = Math.floor(diff / 86400000);
        let hours = Math.floor((diff % 86400000) / 3600000);

        const daysWrapper = el.querySelector(".th-days-wrapper");

        if (days > 0) {
          // Agar days hain, toh wrapper dikhao (flex ya block) aur hours normal % 24 chalega
          if (daysWrapper) daysWrapper.style.display = "inline-flex";
        } else {
          // Agar days 00 ho gaye, toh wrapper chhupao aur pure ghante HRS me daal do
          if (daysWrapper) daysWrapper.style.display = "none";
          hours = Math.floor(diff / 3600000); // Days ke ghante bhi isme jud gaye
        }

        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        // Text Render
        const set = (selector, value) => {
          const node = el.querySelector(selector);
          if (node) node.textContent = this.pad(value);
        };

        set(".d", days);
        set(".h", hours);
        set(".m", minutes);
        set(".s", seconds);

        // Live Stroke Filling Calculations
        this.updateCircle(el, ".th-days-circle", days, 30);
        this.updateCircle(el, ".th-hours-circle", hours, 24);
        this.updateCircle(el, ".th-minutes-circle", minutes, 60);
        this.updateCircle(el, ".th-seconds-circle", seconds, 60);
      };

      update();
      interval = setInterval(update, 1000);
    });
  },
};

export default StoreOneCountDown;
