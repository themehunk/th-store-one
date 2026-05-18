jQuery(function ($) {
  /* ================= HELPERS ================= */
  function getYouTubeId(url) {
    try {
      let u = new URL(url);

      // watch?v=
      if (u.searchParams.get("v")) {
        return u.searchParams.get("v");
      }

      // youtu.be/
      if (u.hostname.includes("youtu.be")) {
        return u.pathname.replace("/", "");
      }

      // embed/
      if (u.pathname.includes("/embed/")) {
        return u.pathname.split("/embed/")[1];
      }

      //SHORTS SUPPORT
      if (u.pathname.includes("/shorts/")) {
        return u.pathname.split("/shorts/")[1];
      }
    } catch (e) {}

    return "";
  }

  function getVimeoId(url) {
    return url.split("/").pop().split("?")[0];
  }

  function buildVideo(video, type, autoplay, thumb) {
    let auto = autoplay ? 1 : 0;
    let mute = autoplay ? 1 : 0;

    if (type === "youtube") {
      let id = getYouTubeId(video);
      if (!id) return "";
      return `<iframe src="https://www.youtube.com/embed/${id}?autoplay=${auto}&mute=${mute}&rel=0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            frameborder="0"
            allowfullscreen></iframe>`;
    }

    if (type === "vimeo") {
      let id = getVimeoId(video);
      return `<iframe src="https://player.vimeo.com/video/${id}?autoplay=${auto}&muted=${mute}"
                     allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    }

    return `<video src="${video}" 
        ${autoplay ? "autoplay muted" : "controls"} 
        playsinline 
        preload="metadata"
        poster="${thumb}">
</video>`;
  }

  /* ================= PLAY VIDEO ON SLIDE ================= */
  function playVideo($slide) {
    if ($slide.find("iframe, video").length) return;

    let video = $slide.data("video");
    let type = $slide.data("type") || "youtube";
    let autoplay = $slide.data("autoplay") == 1;
    let thumb = $slide.data("thumb");

    let html = buildVideo(video, type, autoplay, thumb);
    if (!html) return;

    let $link = $slide.find("a");

    $link.css({
      opacity: 0,
      pointerEvents: "none",
    });

    if (!$slide.find(".th-video-wrapper").length) {
      $slide.append('<div class="th-video-wrapper">' + html + "</div>");
    }
  }

  /* ================= THUMBS & ICONS ================= */
  function modifyVideoThumbs() {
    let $gallery = $(".woocommerce-product-gallery");
    let thumbs = $gallery.find(".flex-control-thumbs > li");
    let slides = $gallery.find(
      ".woocommerce-product-gallery__wrapper .woocommerce-product-gallery__image",
    );
    if (!thumbs.length) return;
    slides.each(function (index) {
      if ($(this).hasClass("th-video-slide")) {
        thumbs.eq(index).addClass("th-video-thumb");
      }
    });

    slides.each(function (index) {
      let slide = $(this);
      if (!slide.hasClass("th-video-slide")) return;

      let thumb = slide.data("thumb");
      let li = thumbs.eq(index);

      if (li.length && !li.find(".th-video-thumb-icon").length) {
        li.find("img").attr("src", thumb);
        li.css("position", "relative");
        let iconType = thVideoData?.icon || "outline";
        let iconColor = thVideoData?.color || "#7388FFBA";
        let iconHtml = getVideoIcon(iconType, iconColor);
        li.append(`<span class="th-video-thumb-icon">${iconHtml}</span>`);
      }
    });
  }

  /* ================= EVENT HANDLERS ================= */

  // 1. Click on Slide to Play
  $(document).on("click", ".th-video-slide", function (e) {
    if ($(e.target).closest(".woocommerce-product-gallery__trigger").length)
      return;

    e.preventDefault();
    playVideo($(this));
  });

  // 2. Click on Thumbnail
  $(document).on("click", ".flex-control-thumbs li", function () {
    let index = $(this).index();
    setTimeout(function () {
      let targetSlide = $(
        ".woocommerce-product-gallery__wrapper .woocommerce-product-gallery__image",
      ).eq(index);
      if (targetSlide.hasClass("th-video-slide")) {
        playVideo(targetSlide);
      }
    }, 300);
  });

  // 3. Fix for Variation & Initial Load
  function runFixes() {
    modifyVideoThumbs();
  }

  $(window).on("load", runFixes);

  /* ================= INITIAL LOAD VIDEO ================= */
  function loadInitialVideo() {
    let activeSlide = $(
      ".woocommerce-product-gallery__wrapper .flex-active-slide",
    );
    if (activeSlide.hasClass("th-video-slide")) {
      playVideo(activeSlide);
    }
  }

  /* ================= SLIDE CHANGE VIDEO ================= */
  function onSlideChange() {
    setTimeout(function () {
      let activeSlide = $(
        ".woocommerce-product-gallery__wrapper .flex-active-slide",
      );

      // Remove old videos
      $(".th-video-wrapper").remove();
      $(".th-video-slide a").css("visibility", "visible");

      if (activeSlide.hasClass("th-video-slide")) {
        playVideo(activeSlide);
      }
    }, 400);
  }

  function toggleZoomTrigger() {
    let $gallery = $(".woocommerce-product-gallery");
    let $activeSlide = $gallery.find(".flex-active-slide");

    if ($activeSlide.hasClass("th-video-slide")) {
      //video → hide
      $gallery.find(".woocommerce-product-gallery__trigger").hide();
    } else {
      //image → show
      $gallery.find(".woocommerce-product-gallery__trigger").show();
    }
  }

  $(window).on("load", function () {
    loadInitialVideo();
    setTimeout(function () {
      toggleZoomTrigger();
    }, 500);
  });
  $(document).on("click", ".flex-control-thumbs img", function () {
    setTimeout(function () {
      toggleZoomTrigger();
    }, 300);
  });
  /* Flexslider change detect */
  $(document).on("click", ".flex-control-thumbs li", onSlideChange);
  $(document).on("click", ".flex-next, .flex-prev", onSlideChange);

  // Ajax complete ki jagah WooCommerce variation event use karein (STUCK FIX)
  $(document).on("found_variation", "form.variations_form", function () {
    setTimeout(runFixes, 500);
  });

  /* ================= SHOP LOOP VIDEO ================= */
  $(document).on("click", ".th-loop-video .th-video-play", function (e) {
    e.preventDefault();
    let wrap = $(this).closest(".th-video-wrap");
    let url = wrap.data("src");
    wrap.html(
      `<video src="${url}" autoplay controls muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`,
    );
  });

  // Hover Effect + Controls
  $(document).on("mouseenter", ".th-loop-video .th-video-wrap", function () {
    const $wrap = $(this);
    const video = $wrap.find("video")[0];
    const $icon = $wrap.find(".th-video-play");

    if (!video) return;

    // Show controls on hover
    video.controls = true;

    // If not autoplay, show icon initially
    if (!$wrap.closest(".th-loop-video").hasClass("autoplay-enabled")) {
      $icon.fadeIn(100);
    }
  });

  $(document).on("mouseleave", ".th-loop-video .th-video-wrap", function () {
    const video = $(this).find("video")[0];
    if (video) {
      video.controls = false; // hide controls on mouse leave
    }
  });

  function getVideoIcon(type, color) {
    switch (type) {
      case "triangle":
        return `<svg viewBox="0 0 24 24" width="34" height="34">
                <polygon points="8,5 19,12 8,19" fill="${color}"/>
            </svg>`;

      case "camera":
        return `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="${color}" stroke-width="2">
                <rect x="3" y="6" width="11" height="12" rx="2"></rect>
                <polygon points="16,9 21,6 21,18 16,15"></polygon>
            </svg>`;

      case "youtube":
        return `<svg viewBox="0 0 68 48" width="34" height="24">
                <rect width="68" height="48" rx="10" fill="${color}"/>
                <polygon points="28,18 28,30 42,24" fill="#fff"/>
            </svg>`;

      case "circle":
        return `<svg viewBox="0 0 24 24" width="34" height="34">
                <circle cx="12" cy="12" r="10" fill="${color}"/>
                <polygon points="10,8 16,12 10,16" fill="#fff"/>
            </svg>`;
      case "outline":
        return `<svg width="24" height="24" fill="${color}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"></path></g></svg>`;

      default:
        return `<svg viewBox="0 0 24 24" width="34" height="34">
                <circle cx="12" cy="12" r="10" fill="${color}"/>
                <polygon points="10,8 16,12 10,16" fill="#fff"/>
            </svg>`;
    }
  }
});
