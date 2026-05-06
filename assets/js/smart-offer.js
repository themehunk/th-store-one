jQuery(function ($) {

    function updateUI() {

    const wrapper = $(".th-offer-wrapper");

    const selected = $("input[name='th_offer_select']:checked");

    /* =====================================================
       NO SELECTION
    ===================================================== */

    if (!selected.length) {

        wrapper.find(".th-price").html("");

        $(".single_add_to_cart_button").text(
            "Select Offer"
        );

        return;
    }

    const card = selected.closest(".th-offer-card");

    const base = parseFloat(
        wrapper.data("base")
    ) || 0;

    const qty = parseInt(
        $("input.qty").val()
    ) || 1;

    const discount = parseFloat(
        card.data("discount")
    ) || 0;

    const type = card.data("type");

    const applyOn = card.data("apply-on");

    const rewardType = card.data(
        "reward-type"
    );

    const min = parseInt(
        card.data("x")
    ) || 1;

    let final = base;

    /* =====================================================
       SAME PRODUCT DISCOUNT
    ===================================================== */

    if (
        applyOn === "same_product"
    ) {

        /* PERCENT */

        if (
            type === "discount_percent"
            && discount > 0
        ) {

            final = base - (
                base * discount / 100
            );
        }

        /* FIXED */

        if (
            type === "discount_fixed"
            && discount > 0
        ) {

            final = Math.max(
                0,
                base - discount
            );
        }
    }

    /* =====================================================
       RESET PRICES
    ===================================================== */

    wrapper.find(".th-price").html("");

    /* =====================================================
       PRICE UI
    ===================================================== */

    if (
        rewardType !== "free_product"
    ) {

        card.find(".th-price").html(

            `
            <del>
                ${base.toFixed(2)}
            </del>

            <strong>
                ${final.toFixed(2)}
            </strong>
            `
        );
    }

    /* =====================================================
       BUTTON TEXT
    ===================================================== */

    if (
        rewardType === "free_product"
    ) {

        $(".single_add_to_cart_button").text(
            "Add Offer To Cart"
        );

    } else {

        let total = final * qty;

        $(".single_add_to_cart_button").text(

            `Add to cart - ${total.toFixed(2)}`
        );
    }

    /* =====================================================
       PROGRESS
    ===================================================== */

    const percent = Math.min(
        (qty / min) * 100,
        100
    );

    card.find(".th-bar").css(
        "width",
        percent + "%"
    );

    /* =====================================================
       MESSAGE
    ===================================================== */

    updateMessage(
        card,
        qty,
        min
    );
}

    /* ================= SELECT ================= */

   $(document).on(
    "change",
    "input[name='th_offer_select']",
    function () {

        const all = $(
            "input[name='th_offer_select']"
        );

        all.not(this).prop(
            "checked",
            false
        );

        const card = $(this).closest(
            ".th-offer-card"
        );

        const min = parseInt(
            card.data("x")
        ) || 1;

        $("input.qty")
            .val(min)
            .trigger("change");

        updateUI();
    }
);

$(document).on(
    "click",
    "input[name='th_offer_select']",
    function () {

        if ($(this).data("waschecked")) {

            $(this).prop(
                "checked",
                false
            );

            $(this).data(
                "waschecked",
                false
            );

            updateUI();

            return;
        }

        $("input[name='th_offer_select']")
        .data("waschecked", false);

        $(this).data(
            "waschecked",
            true
        );
    }
);
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

        form.find(
            "input[name='th_reward'], input[name='th_rule'], input[name='th_apply_on']"
        ).remove();

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

        $("<input>", {
            type: "hidden",
            name: "th_apply_on",
            value: applyOn
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

});