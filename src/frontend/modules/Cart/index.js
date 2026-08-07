const $ = window.jQuery;

const StoreOneCart = {
  init() {
    this.cache();

    this.bindEvents();

    this.initShipping();

    this.initCouponSlider();
  },

  cache() {
    this.$body = $("body");

    this.$overlay = $(".s1-side-cart-overlay");

    this.$wrapper = $(".s1-side-cart-wrapper");

    this.$panel = $(".s1-side-cart-preview");
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
        this.openCart();
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
};
/*
|--------------------------------------------------------------------------
| WooCommerce Events
|--------------------------------------------------------------------------
*/

$(document.body).on("added_to_cart", () => {
  StoreOneCart.refreshCart();

  StoreOneCart.openCart();
});

$(document.body).on("removed_from_cart", () => {
  StoreOneCart.refreshCart();
});

$(document.body).on("wc_fragments_refreshed", () => {
  StoreOneCart.cache();

  StoreOneCart.initShipping();
  StoreOneCart.initCouponSlider();
});

export default StoreOneCart;
