document.addEventListener("DOMContentLoaded", () => {
  const pad = (n) => String(n).padStart(2, "0");

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

      // Countdown
      const days = Math.floor(diff / 86400000);

      const hours = Math.floor((diff % 86400000) / 3600000);

      const minutes = Math.floor((diff % 3600000) / 60000);

      const seconds = Math.floor((diff % 60000) / 1000);

      const set = (selector, value) => {
        const node = el.querySelector(selector);

        if (node) {
          node.textContent = pad(value);
        }
      };

      set(".d", days);
      set(".h", hours);
      set(".m", minutes);
      set(".s", seconds);
    };

    update();

    interval = setInterval(update, 1000);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const pad = (n) => String(n).padStart(2, "0");

  document.querySelectorAll(".th-cd").forEach((el) => {
    const startMs = parseInt(el.dataset.start || 0, 10) * 1000;
    const endMs = parseInt(el.dataset.end || 0, 10) * 1000;
    const serverNowMs = parseInt(el.dataset.serverNow || 0, 10) * 1000;

    if (!endMs) return;

    const clientNowMs = Date.now();
    const offset = clientNowMs - serverNowMs;
    const progressStartMs = startMs > 0 ? startMs : serverNowMs;

    let interval;

    // Radius 24.75 ke hisab se constant circumference
    const radius = 24.75;
    const circumference = radius * 2 * Math.PI;

    // Stroke Fill Engine
    const updateCircle = (selector, currentValue, maxValue) => {
      const circle = el.querySelector(selector);
      if (circle) {
        const safeValue = Math.max(0, Math.min(currentValue, maxValue));
        const progress = safeValue / maxValue;
        const strokeDashoffset = circumference - progress * circumference;
        circle.style.strokeDashoffset = strokeDashoffset;
      }
    };

    const update = () => {
      const nowMs = Date.now() - offset;
      let diff =
        startMs > 0 && nowMs < startMs ? startMs - nowMs : endMs - nowMs;

      if (diff <= 0) {
        const bar = el.querySelector(".th-fill");
        if (bar) bar.style.width = "0%";

        updateCircle(".th-days-circle", 0, 30);
        updateCircle(".th-hours-circle", 0, 24);
        updateCircle(".th-minutes-circle", 0, 60);
        updateCircle(".th-seconds-circle", 0, 60);

        if (el.dataset.expireAction === "hide") el.style.display = "none";
        clearInterval(interval);
        return;
      }

      // Progress Stock Bar
      const bar = el.querySelector(".th-fill");
      if (bar) {
        const totalDuration = endMs - progressStartMs;
        const elapsed = nowMs - progressStartMs;
        let percent = 100 - (elapsed / totalDuration) * 100;
        bar.style.width = Math.max(0, Math.min(100, percent)).toFixed(2) + "%";
      }

      // Time Units Extraction
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      // Text Render
      const set = (selector, value) => {
        const node = el.querySelector(selector);
        if (node) node.textContent = pad(value);
      };
      set(".d", days);
      set(".h", hours);
      set(".m", minutes);
      set(".s", seconds);

      // Live Stroke Filling Calculations
      updateCircle(".th-days-circle", days, 30);
      updateCircle(".th-hours-circle", hours, 24);
      updateCircle(".th-minutes-circle", minutes, 60);
      updateCircle(".th-seconds-circle", seconds, 60);
    };

    update();
    interval = setInterval(update, 1000);
  });
});
