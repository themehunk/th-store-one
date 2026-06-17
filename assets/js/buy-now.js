jQuery(function ($) {
  /* ===================================
   * ARCHIVE / SIMPLE BUY NOW
   * =================================== */
  $(document).on("submit", ".th-buy-now-form", function (e) {
    const form = $(this);
    const btn = form.find("button");

    btn.addClass("loading").text("Processing...");

    /* Sync real quantity */
    const realQty = $("form.cart input.qty").val();
    if (realQty) {
      form.find("input[name='quantity']").val(realQty);
    }

    /* ============== SMART OFFER COMPATIBILITY ============== */
    copySmartOfferDataToForm(form);
  });

  /* ===================================
   * VARIABLE PRODUCTS BUY NOW
   * =================================== */
  const $form = $("form.variations_form");

  if ($form.length) {
    const $btn = $(".th-buy-now-single");

    $btn.prop("disabled", true).addClass("disabled");

    $form.on("found_variation", function () {
      $btn.prop("disabled", false).removeClass("disabled");
    });

    $form.on("reset_data hide_variation", function () {
      $btn.prop("disabled", true).addClass("disabled");
    });

    $(document).on("click", ".th-buy-now-single", function (e) {
      e.preventDefault();

      const $btn = $(this);

      const variation_id = parseInt(
        $form.find("input[name='variation_id']").val(),
        10,
      );

      if (!variation_id || variation_id <= 0) {
        //alert("Please select product options");
        return;
      }

      /* Loading State */
      const originalText = $btn.text();

      $btn.addClass("loading").prop("disabled", true).text("Processing...");

      /* Remove old hidden fields */
      $form
        .find(
          ".th-buy-now-hidden, .th-offer-hidden, input[name='th_buy_now_nonce']",
        )
        .remove();

      /* Buy Now Flag */
      $("<input>", {
        type: "hidden",
        class: "th-buy-now-hidden",
        name: "th_buy_now",
        value: "1",
      }).appendTo($form);

      /* Nonce */
      $("<input>", {
        type: "hidden",
        name: "th_buy_now_nonce",
        value: thBuyNow.nonce,
      }).appendTo($form);

      /* Smart Offer */
      copySmartOfferDataToForm($form);

      /* Give browser time to repaint button */
      setTimeout(function () {
        $form.get(0).submit();
      }, 50);

      /* Fallback */
      setTimeout(function () {
        $btn.removeClass("loading").prop("disabled", false).text(originalText);
      }, 5000);
    });
  }

  /* ===================== HELPER FUNCTION ===================== */
  function copySmartOfferDataToForm(targetForm) {
    const selectedOffer = $("input[name='th_offer_select']:checked");

    if (!selectedOffer.length) return;

    const card = selectedOffer.closest(".th-offer-card");

    // Remove previous offer fields
    targetForm
      .find(
        "input[name='th_reward'], input[name='th_rule'], input[name='th_apply_on']",
      )
      .remove();

    // Add offer data
    $("<input>", {
      type: "hidden",
      name: "th_reward",
      value: selectedOffer.val(),
    }).appendTo(targetForm);

    $("<input>", {
      type: "hidden",
      name: "th_rule",
      value: selectedOffer.data("rule"),
    }).appendTo(targetForm);

    $("<input>", {
      type: "hidden",
      name: "th_apply_on",
      value: card.data("apply-on"),
    }).appendTo(targetForm);
  }
});
