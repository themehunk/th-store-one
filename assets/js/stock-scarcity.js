document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".th-stock").forEach((el) => {

    let stock = parseInt(el.dataset.stock);
    const max = parseInt(el.dataset.max);
    const mode = el.dataset.mode;
    const auto = el.dataset.auto === "true";

    const fill = el.querySelector(".th-stock-fill");

    /*  REAL MODE → NO AUTO CHANGE */
    if (mode === "real") return;

    /* FAKE BUT AUTO OFF */
    if (!auto) return;

    /* FAKE AUTO MODE ONLY */
    setInterval(() => {

      if (stock <= 1) return;

      stock--;

      const percent = (stock / max) * 100;
      fill.style.width = percent + "%";

      if (stock <= 5) {
        el.classList.add("th-low-stock");
      }

    }, 4000);

  });

});

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".th-stock").forEach((el) => {

    const stock = parseInt(el.dataset.stock || 0);
    const blinkEnabled = el.dataset.blink === "true";
    const blinkTh = parseInt(el.dataset.blinkTh || 5);

    const colorEnabled = el.dataset.color === "true";

    const lowColor = el.dataset.lowColor;
    const medColor = el.dataset.medColor;
    const highColor = el.dataset.highColor;

    const msg = el.querySelector(".th-stock-msg");
    const fill = el.querySelector(".th-stock-fill");

    /* COLOR CHANGE */
    if (colorEnabled) {

      let color = highColor;

      if (stock <= blinkTh) {
        color = lowColor;
      } else if (stock <= 10) {
        color = medColor;
      }

      if (msg) msg.style.color = color;
      if (fill) fill.style.background = color;
    }

    /*BLINK */
    if (blinkEnabled && stock <= blinkTh) {
      el.classList.add("th-low-stock");
    }

  });

});