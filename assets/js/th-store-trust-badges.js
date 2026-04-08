document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('.storeone-product-brand-swiper').forEach(function (el) {

        const slides = parseInt(el.dataset.slides) || 4;
        const autoplay = el.dataset.autoplay === "true";
        const nav = el.dataset.nav === "true";
        const gap = el.dataset.gap || 15;

        new Swiper(el, {
    slidesPerView: slides,
    spaceBetween: parseInt(gap),

    navigation: nav ? {
        nextEl: el.querySelector('.swiper-button-next'),
        prevEl: el.querySelector('.swiper-button-prev'),
    } : false,

    autoplay: autoplay ? {
        delay: 2500,            
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    } : false,

    speed: 1000,                
    loop: true,             

});

    });

});