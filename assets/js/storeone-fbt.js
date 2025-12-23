(function ($) {
    "use strict";

/* ===============================
 * STYLE 1 (WITH VARIATION SUPPORT)
 * =============================== */
const S1FBT_STYLE1 = {
    init() {
        this.bindEvents();
        this.initAll();
    },

    bindEvents() {

        // checkbox toggle
        $(document).on("change", ".style_1 .s1-fbt-checkbox", (e) => {
            const $wrap = $(e.target).closest(".s1-fbt-content-wrap");
            this.syncCards(e.target, $wrap);
            this.toggleCardUI($wrap);
            this.updateSelectedIds($wrap);
            this.updateTotal($wrap);
        });

        // add to cart
        $(document).on("click", ".style_1 .s1-fbt-add-button", (e) => {
            e.preventDefault();
            this.addToCart($(e.currentTarget));
        });

        // 🔥 VARIATION FOUND (MOST IMPORTANT)
        $(document).on("found_variation", ".variations_form", (e, variation) => {
            this.onVariationFound($(e.target), variation);
        });

        // reset variation
        $(document).on("reset_data", ".variations_form", (e) => {
            this.onVariationReset($(e.target));
        });
    },

    initAll() {
        $(".style_1 .s1-fbt-content-wrap").each((_, el) => {
            const $wrap = $(el);
            $wrap.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);
            this.toggleCardUI($wrap);
            this.updateSelectedIds($wrap);
            this.updateTotal($wrap);
        });

        // init WC variation forms
        $(".variations_form").each(function () {
            $(this).wc_variation_form();
        });
    },

    /* ------------------
     * VARIATION FOUND
     * ------------------ */
    onVariationFound($form, variation) {

        if (!variation || !variation.variation_id) return;

        const $wrap = $form.closest(".s1-fbt-content-wrap");
        const productId = $form.data("product_id");

        const $checkbox = $wrap.find(
            `.s1-fbt-checkbox[data-product-id="${productId}"]`
        );

        // ✅ price update
        const price = parseFloat(variation.display_price);
        $checkbox.val(price);

        // ✅ store variation info
        $checkbox
            .attr("data-variation-id", variation.variation_id)
            .attr("data-attrs", JSON.stringify(variation.attributes));

        // ✅ update price HTML
        $wrap
            .find(`.post-${productId} .s1-fbt-card-price`)
            .html(variation.price_html);

        // ✅ update image
        if (variation.image && variation.image.url) {
            $wrap
                .find(`.post-${productId} img`)
                .attr("src", variation.image.url);
        }

        // enable add button
        $wrap.find(".s1-fbt-add-button").prop("disabled", false);

        this.updateSelectedIds($wrap);
        this.updateTotal($wrap);
    },

    onVariationFound($form, variation) {

    if (!variation || !variation.variation_id) return;

    const $wrap = $form.closest(".s1-fbt-content-wrap");
    const productId = $form.data("product_id");

    const $checkbox = $wrap.find(
        `.s1-fbt-checkbox[data-product-id="${productId}"]`
    );

    /* =========================
     * 1. PRICE UPDATE (VALUE)
     * ========================= */
    const price = parseFloat(variation.display_price) || 0;
    $checkbox.val(price);

    /* =========================
     * 2. VARIATION META
     * ========================= */
    $checkbox
        .attr("data-variation-id", variation.variation_id)
        .attr("data-attrs", JSON.stringify(variation.attributes));

    /* =========================
     * 3. CARD PRICE UPDATE
     * ========================= */
    $wrap
        .find(`.post-${productId} .s1-fbt-card-price`)
        .html(variation.price_html);

    /* =========================
     * 4. 🔥 LIST PRICE UPDATE (MISSING PART)
     * ========================= */
    $wrap
        .find(
            `.s1-title-wrap .s1-fbt-checkbox[data-product-id="${productId}"]`
        )
        .closest(".s1-title-wrap")
        .find(".s1-price")
        .html(variation.price_html);

    /* =========================
     * 5. IMAGE UPDATE
     * ========================= */
    if (variation.image && variation.image.url) {
        $wrap
            .find(`.post-${productId} img`)
            .attr("src", variation.image.url);
    }

    /* =========================
     * 6. ENABLE ADD BUTTON
     * ========================= */
    $wrap.find(".s1-fbt-add-button").prop("disabled", false);

    /* =========================
     * 7. RECALCULATE
     * ========================= */
    this.updateSelectedIds($wrap);
    this.updateTotal($wrap);
},

    /* ------------------
     * IDS (VAR SAFE)
     * ------------------ */
    updateSelectedIds($wrap) {

    const ids = new Set();

    // ✅ MAIN PRODUCT (ONLY ONCE)
    const mainId = $wrap.find(".s1-fbt-add-button").data("main-id");
    if (mainId) {
        ids.add(String(mainId));
    }

    // ✅ BUNDLE PRODUCTS
    $wrap.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {

        const variationId = $(this).attr("data-variation-id");
        const productId   = $(this).data("product-id");

        // 🔥 variation priority
        ids.add(String(variationId ? variationId : productId));
    });

    // ✅ SAVE CLEAN IDS
    $wrap.find(".s1-fbt-selected-ids")
        .val(Array.from(ids).join(","));
    },
    /* ------------------
     * TOTAL
     * ------------------ */
    updateTotal($wrap) {

    // ✅ 1. IDs से count निकालो
    const idsStr = $wrap.find(".s1-fbt-selected-ids").val() || "";
    const idsArr = idsStr.split(",").filter(Boolean);

    const count = idsArr.length;

    // ✅ 2. Total price
    let total = 0;

    $wrap.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {
        const price = parseFloat($(this).val()) || 0;
        total += price;
    });

    const currency = StoreOneFBT.currency_symbol || "₹";

    // ✅ 3. Update UI
    $wrap.find(".s1-fbt-total-final-amount")
        .html(currency + total.toFixed(2));

    const labelTpl = $wrap
        .find(".s1-fbt-summary")
        .data("one-pricelabel") || "{count} items selected";

    $wrap.find(".s1-fbt-summary-count")
        .text(labelTpl.replace("{count}", count));
}
,
    /* ------------------
     * ADD TO CART
     * ------------------ */
    addToCart($btn) {

        const $wrap = $btn.closest(".s1-fbt-content-wrap");
        const ids = $wrap.find(".s1-fbt-selected-ids").val();

        if (!ids) {
            alert("Please select at least one product.");
            return;
        }

        $btn.addClass("loading");

        $.post(StoreOneFBT.ajax_url, {
            action: "storeone_fbt_add_bundle",
            nonce: StoreOneFBT.nonce,
            main_id: $btn.data("main-id"),
            selected_ids: ids.split(","),
        }).done((res) => {
            $(document.body).trigger("added_to_cart", [
                res.fragments,
                res.cart_hash,
                $btn,
            ]);
        }).always(() => {
            $btn.removeClass("loading");
        });
    }
};


    /* ===============================
 * STYLE 2 (FIXED + VARIATION SAFE)
 * =============================== */
const S1FBT_STYLE2 = {
    init() {
        this.bindEvents();
        this.initAll();
    },

    bindEvents() {

        // checkbox toggle
        $(document).on("change", ".style_2 .s1-fbt-checkbox", (e) => {
            const $box = $(e.target).closest(".s1-fbt-box.style_2");
            this.updateUI($box);
            this.updateSelectedIds($box);
            this.updateTotal($box);
        });

        // add to cart
        $(document).on("click", ".style_2 .s1-fbt-add-button", (e) => {
            e.preventDefault();
            this.addToCart($(e.currentTarget));
        });

        // 🔥 variation found
        $(document).on("found_variation", ".style_2 .variations_form", (e, variation) => {
            this.onVariationFound($(e.target), variation);
        });

        // reset variation
        $(document).on("reset_data", ".style_2 .variations_form", (e) => {
            this.onVariationReset($(e.target));
        });
    },

    initAll() {
        $(".s1-fbt-box.style_2").each((_, box) => {
            const $box = $(box);

            // init variations
            $box.find(".variations_form").each(function () {
                $(this).wc_variation_form();
            });

            $box.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);

            this.updateUI($box);
            this.updateSelectedIds($box);
            this.updateTotal($box);
        });
    },

    /* --------------------
     * UI TOGGLE
     * -------------------- */
    updateUI($box) {
        $box.find(".s1-fbt-checkbox").each(function () {
            const checked = $(this).is(":checked");
            const pid = $(this).data("product-id");

            $(this)
                .closest(".s1-title-wrap")
                .toggleClass("s1-fbt-row-disabled", !checked);

            $box
                .find(`.s1-fbt-eq-item[data-product-id="${pid}"]`)
                .toggleClass("is-inactive", !checked);
        });
    },

    /* --------------------
     * VARIATION FOUND
     * -------------------- */
   onVariationFound($form, variation) {

    if (!variation || !variation.variation_id) return;

    const $wrap = $form.closest(".s1-fbt-content-wrap");
    const productId = $form.data("product_id");

    const $checkbox = $wrap.find(
        `.s1-fbt-checkbox[data-product-id="${productId}"]`
    );

    const price = parseFloat(variation.display_price) || 0;

    /* ------------------
     * 1️⃣ checkbox data
     * ------------------ */
    $checkbox
        .val(price)
        .attr("data-variation-id", variation.variation_id)
        .attr("data-attrs", JSON.stringify(variation.attributes));

    /* ------------------
     * 2️⃣ CARD PRICE
     * ------------------ */
    $wrap
        .find(`.post-${productId} .s1-fbt-card-price`)
        .html(variation.price_html);

    /* ------------------
     * 3️⃣ ROW / TITLE PRICE 🔥 FIX
     * ------------------ */
    $wrap
        .find(`.s1-title-wrap[data-product-id="${productId}"] .s1-fbt-price`)
        .html(variation.price_html);

    /* ------------------
     * 4️⃣ IMAGE
     * ------------------ */
    if (variation.image && variation.image.url) {
        $wrap
            .find(`.post-${productId} img`)
            .attr("src", variation.image.url)
            .attr("srcset", "");
    }

    $wrap.find(".s1-fbt-add-button").prop("disabled", false);

    this.updateSelectedIds($wrap);
    this.updateTotal($wrap);
}
,


    onVariationReset($form) {

    const $wrap = $form.closest(".s1-fbt-content-wrap");
    const productId = $form.data("product_id");

    const $checkbox = $wrap.find(
        `.s1-fbt-checkbox[data-product-id="${productId}"]`
    );

    $checkbox
        .val(0)
        .removeAttr("data-variation-id")
        .removeAttr("data-attrs");

    this.updateSelectedIds($wrap);
    this.updateTotal($wrap);
}
,

    /* --------------------
     * SELECTED IDS (FIXED)
     * -------------------- */
    updateSelectedIds($box) {

        const ids = [];

        const mainId = $box.find(".s1-fbt-add-button").data("main-id");
        if (mainId) ids.push(mainId);

        $box.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {
            const variationId = $(this).attr("data-variation-id");
            const productId   = $(this).data("product-id");

            ids.push(variationId ? variationId : productId);
        });

        $box.find(".s1-fbt-selected-ids").val(ids.join(","));
    },

    /* --------------------
     * TOTAL (FIXED COUNT)
     * -------------------- */
    updateTotal($wrap) {

    let total = 0;

    // ✅ bundle items (exclude disabled main checkbox)
    const $checked = $wrap.find(".s1-fbt-checkbox:checked:not(:disabled)");

    // ✅ COUNT = bundle items + main product
    let count = $checked.length;

    const mainId = $wrap.find(".s1-fbt-add-button").data("main-id");
    if (mainId) {
        count += 1;
    }

    // ✅ TOTAL PRICE
    $checked.each(function () {
        const price = parseFloat($(this).val()) || 0;
        total += price;
    });

    const currency = StoreOneFBT.currency_symbol || "₹";

    $wrap.find(".s1-fbt-total-final-amount")
        .html(currency + total.toFixed(2));

    const labelTpl =
        $wrap.find(".s1-fbt-summary").data("one-pricelabel") ||
        "{count} items selected";

    $wrap.find(".s1-fbt-summary-count")
        .text(labelTpl.replace("{count}", count));
},
    /* --------------------
     * ADD TO CART
     * -------------------- */
    addToCart($btn) {
        const $box = $btn.closest(".s1-fbt-box.style_2");
        const ids = $box.find(".s1-fbt-selected-ids").val();

        if (!ids) {
            alert("Please select at least one product.");
            return;
        }

        $btn.addClass("loading");

        $.post(StoreOneFBT.ajax_url, {
            action: "storeone_fbt_add_bundle",
            nonce: StoreOneFBT.nonce,
            main_id: $btn.data("main-id"),
            selected_ids: ids.split(","),
        }).done((res) => {
            $(document.body).trigger("added_to_cart", [
                res.fragments,
                res.cart_hash,
                $btn,
            ]);
        }).always(() => {
            $btn.removeClass("loading");
        });
    }
};

    /* ===============================
     * STYLE 3
     * =============================== */
    const S1FBT_STYLE3 = {
        init() {
            this.bindEvents();
            this.initAll();
        },

        bindEvents() {
            $(document).on("change", ".style_3 .s1-fbt-checkbox", (e) => {
                const $box = $(e.target).closest(".s1-fbt-box.style_3");
                this.updateSelectedIds($box);
                this.updateTotal($box);
            });

            $(document).on("click", ".style_3 .s1-fbt-add-bundle", (e) => {
                e.preventDefault();
                this.addToCart($(e.currentTarget));
            });
        },

        initAll() {
            $(".s1-fbt-box.style_3").each((_, box) => {
                const $box = $(box);
                $box.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);
                this.updateSelectedIds($box);
                this.updateTotal($box);
            });
        },

        updateSelectedIds($box) {
            const ids = new Set();

            const mainId = $box.data("id");
            if (mainId) ids.add(mainId);

            $box.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {
                ids.add($(this).data("product-id"));
            });

            $box.find(".s1-fbt-selected-ids").val([...ids].join(","));
        },

        updateTotal($box) {

    // ✅ bundle checkboxes
    const $checked = $box.find(".s1-fbt-checkbox:checked:not(:disabled)");
    // ✅ bundle count
    let count = $checked.length;
    // ✅ MAIN PRODUCT ALWAYS INCLUDED
    const mainId = $box.find(".s1-fbt-add-bundle").data("main-id");
    if (mainId) {
        count += 1;
    }
    // ✅ TOTAL PRICE
    let total = 0;
    $checked.each(function () {
        const price = parseFloat($(this).val());
        if (!isNaN(price)) {
            total += price;
        }
    });

    const currency = StoreOneFBT.currency_symbol || "₹";

    $box.find(".s1-fbt-total-final-amount")
        .html(currency + total.toFixed(2));

    // ✅ LABEL
    const labelTpl =
        $box.find(".s1-fbt-total-bar").data("one-pricelabel") ||
        "{count} items selected";

    $box.find(".s1-total-label")
        .text(labelTpl.replace("{count}", count));
    },

        addToCart($btn) {
            const $box = $btn.closest(".s1-fbt-box.style_3");
            const ids = $box.find(".s1-fbt-selected-ids").val();

            if (!ids) return alert("Please select at least one product.");

            $btn.addClass("loading");

            $.post(StoreOneFBT.ajax_url, {
                action: "storeone_fbt_add_bundle",
                nonce: StoreOneFBT.nonce,
                main_id: $btn.data("main-id"),
                selected_ids: ids.split(","),
            }).done((res) => {
                $(document.body).trigger("added_to_cart", [
                    res.fragments,
                    res.cart_hash,
                    $btn,
                ]);
            }).always(() => $btn.removeClass("loading"));
        }
    };

    /* ===============================
     * INIT ALL
     * =============================== */
    $(function () {
        S1FBT_STYLE1.init();
        S1FBT_STYLE2.init();
        S1FBT_STYLE3.init();
    });

})(jQuery);
