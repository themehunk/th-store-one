jQuery(function ($) {

    function updateUI() {

        const selected = $("input[name='th_offer_select']:checked");
        if (!selected.length) return;

        const card = selected.closest(".th-offer-card");
        const wrapper = card.closest(".th-offer-wrapper");

        const base = parseFloat(wrapper.data("base")) || 0;
        const qty = parseInt($("input.qty").val()) || 1;

        const discount = parseFloat(card.data("discount")) || 0;
        const type = card.data("type");
        const min = parseInt(card.data("x")) || 1;

        let final = base;

        //discount logic safe
        if (type === "discount_percent" && discount > 0) {
            final = base - (base * discount / 100);
        }

        if (type === "discount_fixed" && discount > 0) {
            final = base - discount;
        }

        // reset only inside wrapper (safe)
        wrapper.find(".th-price").html("");

        // update selected only
        card.find(".th-price").html(
            `<del>${base.toFixed(2)}</del> <strong>${final.toFixed(2)}</strong>`
        );

        $(".single_add_to_cart_button").text(
            `Add to cart - ${ (final * qty).toFixed(2) }`
        );

        //progress safe
        const percent = Math.min((qty / min) * 100, 100);
        card.find(".th-bar").css("width", percent + "%");

        updateMessage(card, qty, min);
    }

    /* ================= SELECT ================= */

    $(document).on("change", "input[name='th_offer_select']", function () {

        const all = $("input[name='th_offer_select']");
        all.not(this).prop("checked", false);

        const card = $(this).closest(".th-offer-card");
        const min = parseInt(card.data("x")) || 1;

        $("input.qty").val(min).trigger("change");

        updateUI();
    });

    /* ================= QTY ================= */

    $(document).on("change keyup", "input.qty", function () {
        updateUI();
    });

    /* ================= SUBMIT ================= */

    $(document).on("submit", "form.cart", function () {

        const selected = $("input[name='th_offer_select']:checked");
        if (!selected.length) return;

        const reward = selected.val();
        const rule = selected.data("rule");

        const form = $(this);

        //remove old hidden fields (important fix)
        form.find("input[name='th_reward'], input[name='th_rule']").remove();

        $("<input>", {
            type: "hidden",
            name: "th_reward",
            value: reward
        }).appendTo(form);

        $("<input>", {
            type: "hidden",
            name: "th_rule",
            value: rule
        }).appendTo(form);
    });

    /* ================= INIT (AUTO RUN) ================= */

    setTimeout(() => {
        const first = $("input[name='th_offer_select']:checked");
        if (first.length) {
            updateUI();
        }
    }, 200);

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

    function updateMessage(card, qty, min) {

    const msgTemplate = card.data("msg") || "";
    const successMsg = card.data("success") || "";
    const msgBox = card.find(".th-msg");

    if (qty < min) {

        const remaining = min - qty;

        //replace {remaining}
        const msg = msgTemplate.replace("{remaining}", remaining);

        msgBox.html(msg);

    } else {

        msgBox.html(successMsg);
    }
}

});