// (function () {

//     const items = document.querySelectorAll(".th-notification");
//     if (!items.length) return;

//     let currentIndex = 0;
//     let isClosed = false;
//     let timer = null;

//     function getRandomDelay(range) {
//         return Math.floor(Math.random() * range);
//     }

//     function applyAnimation(el) {
//         const animation = el.dataset.animation || "slide";

//         // remove all old animation classes
//         el.classList.remove("slide", "fade", "zoom");

//         // add new one
//         el.classList.add(animation);
//     }

//     function startProgressBar(el, duration) {

//     const bar = el.querySelector(".th-progress-fill");
//     if (!bar) return;

//     // reset
//     bar.style.transition = "none";
//     bar.style.width = "0%";

//     // force reflow (important)
//     bar.offsetHeight;

//     // animate
//     bar.style.transition = `width ${duration}ms linear`;
//     bar.style.width = "100%";
// }

//     function showItem(index) {

//         if (!items[index] || isClosed) return;

//         const el = items[index];

//         const duration = parseInt(el.dataset.duration || 5) * 1000;
//         const delayBetween = parseInt(el.dataset.delayBetween || 10) * 1000;

//         const randomEnabled = el.dataset.random === "true";
//         const randomRange = parseInt(el.dataset.randomRange || 0) * 1000;

//         const extraDelay = randomEnabled ? getRandomDelay(randomRange) : 0;

//         /* APPLY ANIMATION */
//         applyAnimation(el);

//         /* SHOW */
//         el.classList.remove("hide");
//         el.classList.add("show");

//         startProgressBar(el, duration);

//         /* AUTO HIDE */
//         timer = setTimeout(() => {

//             hideItem(el);

//             timer = setTimeout(() => {
//                 nextItem();
//             }, delayBetween + extraDelay);

//         }, duration);
//     }

//     function hideItem(el) {

//         // same animation reverse feel
//         el.classList.remove("show");
//         el.classList.add("hide");

//     }

//     function nextItem() {

//         if (isClosed) return;

//         currentIndex++;

//         if (currentIndex >= items.length) {

//             const loop = items[0].dataset.loop === "true";

//             if (!loop) return;

//             currentIndex = 0;
//         }

//         showItem(currentIndex);
//     }

//     /*CLOSE ALL (SMOOTH FIXED) */
//     document.addEventListener("click", function (e) {

//     const closeBtn = e.target.closest(".th-close-btn");

//     if (closeBtn) {

//         isClosed = true;

//         if (timer) clearTimeout(timer);

//         items.forEach(el => {

//             hideItem(el);

//             setTimeout(() => {
//                 el.style.display = "none";
//             }, 400);

//         });
//     }

// });

//     /* INITIAL DELAY */
//     const initialDelay = parseInt(items[0].dataset.initial || 3) * 1000;

//     setTimeout(() => {
//         showItem(currentIndex);
//     }, initialDelay);

// })();

(function () {
  const items = document.querySelectorAll(".th-notification");
  if (!items.length) return;

  let currentIndex = 0;
  let isClosed = false;
  let timer = null;

  function getRandomDelay(range) {
    return Math.floor(Math.random() * range);
  }

  function applyAnimation(el) {
    const animation = el.dataset.animation || "slide";
    el.classList.remove("slide", "fade", "zoom");
    el.classList.add(animation);
  }

  /* ================= PROGRESS BAR ================= */
  function startProgressBar(el, duration) {
    const bar = el.querySelector(".th-progress-fill");
    if (!bar) return;

    bar.style.transition = "none";
    bar.style.width = "0%";

    bar.offsetHeight;

    bar.style.transition = `width ${duration}ms linear`;
    bar.style.width = "100%";
  }

  /* ================= OFFSET FIX ================= */
  function adjustNotificationOffset() {
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
  }

  /* ================= SHOW ================= */
  function showItem(index) {
    if (!items[index] || isClosed) return;

    const el = items[index];

    const duration = parseInt(el.dataset.duration || 5) * 1000;
    const delayBetween = parseInt(el.dataset.delayBetween || 10) * 1000;

    const randomEnabled = el.dataset.random === "true";
    const randomRange = parseInt(el.dataset.randomRange || 0) * 1000;

    const extraDelay = randomEnabled ? getRandomDelay(randomRange) : 0;

    applyAnimation(el);

    el.classList.remove("hide");
    el.classList.add("show");

    startProgressBar(el, duration);

    /*wait for DOM paint then adjust */
    setTimeout(adjustNotificationOffset, 50);

    timer = setTimeout(() => {
      hideItem(el);

      timer = setTimeout(() => {
        nextItem();
      }, delayBetween + extraDelay);
    }, duration);
  }

  /* ================= HIDE ================= */
  function hideItem(el) {
    el.classList.remove("show");
    el.classList.add("hide");
  }

  /* ================= NEXT ================= */
  function nextItem() {
    if (isClosed) return;

    currentIndex++;

    if (currentIndex >= items.length) {
      const loop = items[0].dataset.loop === "true";

      if (!loop) return;

      currentIndex = 0;
    }

    showItem(currentIndex);
  }

  /* ================= CLOSE ================= */
  document.addEventListener("click", function (e) {
    const closeBtn = e.target.closest(".th-close-btn");

    if (closeBtn) {
      isClosed = true;

      if (timer) clearTimeout(timer);

      items.forEach((el) => {
        hideItem(el);

        setTimeout(() => {
          el.style.display = "none";
        }, 400);
      });
    }
  });

  /* ================= INITIAL ================= */
  const initialDelay = parseInt(items[0].dataset.initial || 3) * 1000;

  setTimeout(() => {
    showItem(currentIndex);
  }, initialDelay);

  /* ================= GLOBAL EVENTS ================= */

  window.addEventListener("load", adjustNotificationOffset);
  window.addEventListener("resize", adjustNotificationOffset);

  /*detect cart DOM change */
  const stickyCart = document.querySelector(".th-sticky-cart");

  if (stickyCart) {
    new MutationObserver(() => {
      adjustNotificationOffset();
    }).observe(stickyCart, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
