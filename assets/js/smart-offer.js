jQuery(function ($) {
  "use strict";

  function showOffers() {
    $(".th-offer-skeleton").hide();
    $(".th-offer-wrapper").fadeIn(150);
  }

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

  function getAddToCartButton() {
    const wrapper = $(".th-offer-wrapper");
    if (!wrapper.length) return $();

    let $btn = wrapper.closest("form.cart").find(".single_add_to_cart_button");
    if (!$btn.length) {
      $btn = wrapper
        .closest(".product")
        .find(".single_add_to_cart_button")
        .first();
    }
    return $btn;
  }

  function updateUI() {
    const $button = getAddToCartButton();
    const wrapper = $(".th-offer-wrapper");
    if (!wrapper.length) return;

    const qty = parseInt($("input.qty").val(), 10) || 1;
    const selected = $("input[name='th_offer_select']:checked");

    let basePrice = parseFloat(wrapper.attr("data-base")) || 0;

    // LOOP THROUGH ALL CARDS
    $(".th-offer-card").each(function () {
      const $card = $(this);
      const ruleType = $card.data("rule-type") || "bogo";
      const rewardType = $card.data("reward-type") || "free_product";
      const discountVal = parseFloat($card.data("discount-value")) || 0;

      let cardBasePrice =
        parseFloat($card.attr("data-reward-base")) || basePrice;
      let cardMinReq = 1;

      // --- BACKUP ORIGINAL CONTENT FOR PLACEHOLDERS (Title & Badge) ---
      if (!$card.data("original-title")) {
        $card.data(
          "original-title",
          $card.find(".th-offer-title").html() || "",
        );
      }
      if (!$card.data("original-badge")) {
        $card.data("original-badge", $card.find(".th-save-badge").html() || "");
      }

      let originalTitle = $card.data("original-title");
      let originalBadge = $card.data("original-badge");

      let phDel = "",
        phPrice = "",
        phEach = "",
        phDisc = "",
        phX = "1",
        phY = "1";

      // Shortcode injection replacement mapping
      if (originalTitle) {
        let updatedTitle = originalTitle
          .replace(/\{DELPRICE\}/g, phDel)
          .replace(/\{PRICE\}/g, phPrice)
          .replace(/\{EACHPRICE\}/g, phEach)
          .replace(/\{DISCOUNT\}/g, phDisc)
          .replace(/\{XQTY\}/g, phX)
          .replace(/\{YQTY\}/g, phY);
        $card.find(".th-offer-title").html(updatedTitle);
      }

      if (originalBadge) {
        let updatedBadge = originalBadge
          .replace(/\{DELPRICE\}/g, phDel)
          .replace(/\{PRICE\}/g, phPrice)
          .replace(/\{EACHPRICE\}/g, phEach)
          .replace(/\{DISCOUNT\}/g, phDisc)
          .replace(/\{XQTY\}/g, phX)
          .replace(/\{YQTY\}/g, phY);
        $card.find(".th-save-badge").html(updatedBadge);
      }

      const percent = Math.min((qty / cardMinReq) * 100, 100);
      $card.find(".th-bar").css("width", percent + "%");
    });

    // SELECTED CARD BUTTON TOTAL (DYNAMIC CALCULATION FOR ADD TO CART)
    if (selected.length) {
      const card = selected.closest(".th-offer-card");
      const activeRuleType = card.data("rule-type") || "bogo";
      const activeRewardType = card.data("reward-type") || "free_product";
      const activeDiscountVal = parseFloat(card.data("discount-value")) || 0;

      let activeBasePrice =
        parseFloat(card.attr("data-reward-base")) || basePrice;
      let finalTotal = activeBasePrice * qty;

      if (activeRuleType === "buyxgety") {
        const xQty = parseInt(card.data("x-qty"), 10) || 1;
        const yQty = parseInt(card.data("y-qty"), 10) || 1;

        const mainPrice =
          (parseFloat(wrapper.attr("data-base")) || activeBasePrice) * qty;

        if (activeRewardType === "free_product" || activeDiscountVal === 100) {
          finalTotal = mainPrice;
        } else if (activeRewardType === "discount_percent") {
          const rewardPrice =
            activeBasePrice - (activeBasePrice * activeDiscountVal) / 100;

          finalTotal = mainPrice + rewardPrice * yQty;
        } else if (activeRewardType === "discount_fixed") {
          const rewardPrice = Math.max(0, activeBasePrice - activeDiscountVal);

          finalTotal = mainPrice + rewardPrice * yQty;
        } else if (activeRewardType === "discount_fixed_price") {
          finalTotal = mainPrice + activeDiscountVal * yQty;
        }
      } else if (activeRuleType === "dynamicoffer") {
        const applyOn = card.data("apply-on") || "regular_price";

        const regularPrice = parseFloat(card.data("reward-regular")) || 0;
        const salePrice = parseFloat(card.data("reward-sale")) || 0;

        const activeBasePrice =
          applyOn === "sale_price" && salePrice > 0 ? salePrice : regularPrice;

        const tiers = card.data("tiers") || [];
        let matchedTier = null;

        $.each(tiers, function (idx, tier) {
          const from = parseInt(tier.from_qty, 10) || 0;
          const to = tier.to_qty ? parseInt(tier.to_qty, 10) : Infinity;

          if (qty >= from && qty <= to) {
            matchedTier = tier;
            return false;
          }
        });

        if (matchedTier) {
          const val = parseFloat(matchedTier.value) || 0;
          let activeDiscount = 0;

          if (matchedTier.offer === "percent") {
            activeDiscount = activeBasePrice * (val / 100) * qty;
            finalTotal = Math.max(0, activeBasePrice * qty - activeDiscount);
          } else if (matchedTier.offer === "fixed") {
            activeDiscount = val * qty;
            finalTotal = Math.max(0, activeBasePrice * qty - activeDiscount);
          } else if (matchedTier.offer === "fixed_price") {
            finalTotal = val * qty;
          }
        } else {
          finalTotal = activeBasePrice * qty;
        }
      }

      let minQty = 1;
      if (activeRuleType === "buyxgety") {
        minQty = parseInt(card.data("x-qty"), 10) || 1;
      } else if (activeRuleType === "dynamicoffer") {
        const tiers = card.data("tiers") || [];
        minQty = tiers.length ? parseInt(tiers[0].from_qty, 10) : 1;
      }

      if (qty < minQty) {
        finalTotal = finalTotal;
      }

      syncHiddenFields(selected.val(), selected.data("rule"), activeRuleType);

      if ($button.length) {
        $button.text(`Add to Cart • ${formatPrice(finalTotal)}`);
      }
    }
  }

  function syncHiddenFields(rewardVal, ruleVal, typeVal) {
    const form = $("form.cart");
    if (!form.length) return;
    form
      .find(
        "input[name='th_reward'], input[name='th_rule'], input[name='th_rule_type']",
      )
      .remove();
    $("<input>")
      .attr({ type: "hidden", name: "th_reward", value: rewardVal })
      .appendTo(form);
    $("<input>")
      .attr({ type: "hidden", name: "th_rule", value: ruleVal })
      .appendTo(form);
    $("<input>")
      .attr({ type: "hidden", name: "th_rule_type", value: typeVal })
      .appendTo(form);
  }

  $(document).on("click", ".th-offer-card", function (e) {
    if ($(e.target).is("input[type='radio'], input[type='checkbox']")) {
      updateUI();
      return;
    }

    e.preventDefault();

    const card = $(this);
    const input = card.find("input[name='th_offer_select']");

    if (input.is(":checked")) {
      input.prop("checked", false);
      card.removeClass("offer_select th-card-active");
    } else {
      $("input[name='th_offer_select']").prop("checked", false);
      $(".th-offer-card").removeClass("offer_select th-card-active");
      input.prop("checked", true);
      card.addClass("offer_select th-card-active");
      let minQty = 1;
      if (card.data("rule-type") === "buyxgety") {
        minQty = parseInt(card.data("x-qty"), 10) || 1;
      } else if (card.data("rule-type") === "dynamicoffer") {
        // const tiers = card.data("tiers") || [];
        // minQty = tiers.length ? parseInt(tiers[0].from_qty, 10) : 1;
        const trigger = card.data("price-fixed-trigger") || "interval_price";
        const tiers = card.data("tiers") || [];

        if (tiers.length) {
          if (trigger === "fixed_unit_price") {
            minQty = parseInt(tiers[0].to_qty, 10) || 1;
          } else {
            minQty = parseInt(tiers[0].from_qty, 10) || 1;
          }
        }
      }
      $("input.qty").val(minQty).trigger("change");
    }

    updateUI();
  });

  $(document).on("change", "input[name='th_offer_select']", updateUI);
  $(document).on("change keyup", "input.qty", updateUI);

  setTimeout(() => {
    $("input[name='th_offer_select']:checked")
      .closest(".th-offer-card")
      .addClass("offer_select th-card-active");
    updateUI();
    showOffers();
  }, 400);
});
