jQuery(function ($) {

  const bars = $(".th-sticky-cart");
  if (!bars.length) return;

  const animClasses = ["slide", "fade", "bounce"];

  /* -------------------
   * SCROLL
   * ------------------- */
  const handleScroll = () => {
    bars.each(function () {

      const bar = $(this);
      const trigger = parseInt(bar.data("scroll")) || 20;
      const anim = bar.data("animation") || "slide";

      const scrollPercent =
        (window.scrollY /
          (document.body.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent >= trigger) {
        bar.removeClass(animClasses.join(" "));
        bar.addClass("show").addClass(anim);
      } else {
        bar.removeClass("show " + animClasses.join(" "));
      }
    });
  };

  $(window).on("scroll load resize", handleScroll);

  /* -------------------
   * FORM + BUTTON
   * ------------------- */
  const form = $(".th-sticky-cart .th-sticky-form");
  if (!form.length) return;

  const btns = form.find(".th-btn");

  /* -------------------
   * CLICK TRACK (IMPORTANT)
   * ------------------- */
  $(document).on("click", ".th-btn", function () {
    $(".th-btn").removeClass("clicked");
    $(this).addClass("clicked");
  });

  /* -------------------
   * VARIATION LOGIC
   * ------------------- */
  let variations = window.th_product_variations || [];
  const hasVariation = form.find(".th-var-select").length > 0;

  if (hasVariation) {
    btns.addClass("disabled").prop("disabled", true);
  }

  const getRequiredAttributes = () => {
    if (!variations.length) return [];

    return Object.keys(variations[0].attributes).filter(attr => {
      return variations.some(v => v.attributes[attr] !== "");
    });
  };

  const requiredAttrs = getRequiredAttributes();

  const findMatchingVariation = (selected) => {
    return variations.find((v) => {
      return Object.keys(v.attributes).every((attr) => {

        const selectedVal = (selected[attr] || "").toLowerCase();
        const variationVal = (v.attributes[attr] || "").toLowerCase();

        if (variationVal === "") return true;

        return selectedVal === variationVal;
      });
    });
  };

  form.on("change", ".th-var-select", function () {

    let selected = {};

    form.find(".th-var-select").each(function () {
      const name = $(this).attr("name");
      const val = $(this).val();
      if (val) selected[name] = val;
    });

    const selectedKeys = Object.keys(selected);
    const allRequiredSelected = requiredAttrs.every(attr => selectedKeys.includes(attr));

    if (!allRequiredSelected) {
      form.find(".variation_id").val(0);
      btns.addClass("disabled").prop("disabled", true);
      return;
    }

    const variation = findMatchingVariation(selected);

    if (variation) {

      form.find(".variation_id").val(variation.variation_id);
      btns.removeClass("disabled").prop("disabled", false);

      if (variation.price_html) {
        $(".th-price").html(variation.price_html);
      }

      if (variation.image && variation.image.src) {
        $(".th-thumb img").attr("src", variation.image.src);
      }

    } else {
      form.find(".variation_id").val(0);
      btns.addClass("disabled").prop("disabled", true);
    }

  });

  /* -------------------
   * SUBMIT + BUY NOW + LOADING
   * ------------------- */
  $("body").on("submit", ".th-sticky-form", function (e) {

    const form = $(this);

    let btn = form.find(".th-btn.clicked");
    if (!btn.length) {
      btn = form.find(".th-btn").first();
    }

    const action = btn.data("action");
    const variationID = form.find(".variation_id").val();

    //block if variation not selected
    if (form.find(".th-var-select").length && (!variationID || variationID == 0)) {
      e.preventDefault();
      return;
    }

    /*LOADING (NO disabled attribute) */
    btn.addClass("th-s1-loading");

    // optional text change
    btn.data("original-text", btn.text());
    btn.text(action === "buynow" ? "Processing..." : "Adding...");

    /* BUY NOW */
    if (action === "buynow") {

      if (!form.find('input[name="th_buy_now"]').length) {
        form.append('<input type="hidden" name="th_buy_now" value="1">');
      }

      // no preventDefault (Woo handles redirect)
    }

  });

});

// time banner code
document.querySelectorAll('.s1-offer-time').forEach(el => {

  const endTime = new Date(el.dataset.end).getTime();

  function updateTimer() {

    const now = new Date().getTime();
    const diff = endTime - now;

    // 🔥 Auto hide
    if (diff <= 0) {
      const banner = el.closest('.s1-offer-banner');
      if (banner) banner.style.display = 'none';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor(diff / 1000);

    let display = "";

    if (days > 0) {
      display = `${days} ${days === 1 ? 'day' : 'days'}`;
    } 
    else if (hours > 0) {
      display = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } 
    else if (minutes > 0) {
      display = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } 
    else {
      display = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    }

    el.innerHTML = display;
  }

  updateTimer();
  setInterval(updateTimer, 1000);

});