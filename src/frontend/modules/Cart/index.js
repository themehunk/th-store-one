const $ = window.jQuery;

const StoreOneCart = {
  init() {
    console.count("StoreOneCart.init");
    this.cache();

    this.bindEvents();

    this.updateShippingProgress();
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

    $(document).on("submit", ".s1-cart-coupon form", (e) =>
      this.applyCoupon(e),
    );

    $(document).on("click", ".woocommerce-remove-coupon", (e) =>
      this.removeCoupon(e),
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
        console.log(response);

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

    this.updateShippingProgress();
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

    const coupon = $.trim($form.find('input[name="coupon"]').val());

    if (!coupon.length) {
      return;
    }

    this.loading(true);

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
        this.loading(false);
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

    this.loading(true);

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
        this.loading(false);
      });
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

  /*
   * ----------------------------
   * Free Shipping Progress
   * ----------------------------
   */

  updateShippingProgress() {
    const $bar = $(".s1-progress-fill");

    if (!$bar.length) {
      return;
    }

    const current = Number($bar.data("current")) || 0;

    const target = Number($bar.data("target")) || 0;

    if (!target) {
      return;
    }

    let percent = (current / target) * 100;

    percent = Math.max(0, Math.min(percent, 100));

    $bar.css("width", percent + "%");

    $(".s1-progress-icon").css("left", percent + "%");
  },

  showNotice(message, type = "success") {
    if (!message) {
      return;
    }

    $(".s1-cart-notices").html(`
        <div class="woocommerce-${type}">
            ${message}
        </div>
    `);

    setTimeout(() => {
      $(".s1-cart-notices").fadeOut(300, function () {
        $(this).html("").show();
      });
    }, 2500);
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

  StoreOneCart.updateShippingProgress();
});

export default StoreOneCart;
