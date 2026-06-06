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
