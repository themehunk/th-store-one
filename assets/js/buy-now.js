// jQuery(function ($) {
//   /* ===================================
//    * ARCHIVE / SIMPLE BUY NOW
//    * =================================== */

//   $(document).on("submit", ".th-buy-now-form", function () {
//     const form = $(this);

//     const btn = form.find("button");

//     btn.addClass("loading").text("Processing...");

//     /*
//      * SIMPLE PRODUCT QTY SYNC
//      */

//     const realQty = $("form.cart input.qty").val();

//     if (realQty) {
//       form.find("input[name='quantity']").val(realQty);
//     }
//   });

//   /* ===================================
//    * VARIABLE PRODUCTS
//    * =================================== */

//   const $form = $("form.variations_form");

//   if (!$form.length) {
//     return;
//   }

//   const $btn = $(".th-buy-now-single");

//   /* init */

//   $btn.prop("disabled", true).addClass("disabled");

//   /* variation found */

//   $form.on("found_variation", function () {
//     $btn.prop("disabled", false).removeClass("disabled");
//   });

//   /* variation reset */

//   $form.on("reset_data hide_variation", function () {
//     $btn.prop("disabled", true).addClass("disabled");
//   });

//   /* buy now click */

//   $btn.on("click", function (e) {
//     e.preventDefault();

//     const variation_id = parseInt(
//       $form.find("input[name='variation_id']").val(),
//       10,
//     );

//     if (!variation_id || variation_id <= 0) {
//       alert("Please select product options");

//       return;
//     }

//     /* remove old */

//     $form.find(".th-buy-now-hidden").remove();

//     /* buy now flag */

//     $("<input>", {
//       type: "hidden",
//       class: "th-buy-now-hidden",
//       name: "th_buy_now",
//       value: "1",
//     }).appendTo($form);

//     /* runtime qty */

//     let qty = parseInt($form.find("input.qty").val(), 10);

//     if (isNaN(qty) || qty < 1) {
//       qty = 1;
//     }

//     $form.find("input.qty").val(qty);

//     /* loading */

//     $btn.addClass("loading").text("Processing...");

//     /* submit */

//     $form.trigger("submit");
//   });
// });

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

    $btn.on("click", function (e) {
      e.preventDefault();

      const variation_id = parseInt(
        $form.find("input[name='variation_id']").val(),
        10,
      );

      if (!variation_id || variation_id <= 0) {
        return;
      }

      /* Remove old hidden fields */
      $form.find(".th-buy-now-hidden, .th-offer-hidden").remove();

      /* Buy Now Flag */
      $("<input>", {
        type: "hidden",
        class: "th-buy-now-hidden",
        name: "th_buy_now",
        value: "1",
      }).appendTo($form);

      /* ============== SMART OFFER COMPATIBILITY ============== */
      copySmartOfferDataToForm($form);

      /* Submit main form */
      $form.trigger("submit");
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
