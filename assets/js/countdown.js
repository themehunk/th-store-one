// document.addEventListener("DOMContentLoaded", () => {

//   const format = (n) => n.toString().padStart(2, '0');

//   document.querySelectorAll(".th-cd").forEach(el => {

//     const end = parseInt(el.dataset.end) * 1000;
//     if (!end) return;

//     const update = () => {

//       const diff = end - Date.now();

//       if (diff <= 0) {
//         el.style.display = "none";
//         return;
//       }

//       const d = Math.floor(diff / 86400000);
//       const h = Math.floor((diff / 3600000) % 24);
//       const m = Math.floor((diff / 60000) % 60);
//       const s = Math.floor((diff / 1000) % 60);

//       /* SAFE UPDATE (important) */
//       const set = (selector, value) => {
//         const node = el.querySelector(selector);
//         if (node) node.innerText = format(value);
//       };

//       set(".d", d);
//       set(".h", h);
//       set(".m", m);
//       set(".s", s);
//     };

//     update();
//     setInterval(update, 1000);

//   });

// });

document.addEventListener("DOMContentLoaded", () => {

  const format = (n) => n.toString().padStart(2, '0');

  document.querySelectorAll(".th-cd").forEach(el => {

    const end = parseInt(el.dataset.end) * 1000;
    const expireAction = el.dataset.expireAction || "hide";
    const expireMsg = el.dataset.expireMsg || "Expired";
    const formatType = el.dataset.format || "dhms";

    if (!end) return;

    const update = () => {

      const diff = end - Date.now();

      /* EXPIRE LOGIC */
      if (diff <= 0) {

        if (expireAction === "hide") {
          el.style.display = "none";
        } else if (expireAction === "show_message") {
          el.innerHTML = `<div class="th-expired">${expireMsg}</div>`;
        }

        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);

      const set = (selector, value) => {
        const node = el.querySelector(selector);
        if (node) node.innerText = format(value);
      };

      /* FORMAT CONTROL */
      if (formatType === "dhms") {
        set(".d", d);
        set(".h", h);
        set(".m", m);
        set(".s", s);
      }

      if (formatType === "hms") {
        const totalHours = Math.floor(diff / 3600000);
        set(".h", totalHours);
        set(".m", m);
        set(".s", s);

        /* hide days if exists */
        const dEl = el.querySelector(".d");
        if (dEl) dEl.closest(".t-item")?.remove();
      }
    };

    update();
    setInterval(update, 1000);

  });

});