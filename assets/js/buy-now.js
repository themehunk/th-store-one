jQuery(function ($) {

  $(".th-buy-now-form").on("submit", function () {
    const btn = $(this).find("button");
    btn.addClass("loading").text("Processing...");
  });

  // for single variation
  const $form = $("form.variations_form");

  if (!$form.length) return;

  const $btn = $(".th-buy-now-single");

  // initially disabled
  $btn.prop("disabled", true).addClass("disabled");

  // when variation found
  $form.on("found_variation", function () {
    $btn.prop("disabled", false).removeClass("disabled");
  });

  // when reset variation
  $form.on("reset_data", function () {
    $btn.prop("disabled", true).addClass("disabled");
  });

  // click buy now
  $btn.on("click", function (e) {
    e.preventDefault();

    const variation_id = $form.find("input.variation_id").val();

    if (!variation_id) {
      alert("Please select product options");
      return;
    }

    // add buy now flag
    if (!$form.find("input[name='th_buy_now']").length) {
      $form.append('<input type="hidden" name="th_buy_now" value="1">');
    }

    // submit WooCommerce form
    $form.trigger("submit");
  });

});