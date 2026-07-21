const StoreOneStickyCart = {
  bars: null,
  form: null,
  btns: null,
  variations: [],
  requiredAttrs: [],
  animClasses: ["slide", "fade", "bounce"],

  init() {
    const $ = jQuery;
    this.bars = $(".th-sticky-cart");
    if (!this.bars.length) return;

    this.form = $(".th-sticky-cart .th-sticky-form");
    if (this.form.length) {
      this.btns = this.form.find(".th-btn");
      this.variations = window.th_product_variations || [];
      this.requiredAttrs = this.getRequiredAttributes();
    }

    this.bindEvents();
    this.initVariationLogic();
    this.initOfferBannerTimers();
  },

  bindEvents() {
    const $ = jQuery;

    /* -------------------
     * SCROLL / LOAD / RESIZE
     * ------------------- */
    $(window).on("scroll load resize", () => this.handleScroll());

    /* -------------------
     * BUTTON CLICK TRACKING
     * ------------------- */
    $(document).on("click", ".th-btn", function () {
      $(".th-btn").removeClass("clicked");
      $(this).addClass("clicked");
    });

    /* -------------------
     * VARIATION CHANGE
     * ------------------- */
    if (this.form && this.form.length) {
      const self = this;
      this.form.on("change", ".th-var-select", function () {
        self.handleVariationChange($(this));
      });

      /* -------------------
       * FORM SUBMIT
       * ------------------- */
      $("body").on("submit", ".th-sticky-form", function (e) {
        self.handleFormSubmit($(this), e);
      });
    }

    /* -------------------
     * QUANTITY BUTTONS
     * ------------------- */
    $(document).on("click", ".th-qty-plus", function () {
      const $input = $(this).siblings(".th-qty");
      let qty = parseInt($input.val(), 10) || 1;
      $input.val(qty + 1).trigger("change");
    });

    $(document).on("click", ".th-qty-minus", function () {
      const $input = $(this).siblings(".th-qty");
      let qty = parseInt($input.val(), 10) || 1;
      let min = parseInt($input.attr("min"), 10) || 1;

      if (qty > min) {
        $input.val(qty - 1).trigger("change");
      }
    });
  },

  handleScroll() {
    const $ = jQuery;
    const self = this;
    this.bars.each(function () {
      const bar = $(this);
      const trigger = parseInt(bar.data("scroll")) || 20;
      const anim = bar.data("animation") || "slide";

      const scrollPercent =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;

      if (scrollPercent >= trigger) {
        bar.removeClass(self.animClasses.join(" "));
        bar.addClass("show").addClass(anim);
      } else {
        bar.removeClass("show " + self.animClasses.join(" "));
      }
    });
  },

  initVariationLogic() {
    const hasVariation = this.form.find(".th-var-select").length > 0;
    if (hasVariation) {
      this.btns.addClass("disabled").prop("disabled", true);
    }
  },

  getRequiredAttributes() {
    if (!this.variations.length) return [];

    return Object.keys(this.variations[0].attributes).filter((attr) => {
      return this.variations.some((v) => v.attributes[attr] !== "");
    });
  },

  findMatchingVariation(selected) {
    return this.variations.find((v) => {
      return Object.keys(v.attributes).every((attr) => {
        const selectedVal = (selected[attr] || "").toLowerCase();
        const variationVal = (v.attributes[attr] || "").toLowerCase();

        if (variationVal === "") return true;

        return selectedVal === variationVal;
      });
    });
  },

  handleVariationChange($select) {
    const $ = jQuery;
    let selected = {};

    this.form.find(".th-var-select").each(function () {
      const name = $(this).attr("name");
      const val = $(this).val();
      if (val) selected[name] = val;
    });

    const selectedKeys = Object.keys(selected);
    const allRequiredSelected = this.requiredAttrs.every((attr) =>
      selectedKeys.includes(attr),
    );

    if (!allRequiredSelected) {
      this.form.find(".variation_id").val(0);
      this.btns.addClass("disabled").prop("disabled", true);
      return;
    }

    const variation = this.findMatchingVariation(selected);

    if (variation) {
      this.form.find(".variation_id").val(variation.variation_id);
      this.btns.removeClass("disabled").prop("disabled", false);

      if (variation.price_html) {
        $(".th-price").html(variation.price_html);
      }

      if (variation.image && variation.image.src) {
        $(".th-thumb img").attr("src", variation.image.src);
      }
    } else {
      this.form.find(".variation_id").val(0);
      this.btns.addClass("disabled").prop("disabled", true);
    }
  },

  handleFormSubmit($form, e) {
    let btn = $form.find(".th-btn.clicked");
    if (!btn.length) {
      btn = $form.find(".th-btn").first();
    }

    const action = btn.data("action");
    const variationID = $form.find(".variation_id").val();

    // Block if variation not selected
    if (
      $form.find(".th-var-select").length &&
      (!variationID || variationID == 0)
    ) {
      e.preventDefault();
      return;
    }

    /* LOADING (NO disabled attribute) */
    btn.addClass("th-s1-loading");

    // Optional text change
    btn.data("original-text", btn.text());
    btn.text(action === "buynow" ? "Processing..." : "Adding...");

    /* BUY NOW */
    if (action === "buynow") {
      if (!$form.find('input[name="th_buy_now"]').length) {
        $form.append('<input type="hidden" name="th_buy_now" value="1">');
      }

      // No preventDefault (Woo handles redirect)
    }
  },

  initOfferBannerTimers() {
    document.querySelectorAll(".s1-offer-time").forEach((el) => {
      const endTime = new Date(el.dataset.end).getTime();

      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = endTime - now;

        // Auto hide
        if (diff <= 0) {
          const banner = el.closest(".s1-offer-banner");
          if (banner) banner.style.display = "none";
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor(diff / 1000);

        let display = "";

        if (days > 0) {
          display = `${days} ${days === 1 ? "day" : "days"}`;
        } else if (hours > 0) {
          display = `${hours} ${hours === 1 ? "hour" : "hours"}`;
        } else if (minutes > 0) {
          display = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
        } else {
          display = `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
        }

        el.innerHTML = display;
      };

      updateTimer();
      setInterval(updateTimer, 1000);
    });
  },
};

export default StoreOneStickyCart;
