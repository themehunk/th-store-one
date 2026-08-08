const $ = window.jQuery;

const StoreOneCart = {
  init() {
    this.cache();

    this.bindEvents();

    this.initShipping();

    this.initCouponSlider();

    this.restoreAISuggestion();

    $(document.body).on("wc_fragments_loaded wc_fragments_refreshed", () => {
      this.restoreAISuggestion();
    });
  },

  cache() {
    this.$body = $("body");

    this.$overlay = $(".s1-side-cart-overlay");

    this.$wrapper = $(".s1-side-cart-wrapper");

    this.$panel = $(".s1-side-cart-preview");

    this.lastCartButton = null;
  },

  bindEvents() {
    /*
     * Open Cart
     */

    $(document).on("click", ".storeone-cart-toggle", (e) => this.openCart(e));

    /*
     * Close Button
     */

    $(document).on("click", ".s1-side-cart-close", (e) => this.closeCart(e));

    /*
     * Overlay
     */

    $(document).on("click", ".s1-side-cart-overlay", (e) => this.closeCart(e));

    /*
     * Escape Key
     */

    $(document).on("keydown", (e) => this.handleEscape(e));

    $(document).on("click", ".s1-qty-plus", (e) => this.increaseQty(e));

    $(document).on("click", ".s1-qty-minus", (e) => this.decreaseQty(e));

    $(document).on("change", ".s1-cart-qty", (e) => this.updateQuantity(e));

    $(document).on("click", ".s1-cart-remove", (e) => this.removeItem(e));

    /*
     * Coupon
     */

    $(document).on("click", ".s1-coupon-toggle", (e) => this.toggleCoupon(e));

    $(document).on("submit", ".s1-cart-coupon form", (e) =>
      this.applyCoupon(e),
    );
    $(document).on("click", ".s1-apply-coupon", (e) => this.applyCouponCard(e));

    $(document).on("click", ".s1-remove-coupon", (e) => this.removeCoupon(e));

    // shipping
    $(document).on("click", ".s1-shipping-head", (e) => this.toggleShipping(e));
    $(document).on("click", ".shipping-calculator-button", (e) =>
      this.toggleShippingCalculator(e),
    );

    $(document).on(
      "change",
      'select.shipping_method, :input[name^="shipping_method"]',
      () => this.shippingMethodSelected(),
    );

    $(document).on("submit", "form.woocommerce-shipping-calculator", (e) =>
      this.shippingCalculatorSubmit(e),
    );

    $(document).on(
      "click",
      ".add_to_cart_button, .single_add_to_cart_button",
      (e) => {
        this.lastCartButton = $(e.currentTarget);
      },
    );

    /*
     * AI Suggestion
     */

    $(document).on("click", ".s1-ai-suggest-btn", (e) => this.aiSuggest(e));

    $(document).on("click", ".s1-ai-product-btn .th-button", (e) =>
      this.aiAddToCart(e),
    );
  },

  /*
   * ----------------------------
   * Open
   * ----------------------------
   */

  openCart(e) {
    if (e) {
      e.preventDefault();
    }

    const cartEffect = this.$wrapper
      .closest(".store-one-side-cart")
      .data("cart-effect");

    if (cartEffect === "taiowc-click-cart") {
      window.location.href = storeOneCart.cartUrl;
      return;
    }

    this.cache();

    this.$wrapper.addClass("active");

    this.$body.addClass("store-one-cart-open");

    this.$body.css("overflow", "hidden");
  },

  /*
   * ----------------------------
   * Close
   * ----------------------------
   */

  closeCart(e) {
    if (e) {
      e.preventDefault();
    }

    this.$wrapper.removeClass("active");

    this.$body.removeClass("store-one-cart-open");

    this.$body.css("overflow", "");
  },

  /*
   * ----------------------------
   * ESC
   * ----------------------------
   */

  handleEscape(e) {
    if (e.key !== "Escape") {
      return;
    }

    if (!this.$wrapper.hasClass("active")) {
      return;
    }

    this.closeCart();
  },

  /*
   * ----------------------------
   * Ajax Helper
   * ----------------------------
   */

  ajax(data = {}) {
    return $.ajax({
      type: "POST",
      url: storeOneCart.ajaxUrl,
      data: {
        nonce: storeOneCart.nonce,
        ...data,
      },
    });
  },

  /*
   * ----------------------------
   * Quantity +
   * ----------------------------
   */

  increaseQty(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);

    const $qty = $btn.closest(".s1-woo-cart-qty").find(".s1-cart-qty");

    $qty.val(parseInt($qty.val(), 10) + 1).trigger("change");
  },

  /*
   * ----------------------------
   * Quantity -
   * ----------------------------
   */

  decreaseQty(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);

    const $qty = $btn.closest(".s1-woo-cart-qty").find(".s1-cart-qty");

    let value = parseInt($qty.val(), 10);

    value = Math.max(1, value - 1);

    $qty.val(value).trigger("change");
  },

  /*
   * ----------------------------
   * Quantity Change
   * ----------------------------
   */

  updateQuantity(e) {
    const $input = $(e.currentTarget);

    const quantity = parseInt($input.val(), 10);

    const cartKey = $input.closest(".s1-woo-cart-qty").data("cart-key");

    this.loading(true);

    this.ajax({
      action: "storeone_cart_update_quantity",
      cart_key: cartKey,
      quantity,
    })
      .done((response) => {
        if (response.success) {
          this.refreshFragments(response.data.fragments);
          this.showNotice(response.data.notice, response.data.type);
        }
      })
      .always(() => {
        this.loading(false);
      });
  },

  /*
   * ----------------------------
   * Remove Item
   * ----------------------------
   */

  removeItem(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);

    const cartKey = $btn.data("cart-key");

    this.loading(true);

    this.ajax({
      action: "storeone_cart_remove_item",
      cart_key: cartKey,
    })
      .done((response) => {
        if (response.success) {
          this.refreshFragments(response.data.fragments);
          this.showNotice(response.data.notice, response.data.type);
        }
      })
      .always(() => {
        this.loading(false);
      });
  },

  /*
   * ----------------------------
   * Replace Fragments
   * ----------------------------
   */

  refreshFragments(fragments) {
    if (!fragments) {
      return;
    }

    $.each(fragments, (selector, html) => {
      $(selector).replaceWith(html);
    });

    $(document.body).trigger("wc_fragments_refreshed");

    this.cache();

    this.openCart();

    this.initShipping();
    setTimeout(() => {
      this.initCouponSlider();
    }, 50);

    if (
      fragments[".store-one-floating-cart"] &&
      !$(".store-one-floating-cart").length
    ) {
      $("body").append(fragments[".store-one-floating-cart"]);
    }
  },

  /*
   * ----------------------------
   * Loading
   * ----------------------------
   */

  loading(state) {
    this.$wrapper.toggleClass("loading", state);
  },

  /*
   * ----------------------------
   * Apply Coupon
   * ----------------------------
   */

  applyCoupon(e) {
    e.preventDefault();

    const $form = $(e.currentTarget);

    const coupon = $.trim($form.find('input[name="coupon_code"]').val());

    if (!coupon.length) {
      return;
    }

    this.couponLoading(true);

    this.ajax({
      action: "storeone_cart_apply_coupon",
      coupon,
    })
      .done((response) => {
        if (response.success) {
          this.refreshFragments(response.data.fragments);
          this.showNotice(response.data.notice, response.data.type);
        }
      })
      .always(() => {
        this.couponLoading(false);
      });
  },

  /*
   * ----------------------------
   * Remove Coupon
   * ----------------------------
   */

  removeCoupon(e) {
    e.preventDefault();

    const coupon = $(e.currentTarget).data("coupon");

    this.couponLoading(true);

    this.ajax({
      action: "storeone_cart_remove_coupon",
      coupon,
    })
      .done((response) => {
        if (response.success) {
          this.refreshFragments(response.data.fragments);
        }
      })
      .always(() => {
        this.couponLoading(false);
      });
  },

  /*
   * ----------------------------
   * Apply Coupon Card
   * ----------------------------
   */

  applyCouponCard(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);

    if ($btn.prop("disabled")) {
      return;
    }

    const coupon = $btn.data("coupon");

    this.couponLoading(true);

    this.ajax({
      action: "storeone_cart_apply_coupon",
      coupon,
    })
      .done((response) => {
        if (response.success) {
          this.refreshFragments(response.data.fragments);

          this.showNotice(response.data.notice, response.data.type);
        }
      })
      .always(() => {
        this.couponLoading(false);
      });
  },

  /*
   * ----------------------------
   * Coupon Toggle
   * ----------------------------
   *
   */

  toggleCoupon(e) {
    e.preventDefault();

    const $coupon = $(e.currentTarget).closest(".s1-cart-coupon");

    $coupon.toggleClass("active");

    $(e.currentTarget).attr("aria-expanded", $coupon.hasClass("active"));
  },

  /*
   * ----------------------------
   * Refresh Cart
   * ----------------------------
   */

  refreshCart() {
    this.ajax({
      action: "storeone_cart_refresh",
    }).done((response) => {
      if (response.fragments) {
        this.refreshFragments(response.fragments);
        if (storeOneCart.cartOpen === "fly-image-open" && this.lastCartButton) {
          this.flyImageToCart(this.lastCartButton, () => {
            this.openCart();
          });
        } else {
          this.openCart();
        }
      }
    });
  },

  initCouponSlider() {
    const $slider = $(".s1-coupon-swiper");

    if (!$slider.length) {
      return;
    }

    if (this.couponSwiper) {
      this.couponSwiper.destroy(true, true);
      this.couponSwiper = null;
    }

    setTimeout(() => {
      this.couponSwiper = new Swiper(".s1-coupon-swiper", {
        slidesPerView: 1,
        spaceBetween: 12,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        watchOverflow: true,
        updateOnWindowResize: true,

        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });

      this.couponSwiper.update();
    }, 50);
  },
  couponLoading(state) {
    $(".s1-cart-coupon").toggleClass("loading", state);
  },

  /*
   * ----------------------------
   * Shipping Accordion
   * ----------------------------
   */

  initShipping() {
    $(".shipping-calculator-form").hide();
    $(".s1-shipping").removeClass("active");
  },

  toggleShipping(e) {
    e.preventDefault();

    $(e.currentTarget).closest(".s1-shipping").toggleClass("active");
  },

  toggleShippingCalculator(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);

    const $form = $btn
      .closest(".s1-shipping-calculator")
      .find(".shipping-calculator-form");

    $form.stop(true, true).slideToggle(250);

    $(document.body).trigger("country_to_state_changed");
  },
  shippingMethodSelected() {
    const shippingMethods = {};

    $(
      'select.shipping_method, :input[name^="shipping_method"]:checked, :input[name^="shipping_method"][type="hidden"]',
    ).each(function () {
      shippingMethods[$(this).data("index")] = $(this).val();
    });

    this.loading(true);

    $.ajax({
      type: "POST",

      url: storeOneCart.wcAjaxUrl.replace(
        "%%endpoint%%",
        "storeone_cart_update_shipping",
      ),

      data: {
        security: storeOneCart.updateShippingNonce,
        shipping_method: shippingMethods,
      },

      success: () => {
        $(document.body).trigger("wc_fragment_refresh");
      },

      complete: () => {
        this.loading(false);
      },
    });
  },
  shippingCalculatorSubmit(e) {
    e.preventDefault();

    const $form = $(e.currentTarget);

    this.loading(true);

    this.ajax({
      action: "storeone_cart_calculate_shipping",

      calc_shipping_country: $form.find('[name="calc_shipping_country"]').val(),

      calc_shipping_state: $form.find('[name="calc_shipping_state"]').val(),

      calc_shipping_city: $form.find('[name="calc_shipping_city"]').val(),

      calc_shipping_postcode: $form
        .find('[name="calc_shipping_postcode"]')
        .val(),
    })
      .done((response) => {
        if (response.success) {
          this.refreshFragments(response.data.fragments);

          this.showNotice(response.data.notice, response.data.type);
        }
      })
      .always(() => {
        this.loading(false);
      });
  },

  showNotice(message, type = "success") {
    if (!message) {
      return;
    }

    const noticeClass =
      type === "error"
        ? "woocommerce-error"
        : type === "info"
        ? "woocommerce-info"
        : "woocommerce-message";

    $(".s1-cart-notices").html(`
    <div class="${noticeClass}">
      ${message}
    </div>
  `);

    setTimeout(() => {
      $(".s1-cart-notices").fadeOut(300, function () {
        $(this).html("").show();
      });
    }, 2000);
  },

  flyImageToCart($button, callback = null) {
    const $target = $(".storeone-cart-target");

    if (!$target.length) {
      if (callback) callback();
      return;
    }

    const $product = $button.closest(".product");

    let $image = $();

    // Shop / Category pages
    if ($product.length) {
      $image = $product
        .find(
          ".woocommerce-loop-product__link img, .product-thumbnail img, img.wp-post-image, img",
        )
        .first();
    }

    // Single product fallback
    if (!$image.length) {
      $image = $(
        ".woocommerce-product-gallery__wrapper img, .woocommerce-product-gallery img",
      ).first();
    }

    // Last fallback
    if (!$image.length) {
      console.log("Store One: Product image not found.");
      if (callback) callback();
      return;
    }

    const offset = $image.offset();
    if (!offset) {
      if (callback) callback();
      return;
    }

    const $clone = $image.clone();

    $clone.css({
      position: "absolute",
      top: offset.top,
      left: offset.left,
      width: $image.outerWidth(),
      height: $image.outerHeight(),
      opacity: 0.8,
      zIndex: 999999,
      pointerEvents: "none",
    });

    $("body").append($clone);

    const targetOffset = $target.offset();

    $clone.animate(
      {
        top: targetOffset.top + $target.outerHeight() / 2,
        left: targetOffset.left + $target.outerWidth() / 2,
        width: 20,
        height: 20,
        opacity: 0.2,
      },
      700,
      "swing",
      function () {
        $(this).remove();

        $target.addClass("storeone-cart-shake");

        setTimeout(() => {
          $target.removeClass("storeone-cart-shake");
        }, 400);

        if (callback) {
          callback();
        }
      },
    );
  },
  /*
   * ----------------------------
   * AI Suggestion
   * ----------------------------
   */

  /*
   * ----------------------------
   * AI Suggestion
   * ----------------------------
   */

  aiSuggestCookie: "storeone_ai_suggest",

  cartHashKey() {
    return typeof wc_cart_fragments_params !== "undefined" &&
      wc_cart_fragments_params.cart_hash_key
      ? wc_cart_fragments_params.cart_hash_key
      : "wc_cart_hash";
  },

  currentCartHash() {
    return localStorage.getItem(this.cartHashKey()) || "";
  },

  saveAISuggestion(data) {
    data.cartHash = this.currentCartHash();

    const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();

    document.cookie =
      this.aiSuggestCookie +
      "=" +
      encodeURIComponent(JSON.stringify(data)) +
      "; expires=" +
      expires +
      "; path=/; SameSite=Lax";
  },

  readAISuggestion() {
    const match = document.cookie.match(
      new RegExp("(?:^|;\\s*)" + this.aiSuggestCookie + "=([^;]*)"),
    );

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch (e) {
      return null;
    }
  },

  deleteAISuggestion() {
    document.cookie =
      this.aiSuggestCookie +
      "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },

  renderAISuggestion($result, data) {
    const intro = data.intro ? `<p class="s1-ai-intro">${data.intro}</p>` : "";

    $result.html(intro + (data.html || "")).show();
  },

  restoreAISuggestion() {
    const $result = $(".s1-ai-suggest-result");

    if (!$result.length) {
      return;
    }

    const data = this.readAISuggestion();

    if (!data) {
      return;
    }

    /*
     * Cart changed after suggestion was generated.
     */
    if (data.cartHash && data.cartHash !== this.currentCartHash()) {
      this.deleteAISuggestion();

      $result.hide().html("");

      return;
    }

    this.renderAISuggestion($result, data);
  },

  clearAISuggestion() {
    this.deleteAISuggestion();

    $(".s1-ai-suggest-result").hide().html("");
  },

  aiSuggest(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);

    const $result = $btn.siblings(".s1-ai-suggest-result");

    if ($btn.hasClass("s1-ai-loading")) {
      return;
    }

    $btn.addClass("s1-ai-loading").prop("disabled", true);

    $result.hide().html("");

    this.ajax({
      action: "th_store_one_ai_suggest",
    })
      .done((response) => {
        if (response && response.success) {
          const data = {
            intro: response.data.intro || "",
            html: response.data.html || "",
          };

          /*
           * Save suggestion for 1 hour.
           */
          this.saveAISuggestion(data);

          /*
           * Render immediately.
           */
          this.renderAISuggestion($result, data);
        } else {
          const message =
            response && response.data && response.data.message
              ? response.data.message
              : "AI suggestion failed.";

          $result
            .html(`<span class="s1-ai-error">${message}</span>`)
            .fadeIn("fast");
        }
      })
      .fail(() => {
        $result
          .html(
            '<span class="s1-ai-error">Connection error. Please try again.</span>',
          )
          .fadeIn("fast");
      })
      .always(() => {
        $btn.removeClass("s1-ai-loading").prop("disabled", false);
      });
  },
  refreshCartSilently(fragments) {
    if (!fragments) {
      return;
    }

    $.each(fragments, (selector, html) => {
      $(selector).replaceWith(html);
    });

    $(document.body).trigger("wc_fragments_refreshed");

    this.cache();

    this.initShipping();

    setTimeout(() => {
      this.initCouponSlider();
    }, 50);

    if (
      fragments[".store-one-floating-cart"] &&
      !$(".store-one-floating-cart").length
    ) {
      $("body").append(fragments[".store-one-floating-cart"]);
    }
  },
  aiAddToCart(e) {
    e.preventDefault();

    const $btn = $(e.currentTarget);
    const productId = $btn.data("product_id");

    if (!productId || $btn.hasClass("s1-ai-add-loading")) {
      return;
    }

    $btn.addClass("s1-ai-add-loading");

    this.ajax({
      action: "storeone_cart_add_item",
      product_id: productId,
      quantity: 1,
    })
      .done((response) => {
        if (!response.success) {
          this.showNotice(
            response.data?.message || "Unable to add product.",
            "error",
          );

          return;
        }

        /*
         * Update cart fragments only.
         * DO NOT call refreshCart()
         */
        this.refreshFragmentsWithoutOpen(response.data.fragments);

        /*
         * Same notice as quantity/remove.
         */
        this.showNotice(response.data.notice, response.data.type);

        /*
         * AI suggestion is now invalid
         * because cart composition changed.
         */
        this.clearAISuggestion();
      })
      .fail(() => {
        this.showNotice("Unable to add product. Please try again.", "error");
      })
      .always(() => {
        $btn.removeClass("s1-ai-add-loading");
      });
  },
  refreshFragmentsWithoutOpen(fragments) {
    if (!fragments) {
      return;
    }

    // Current cart state save karo
    const wasOpen = this.$wrapper && this.$wrapper.hasClass("active");

    $.each(fragments, (selector, html) => {
      $(selector).replaceWith(html);
    });

    $(document.body).trigger("wc_fragments_refreshed");

    this.cache();

    this.initShipping();

    setTimeout(() => {
      this.initCouponSlider();
    }, 50);

    if (
      fragments[".store-one-floating-cart"] &&
      !$(".store-one-floating-cart").length
    ) {
      $("body").append(fragments[".store-one-floating-cart"]);
    }

    // AI add-to-cart ke baad cart state restore karo
    if (wasOpen) {
      this.$wrapper.addClass("active");
      this.$body.addClass("store-one-cart-open");
      this.$body.css("overflow", "hidden");
    }
  },
};
/*
|--------------------------------------------------------------------------
| WooCommerce Events
|--------------------------------------------------------------------------
*/

$(document.body).on("added_to_cart", (event, fragments, cart_hash, $button) => {
  StoreOneCart.clearAISuggestion();
  const btn = $button || StoreOneCart.lastCartButton;

  if (storeOneCart.cartOpen === "fly-image-open") {
    StoreOneCart.flyImageToCart(btn, () => {
      StoreOneCart.refreshCart();
    });
  } else {
    StoreOneCart.refreshCart();
  }
});

$(document.body).on("removed_from_cart", () => {
  StoreOneCart.clearAISuggestion();
  StoreOneCart.refreshCart();
});

$(document.body).on("wc_fragments_refreshed", () => {
  StoreOneCart.cache();

  StoreOneCart.initShipping();
  StoreOneCart.initCouponSlider();
});

export default StoreOneCart;
