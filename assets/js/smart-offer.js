jQuery(function ($) {
  "use strict";

  /* =====================================================
       HELPERS
    ===================================================== */

  function formatPrice(price) {
    price = parseFloat(price || 0);

    const decimals = parseInt(thSmartOffer.decimals, 10) || 2;

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

  function isVariationSelected() {
    const form = $("form.variations_form");

    if (!form.length) {
      return true;
    }

    let selected = true;

    form.find("select").each(function () {
      if (!$(this).val()) {
        selected = false;

        return false;
      }
    });

    return selected;
  }

  function getSelectedCard() {
    const selected = $("input[name='th_offer_select']:checked");

    if (!selected.length) {
      return null;
    }

    return selected.closest(".th-offer-card");
  }

  function updateMessage(card, qty, min) {
    if (!card || !card.length) {
      return;
    }

    const msgTemplate = card.data("msg") || "";

    const successMsg = card.data("success") || "";

    const msgBox = card.find(".th-msg");

    if (!msgBox.length) {
      return;
    }

    if (qty < min) {
      const remaining = min - qty;

      msgBox.html(msgTemplate.replace("{remaining}", remaining));
    } else {
      msgBox.html(successMsg);
    }
  }

  /* =====================================================
       MAIN UI
    ===================================================== */

  function updateUI() {
    const preorderText =
      typeof thPreorder !== "undefined" && thPreorder.enabled
        ? thPreorder.text
        : thSmartOffer.add_to_cart_text || "Add to Cart";

    const wrapper = $(".th-offer-wrapper");

    if (!wrapper.length) {
      $(".single_add_to_cart_button").text(preorderText);

      return;
    }

    const selected = $("input[name='th_offer_select']:checked");

    wrapper.find(".th-price").html("");

    /* =====================================================
           NO OFFER
        ===================================================== */

    if (!selected.length) {
      $(".single_add_to_cart_button").text(
        thSmartOffer.add_to_cart_text || "Add to cart",
      );

      return;
    }

    const card = selected.closest(".th-offer-card");

    if (!card.length) {
      return;
    }

    /* =====================================================
           VARIABLE VALIDATION
        ===================================================== */

    const hasVariations = $("form.variations_form").length;

    if (hasVariations && !isVariationSelected()) {
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
           DATA
        ===================================================== */

    const base = parseFloat(wrapper.attr("data-base")) || 0;

    const qty = parseInt($("input.qty").val(), 10) || 1;

    const discount = parseFloat(card.data("discount")) || 0;

    const rewardType = card.data("reward-type");

    const applyOn = card.data("apply-on");

    const min = parseInt(card.data("x"), 10) || 1;

    const getQty = parseInt(card.data("y"), 10) || 1;

    const times = Math.max(1, Math.floor(qty / min));

    let finalSingle = base;

    let total = base * qty;

    let totalDiscount = 0;

    /* =====================================================
           DISCOUNT LOGIC
        ===================================================== */

    if (applyOn === "same_product") {
      /* ================= PERCENT ================= */

      if (rewardType === "discount_percent") {
        const rewardItems = times * getQty;

        const singleDiscount = (base * discount) / 100;

        totalDiscount = singleDiscount * rewardItems;
      }

      /* ================= FIXED ================= */

      if (rewardType === "discount_fixed") {
        const rewardItems = times * getQty;

        totalDiscount = discount * rewardItems;
      }

      /* ================= FIXED CART ================= */

      if (rewardType === "discount_fixed_cart") {
        totalDiscount = discount * times;
      }
    }

    totalDiscount = Math.min(totalDiscount, total);

    const final = Math.max(0, total - totalDiscount);

    finalSingle = qty > 0 ? final / qty : final;

    /* =====================================================
           PRICE UI
        ===================================================== */

    if (rewardType !== "free_product") {
      const hasDiscount = parseFloat(final) < parseFloat(total);

      let html = `
                <div class="th-price-wrap">
            `;

      if (hasDiscount) {
        html += `
                    <del class="th-old-price">
                        ${formatPrice(total)}
                    </del>
                `;
      }

      html += `
                <strong class="th-new-price">
                    ${formatPrice(final)}
                </strong>
            `;

      if (hasDiscount) {
        html += `
                    <small class="th-save-price">
                        Save ${formatPrice(totalDiscount)}
                    </small>
                `;
      }

      html += `
                </div>
            `;

      card.find(".th-price").html(html);
    }

    /* =====================================================
           BUTTON TEXT
        ===================================================== */

    if (rewardType === "free_product") {
      $(".single_add_to_cart_button").text("Add Offer To Cart");
    } else {
      $(".single_add_to_cart_button").text(
        `${preorderText} • ${formatPrice(final)}`,
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

  /* =====================================================
       OFFER SELECT
    ===================================================== */

  $(document).on("change", "input[name='th_offer_select']", function () {
    const current = $(this);

    const card = current.closest(".th-offer-card");

    $(".th-offer-card").removeClass("offer_select");

    $("input[name='th_offer_select']")
      .not(current)
      .prop("checked", false)
      .data("waschecked", false);

    if (current.is(":checked")) {
      current.data("waschecked", true);

      card.addClass("offer_select");

      const min = parseInt(card.data("x"), 10) || 1;

      const qtyField = $("input.qty");

      const currentQty = parseInt(qtyField.val(), 10) || 1;

      if (currentQty < min) {
        qtyField.val(min).trigger("change");
      }
    }

    updateUI();
  });

  /* =====================================================
   OFFER TOGGLE SELECT
===================================================== */

  $(document).on("click", ".th-offer-card", function (e) {
    const card = $(this);

    const input = card.find("input[name='th_offer_select']");

    /* PREVENT LABEL/RADIO DEFAULT */

    e.preventDefault();

    /* ================= DESELECT ================= */

    if (input.is(":checked")) {
      input.prop("checked", false);

      card.removeClass("offer_select");

      $(".single_add_to_cart_button").text(
        thSmartOffer.add_to_cart_text || "Add to cart",
      );

      $(".th-price").html("");

      updateUI();

      return;
    }

    /* ================= RESET ================= */

    $("input[name='th_offer_select']").prop("checked", false);

    $(".th-offer-card").removeClass("offer_select");

    /* ================= SELECT ================= */

    input.prop("checked", true);

    card.addClass("offer_select");

    /* ================= AUTO QTY ================= */

    const min = parseInt(card.data("x"), 10) || 1;

    const qtyField = $("input.qty");

    const currentQty = parseInt(qtyField.val(), 10) || 1;

    if (currentQty < min) {
      qtyField.val(min).trigger("change");
    }

    updateUI();
  });

  /* =====================================================
       QTY
    ===================================================== */

  $(document).on("change keyup", "input.qty", function () {
    updateUI();
  });

  /* =====================================================
       FORM SUBMIT
    ===================================================== */

  $(document).on("submit", "form.cart", function () {
    const selected = $("input[name='th_offer_select']:checked");

    if (!selected.length) {
      return;
    }

    const card = selected.closest(".th-offer-card");

    const form = $(this);

    form
      .find(
        "input[name='th_reward'], " +
          "input[name='th_rule'], " +
          "input[name='th_apply_on']",
      )
      .remove();

    $("<input>", {
      type: "hidden",
      name: "th_reward",
      value: selected.val(),
    }).appendTo(form);

    $("<input>", {
      type: "hidden",
      name: "th_rule",
      value: selected.data("rule"),
    }).appendTo(form);

    $("<input>", {
      type: "hidden",
      name: "th_apply_on",
      value: card.data("apply-on"),
    }).appendTo(form);
  });

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

      const basePrice = parseFloat(variation.display_price) || 0;

      wrapper.attr("data-base", basePrice).data("base", basePrice);

      updateUI();
    },
  );

  /* =====================================================
       RESET VARIATION
    ===================================================== */

  $(document).on("reset_data", "form.variations_form", function () {
    const wrapper = $(".th-offer-wrapper");

    if (!wrapper.length) {
      return;
    }

    const original = parseFloat(wrapper.attr("data-original")) || 0;

    wrapper.attr("data-base", original).data("base", original);

    updateUI();
  });

  /* =====================================================
       CART PROGRESS
    ===================================================== */

  function updateCartOffer() {
    let totalQty = 0;

    $(".cart_item").each(function () {
      const qty = parseInt($(this).find(".qty").val(), 10) || 0;

      totalQty += qty;
    });

    $(".th-offer-cart").each(function () {
      const x = parseInt($(this).data("x"), 10) || 1;

      const percent = Math.min((totalQty / x) * 100, 100);

      $(this)
        .find(".th-bar")
        .css("width", percent + "%");
    });
  }

  $(document).on("change", ".cart_item .qty", function () {
    setTimeout(updateCartOffer, 300);
  });

  /* =====================================================
       INIT
    ===================================================== */

  setTimeout(function () {
    updateUI();
    updateCartOffer();
  }, 200);
});
