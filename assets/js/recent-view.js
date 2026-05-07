document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".th-recent-slider").forEach(function (el) {
    const slides = parseInt(el.dataset.slides) || 3;
    const autoplay = el.dataset.autoplay === "true";
    const nav = el.dataset.nav === "true";
    const gap = parseInt(el.dataset.gap) || 15;
    new Swiper(el, {
      slidesPerView: slides,
      spaceBetween: gap,
      loop: true,
      speed: 500,
     
      navigation: nav
        ? {
            nextEl: el.querySelector(".swiper-button-next"),
            prevEl: el.querySelector(".swiper-button-prev"),
          }
        : false,

      autoplay: autoplay
        ? {
            delay:3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }
        : false,

      breakpoints: {
        0: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: slides,
        },
      },
    });
  });
});
