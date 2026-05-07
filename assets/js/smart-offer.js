jQuery(function ($) {
  function formatPrice(price) {
    price = parseFloat(price || 0);

    const decimals = parseInt(thSmartOffer.decimals) || 2;

    const decimalSep = thSmartOffer.decimal_sep || ".";

    const thousandSep = thSmartOffer.thousand_sep || ",";

    const symbol = thSmartOffer.currency_symbol || "$";

    let number = price.toFixed(decimals);

    let parts = number.split(".");

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);

    number = parts.join(decimalSep);

    return thSmartOffer.price_format
      .replace("%1$s", symbol)
      .replace("%2$s", number);
  }

  function updateUI() {
    const wrapper = $(".th-offer-wrapper");

    if (!wrapper.length) {
      $(".single_add_to_cart_button").text(
        thSmartOffer.add_to_cart_text || "Add to cart",
      );

      return;
    }

    const selected = $("input[name='th_offer_select']:checked");

    /* =====================================================
           NO SELECTION
        ===================================================== */

    if (!selected.length) {
      wrapper.find(".th-price").html("");

      if (wrapper.length > 0) {
        $(".single_add_to_cart_button").text("Select Offer");
      }

      return;
    }

    const card = selected.closest(".th-offer-card");

    const base = parseFloat(wrapper.attr("data-base")) || 0;

    const qty = parseInt($("input.qty").val()) || 1;

    const discount = parseFloat(card.data("discount")) || 0;

    const type = card.data("type");

    const applyOn = card.data("apply-on");

    const rewardType = card.data("reward-type");

    const min = parseInt(card.data("x")) || 1;

    let final = base;
    /* =====================================================
   VARIABLE VALIDATION
===================================================== */

    const hasVariations = $("form.variations_form").length;

    if (hasVariations && selected.length && !isVariationSelected()) {
      card.addClass("th-variation-pending");

      if (!card.find(".th-variation-only-msg").length) {
        card.append(
          `
        <div class="th-variation-only-msg">
            ${thSmartOffer.select_variation_text}
        </div>
        `,
        );
      }

      $(".single_add_to_cart_button").text(thSmartOffer.select_options_text);

      return;
    } else {
      card.removeClass("th-variation-pending");

      card.find(".th-variation-only-msg").remove();
    }

    /* =====================================================
           SAME PRODUCT DISCOUNT
        ===================================================== */

    if (applyOn === "same_product") {
      /* PERCENT */

      if (type === "discount_percent" && discount > 0) {
        final = base - (base * discount) / 100;
      }

      /* FIXED PRODUCT */

      if (type === "discount_fixed" && discount > 0) {
        final = Math.max(0, base - discount);
      }

      /* FIXED CART */

      if (type === "discount_fixed_cart" && discount > 0) {
        const total = base * qty;

        final = Math.max(0, total - discount);
      }
    }

    /* =====================================================
           RESET PRICES
        ===================================================== */

    wrapper.find(".th-price").html("");

    /* =====================================================
           PRICE UI
        ===================================================== */

    if (rewardType !== "free_product") {
      /* FIXED CART */

      if (type === "discount_fixed_cart") {
        const original = base * qty;

        const hasDiscount = parseFloat(final) < parseFloat(original);

        card.find(".th-price").html(
          `
        <div class="th-price-wrap">

            ${
              hasDiscount
                ? `
                <del class="th-old-price">
                    ${formatPrice(original)}
                </del>
                `
                : ""
            }

            <strong class="th-new-price">
                ${formatPrice(final)}
            </strong>

            ${
              hasDiscount
                ? `
                <small class="th-save-price">
                    Save ${formatPrice(discount)}
                </small>
                `
                : ""
            }

        </div>
        `,
        );
      } else {
        const hasDiscount = parseFloat(final) < parseFloat(base);

        card.find(".th-price").html(
          `
        <div class="th-price-wrap">

            ${
              hasDiscount
                ? `
                <del class="th-old-price">
                    ${formatPrice(base)}
                </del>
                `
                : ""
            }

            <strong class="th-new-price">
                ${formatPrice(final)}
            </strong>

        </div>
        `,
        );
      }
    }

    /* =====================================================
           BUTTON TEXT
        ===================================================== */

    if (rewardType === "free_product") {
      $(".single_add_to_cart_button").text("Add Offer To Cart");
    } else {
      let total = final;

      if (type !== "discount_fixed_cart") {
        total = final * qty;
      }

      $(".single_add_to_cart_button").text(
        `Add to Cart • ${formatPrice(total)}`,
      );
    }

    /* =====================================================
           PROGRESS
        ===================================================== */

    const percent = Math.min((qty / min) * 100, 100);

    card.find(".th-bar").css("width", percent + "%");

    /* =====================================================
           MESSAGE
        ===================================================== */

    updateMessage(card, qty, min);
  }

  /* ================= SELECT ================= */

  $(document).on("change", "input[name='th_offer_select']", function () {
    const all = $("input[name='th_offer_select']");

    // sab cards reset
    $(".th-offer-card").removeClass("offer_select");

    all.not(this).prop("checked", false);

    const card = $(this).closest(".th-offer-card");

    // sirf checked + active offer
    if ($(this).is(":checked") && card.length) {
      card.addClass("offer_select");

      $(this).data("waschecked", true);
    }

    const min = parseInt(card.data("x")) || 1;

    $("input.qty").val(min).trigger("change");

    updateUI();
  });

  /* ================= UNSELECT ================= */

  $(document).on("click", "input[name='th_offer_select']", function () {
    const card = $(this).closest(".th-offer-card");

    if ($(this).data("waschecked")) {
      $(this).prop("checked", false);

      $(this).data("waschecked", false);

      // inactive
      card.removeClass("offer_select");

      updateUI();

      return;
    }

    $("input[name='th_offer_select']").data("waschecked", false);
  });
  /* ================= QTY ================= */

  $(document).on("change keyup", "input.qty", function () {
    updateUI();
  });

  /* ================= SUBMIT ================= */

  $(document).on("submit", "form.cart", function () {
    const selected = $("input[name='th_offer_select']:checked");

    const card = selected.closest(".th-offer-card");

    const reward = selected.val();

    const rule = selected.data("rule");

    const applyOn = card.data("apply-on");

    const form = $(this);

    form
      .find(
        "input[name='th_reward'], input[name='th_rule'], input[name='th_apply_on']",
      )
      .remove();

    $("<input>", {
      type: "hidden",
      name: "th_reward",
      value: reward,
    }).appendTo(form);

    $("<input>", {
      type: "hidden",
      name: "th_rule",
      value: rule,
    }).appendTo(form);

    $("<input>", {
      type: "hidden",
      name: "th_apply_on",
      value: applyOn,
    }).appendTo(form);
  });

  /* ================= INIT ================= */

  setTimeout(() => {
    const first = $("input[name='th_offer_select']:checked");

    if (first.length) {
      updateUI();
    }
  }, 200);

  /* ================= CART PROGRESS ================= */

  function updateCartOffer() {
    let totalQty = 0;

    $(".cart_item").each(function () {
      const qty = parseInt($(this).find(".qty").val()) || 0;

      totalQty += qty;
    });

    $(".th-offer-cart").each(function () {
      const x = parseInt($(this).data("x")) || 1;

      const bar = $(this).find(".th-bar");

      const percent = Math.min((totalQty / x) * 100, 100);

      bar.css("width", percent + "%");
    });
  }

  $(document).on("change", ".cart_item .qty", function () {
    setTimeout(updateCartOffer, 300);
  });

  /* ================= MESSAGE ================= */

  function updateMessage(card, qty, min) {
    const msgTemplate = card.data("msg") || "";

    const successMsg = card.data("success") || "";

    const msgBox = card.find(".th-msg");

    if (qty < min) {
      const remaining = min - qty;

      const msg = msgTemplate.replace("{remaining}", remaining);

      msgBox.html(msg);
    } else {
      msgBox.html(successMsg);
    }
  }
  /* =====================================================
   VARIABLE PRODUCT SUPPORT
===================================================== */

  $(document).on(
    "found_variation",
    "form.variations_form",
    function (event, variation) {
      const wrapper = $(".th-offer-wrapper");

      if (!wrapper.length) {
        return;
      }

      let basePrice = variation.display_price;

      /* USE REGULAR PRICE */

      if (variation.display_regular_price > variation.display_price) {
        basePrice = variation.display_regular_price;
      }

      wrapper.attr("data-base", basePrice).data("base", basePrice);

      updateUI();
    },
  );
  function isVariationSelected() {
    const form = $("form.variations_form");

    if (!form.length) {
      return true;
    }

    let selected = true;

    form.find("select").each(function () {
      if (!$(this).val()) {
        selected = false;
      }
    });

    return selected;
  }
  /* =====================================================
   RESET
===================================================== */

  $(document).on("reset_data", "form.variations_form", function () {
    const wrapper = $(".th-offer-wrapper");

    if (!wrapper.length) {
      return;
    }

    const original = wrapper.attr("data-original");

    wrapper.attr("data-base", original).data("base", original);

    updateUI();
  });
});
