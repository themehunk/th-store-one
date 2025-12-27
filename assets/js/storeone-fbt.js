(function ($) {
    "use strict";

/* ===============================
 * STYLE 1 — MULTI-BUNDLE SAFE (FULL)
 * =============================== */
const S1FBT_STYLE1 = {

    /* ------------------
     * INIT
     * ------------------ */
    init() {
        const self = this;

        $(".s1-fbt-box.style_1").each(function () {
            self.initBundle($(this));
        });
    },

    /* ------------------
     * INIT PER BUNDLE
     * ------------------ */
    initBundle($bundle) {

        const $wrap = $bundle.find(".s1-fbt-content-wrap");

        /* ------------------
         * CHECKBOX CHANGE
         * ------------------ */
        $bundle.on("change", ".s1-fbt-checkbox", (e) => {
            this.syncCheckboxes(e.target, $wrap);
            this.toggleCardUI($wrap);
            this.updateSelectedIds($wrap);
            this.updateTotal($wrap);
            
        });

        /* ------------------
         * ADD TO CART
         * ------------------ */
        $bundle.on("click", ".s1-fbt-add-button", (e) => {
            e.preventDefault();
            this.addToCart($(e.currentTarget), $bundle);
        });

        /* ------------------
         * VARIATION FOUND
         * ------------------ */
        $bundle.on(
            "found_variation",
            ".variations_form",
            (e, variation) => {
                this.onVariationFound(
                    $(e.currentTarget),
                    variation,
                    $bundle
                );
            }
        );

        /* ------------------
         * VARIATION RESET
         * ------------------ */
        $bundle.on(
            "reset_data",
            ".variations_form",
            (e) => {
                this.onVariationReset(
                    $(e.currentTarget),
                    $bundle
                );
            }
        );

        /* ------------------
         * INIT VARIATIONS (ONLY INSIDE THIS BUNDLE)
         * ------------------ */
        $bundle.find(".variations_form").each(function () {
            $(this).wc_variation_form();
        });

        /* ------------------
         * INITIAL STATE
         * ------------------ */
        $wrap.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);

        this.toggleCardUI($wrap);
        this.updateSelectedIds($wrap);
        this.updateTotal($wrap);
    },

    /* ------------------
     * CHECKBOX SYNC
     * ------------------ */
    syncCheckboxes(checkbox, $wrap) {

        const productId = $(checkbox).data("product-id");
        const checked = checkbox.checked;

        $wrap
            .find(`.s1-fbt-checkbox[data-product-id="${productId}"]`)
            .prop("checked", checked);

        $wrap
            .find(`.post-${productId}`)
            .toggleClass("is-disabled", !checked);
    },

    /* ------------------
     * CARD UI
     * ------------------ */
    toggleCardUI($wrap) {

        $wrap.find(".s1-fbt-checkbox").each(function () {

            const productId = $(this).data("product-id");
            const checked = $(this).is(":checked");

            $wrap
                .find(`.post-${productId}`)
                .toggleClass("is-disabled", !checked);
        });
    },

    /* ------------------
    * VARIATION FOUND (FINAL & STABLE)
    * ------------------ */
    onVariationFound($form, variation, $bundle) {

    if (!variation || !variation.variation_id) return;

    /* ✅ Parent product id (ALWAYS) */
    const parentId = parseInt($form.data("product_id"), 10);
    
    if (!parentId) return;

    const $wrap = $bundle.find(".s1-fbt-content-wrap");

    /* ✅ Only checkboxes of this parent */
    const $checkboxes = $wrap.find(
        `.s1-fbt-checkbox[data-product-id="${parentId}"]`
    );

    if (!$checkboxes.length) {
        console.warn("FBT: no checkbox for parent", parentId);
        return;
    }

    const price = parseFloat(variation.display_price) || 0;

    /* ------------------
     * UPDATE CHECKBOX META
     * ------------------ */
    $checkboxes.each(function () {

        const $cb = $(this);

        // 🔒 hard safety (kabhi galat id na rahe)
        $cb
            .attr("data-product-id", parentId)
            .data("product-id", parentId);

        // ✅ THIS IS THE MOST IMPORTANT PART
        $cb
            .attr("data-variation-id", variation.variation_id)
            .attr("data-attrs", JSON.stringify(variation.attributes))
            .val(price);
    });

    /* ------------------
     * CARD PRICE
     * ------------------ */
    const $cardPrice = $wrap.find(`.post-${parentId} .s1-fbt-card-price`);
    if ($cardPrice.length) {
        if (!$cardPrice.data("original-html")) {
            $cardPrice.data("original-html", $cardPrice.html());
        }
        $cardPrice.html(variation.price_html);
    }

    /* ------------------
     * LIST PRICE
     * ------------------ */
    const $row = $wrap
        .find(".s1-title-wrap.s1-fbt-row")
        .has(`.s1-fbt-checkbox[data-product-id="${parentId}"]`);

    const $priceHtml = $row.find(".s1-price-html");
    if ($priceHtml.length) {
        if (!$priceHtml.data("original-html")) {
            $priceHtml.data("original-html", $priceHtml.html());
        }
        $priceHtml.html(variation.price_html);
    }

    /* ------------------
     * IMAGE
     * ------------------ */
    const $img = $wrap.find(`.post-${parentId} img`);
    if ($img.length && variation.image?.url) {

        if (!$img.data("original-src")) {
            $img
                .data("original-src", $img.attr("src"))
                .data("original-srcset", $img.attr("srcset"));
        }

        $img
            .attr("src", variation.image.url)
            .attr("srcset", variation.image.srcset || "");
    }

    /* ------------------
     * FINAL RECALC
     * ------------------ */
    this.updateSelectedIds($wrap);
    this.updateTotal($wrap);
}
,
    /* ------------------
     * VARIATION RESET
     * ------------------ */
    onVariationReset($form, $bundle) {

        const productId = $form.data("product_id");
        const $wrap = $bundle.find(".s1-fbt-content-wrap");

        $wrap
            .find(`.s1-fbt-checkbox[data-product-id="${productId}"]`)
            .removeAttr("data-variation-id")
            .removeAttr("data-attrs")
            .val(0);

        /* CARD PRICE */
        const $cardPrice = $wrap.find(`.post-${productId} .s1-fbt-card-price`);
        if ($cardPrice.data("original-html")) {
            $cardPrice.html($cardPrice.data("original-html"));
        }

        /* LIST PRICE */
        const $row = $wrap
            .find(".s1-title-wrap.s1-fbt-row")
            .has(`.s1-fbt-checkbox[data-product-id="${productId}"]`);

        const $priceHtml = $row.find(".s1-price-html");
        if ($priceHtml.data("original-html")) {
            $priceHtml.html($priceHtml.data("original-html"));
        }

        /* IMAGE */
        const $img = $wrap.find(`.post-${productId} img`);
        if ($img.data("original-src")) {
            $img
                .attr("src", $img.data("original-src"))
                .attr("srcset", $img.data("original-srcset") || "");
        }

        this.updateSelectedIds($wrap);
        this.updateTotal($wrap);
    },

    /* ------------------
     * IDS
     * ------------------ */
    updateSelectedIds($wrap) {

        const ids = new Set();

        const mainId = $wrap
            .find(".s1-fbt-add-button")
            .data("main-id");

        if (mainId) ids.add(String(mainId));

        $wrap.find(".s1-fbt-checkbox:checked:not(:disabled)")
            .each(function () {

                const vid = $(this).attr("data-variation-id");
                const pid = $(this).data("product-id");

                ids.add(String(vid ? vid : pid));
            });

        $wrap.find(".s1-fbt-selected-ids")
            .val(Array.from(ids).join(","));
    },

    /* ------------------
     * TOTAL
     * ------------------ */
    updateTotal($wrap) {

        let total = 0;

        $wrap.find(".s1-fbt-checkbox:not(.s1-fbt-card-checkbox):checked:not(:disabled)")
            .each(function () {
                total += parseFloat($(this).val()) || 0;
            });

        const currency = StoreOneFBT.currency_symbol || "₹";

        $wrap.find(".s1-fbt-total-final-amount")
            .html(currency + total.toFixed(2));

        const count = ($wrap.find(".s1-fbt-selected-ids").val() || "")
            .split(",")
            .filter(Boolean).length;

        const labelTpl =
            $wrap.find(".s1-fbt-summary").data("one-pricelabel")
            || "{count} items selected";

        $wrap.find(".s1-fbt-summary-count")
            .text(labelTpl.replace("{count}", count));
    },

    addToCart($btn, $bundle) {

    const $wrap = $bundle.find(".s1-fbt-content-wrap");
    const items = [];

    $wrap.find(".s1-fbt-checkbox:not(.s1-fbt-card-checkbox):checked:not(:disabled)")
        .each(function () {

            const pid   = $(this).data("product-id");
            const vid   = $(this).attr("data-variation-id");
            const attrs = $(this).attr("data-attrs");

            // ⛔ variable product but variation not selected
            if ($(this).closest(".s1-fbt-row").find(".variations_form").length && !vid) {
                return;
            }

            if (vid) {
                items.push({
                    product_id: pid,
                    variation_id: vid,
                    variation: attrs ? JSON.parse(attrs) : {}
                });
            } else {
                items.push({ product_id: pid });
            }
        });

    if (!items.length) {
        alert("Please select variation first");
        return;
    }


    $btn.addClass("loading");

    $.post(StoreOneFBT.ajax_url, {
        action: "storeone_fbt_add_bundle",
        nonce: StoreOneFBT.nonce,
        items: items
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
 * STYLE 2 — FINAL STABLE
 * =============================== */
const S1FBT_STYLE2 = {

    init() {
        this.initAll();
        this.bindEvents();
    },

    /* ------------------
     * INIT
     * ------------------ */
    initAll() {
        $(".s1-fbt-box.style_2").each((_, box) => {
            const $box = $(box);

            // init variations inside this box
            $box.find(".variations_form").each(function () {
                $(this).wc_variation_form();
            });

            // default checked
            $box.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);

            this.updateUI($box);
            this.updateSelectedIds($box);
            this.updateTotal($box);
        });
    },

    /* ------------------
     * EVENTS
     * ------------------ */
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

        // variation found
        $(document).on(
            "found_variation",
            ".style_2 .variations_form",
            (e, variation) => {
                this.onVariationFound($(e.currentTarget), variation);
            }
        );

        // variation reset
        $(document).on(
            "reset_data",
            ".style_2 .variations_form",
            (e) => {
                this.onVariationReset($(e.currentTarget));
            }
        );
    },

    /* ------------------
     * UI TOGGLE
     * ------------------ */
    updateUI($box) {

        $box.find(".s1-fbt-checkbox").each(function () {

            const checked = this.checked;
            const pid = $(this).data("product-id");

            // row disable
            $(this)
                .closest(".s1-title-wrap")
                .toggleClass("s1-fbt-row-disabled", !checked);

            // equation image disable
            $box
                .find(`.s1-fbt-eq-item[data-product-id="${pid}"]`)
                .toggleClass("is-inactive", !checked);
        });
    },

    /* ------------------
     * VARIATION FOUND
     * ------------------ */
    onVariationFound($form, variation) {

        if (!variation || !variation.variation_id) return;

        const $box = $form.closest(".s1-fbt-box.style_2");
        const productId = parseInt($form.data("product_id"), 10);

        const $checkbox = $box.find(
            `.s1-fbt-checkbox[data-product-id="${productId}"]`
        );

        if (!$checkbox.length) return;

        const price = parseFloat(variation.display_price) || 0;

        // checkbox meta
        $checkbox
            .val(price)
            .attr("data-variation-id", variation.variation_id)
            .attr("data-attrs", JSON.stringify(variation.attributes));

        // price text (same span where price_html is)
        $box
            .find(`.s1-title-wrap .s1-fbt-checkbox[data-product-id="${productId}"]`)
            .closest(".s1-title-wrap")
            .find(".s1-price")
            .html(variation.price_html);

        // image
        if (variation.image?.url) {
            $box
                .find(`.s1-fbt-eq-item[data-product-id="${productId}"] img`)
                .attr("src", variation.image.url);
        }

        this.updateSelectedIds($box);
        this.updateTotal($box);
    },

    /* ------------------
     * VARIATION RESET
     * ------------------ */
    onVariationReset($form) {

        const $box = $form.closest(".s1-fbt-box.style_2");
        const productId = parseInt($form.data("product_id"), 10);

        const $checkbox = $box.find(
            `.s1-fbt-checkbox[data-product-id="${productId}"]`
        );

        $checkbox
            .val(0)
            .removeAttr("data-variation-id")
            .removeAttr("data-attrs");

        this.updateSelectedIds($box);
        this.updateTotal($box);
    },

    /* ------------------
     * IDS
     * ------------------ */
    updateSelectedIds($box) {

        const ids = new Set();

        const mainId = $box.find(".s1-fbt-add-button").data("main-id");
        if (mainId) ids.add(String(mainId));

        $box.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {

            const vid = $(this).attr("data-variation-id");
            const pid = $(this).data("product-id");

            ids.add(String(vid ? vid : pid));
        });

        $box.find(".s1-fbt-selected-ids")
            .val(Array.from(ids).join(","));
    },

    /* ------------------
     * TOTAL
     * ------------------ */
    updateTotal($box) {

    const $totalBox = $box.find(".s1-fbt-total-box");

    // ✅ BASE PRICE (main product)
    let total = parseFloat($totalBox.data("base-price")) || 0;

    // ✅ ADD-ON PRODUCTS (checkboxes)
    $box.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {
        total += parseFloat($(this).val()) || 0;
    });

    const currency = StoreOneFBT.currency_symbol || "₹";

    // ✅ UPDATE PRICE
    $box.find(".s1-fbt-total-final-amount")
        .html(currency + total.toFixed(2));

    // ✅ COUNT (main product + addons)
    let count = 1; // main product always included

    count += $box.find(".s1-fbt-checkbox:checked:not(:disabled)").length;

    const labelTpl =
        $totalBox.data("one-pricelabel") || "{count} items selected";

    $box.find(".s1-fbt-total-title span")
        .text(labelTpl.replace("{count}", count));
},

    /* ------------------
 * ADD TO CART — STYLE 2 (FIXED)
 * ------------------ */
addToCart($btn) {

    const $box = $btn.closest(".s1-fbt-box.style_2");
    const items = [];

    /* =========================
     * 1️⃣ ADD MAIN PRODUCT (ALWAYS)
     * ========================= */
    const mainId = $btn.data("main-id");
    if (mainId) {
        items.push({ product_id: mainId });
    }

    /* =========================
     * 2️⃣ ADD BUNDLE PRODUCTS
     * ========================= */
    $box.find(".s1-fbt-checkbox:checked").each(function () {

        const pid   = $(this).data("product-id");
        const vid   = $(this).attr("data-variation-id");
        const attrs = $(this).attr("data-attrs");

        // ❌ skip main product checkbox (already added)
        if (pid == mainId) return;

        // ❌ variable product but no variation selected
        if (
            $(this)
                .closest(".s1-title-wrap")
                .find(".variations_form").length &&
            !vid
        ) {
            return;
        }

        if (vid) {
            items.push({
                product_id: pid,
                variation_id: vid,
                variation: attrs ? JSON.parse(attrs) : {}
            });
        } else {
            items.push({ product_id: pid });
        }
    });

    if (!items.length) {
       // alert("Please select variation first");
        return;
    }

    //console.log("STYLE 2 FINAL ITEMS:", items); // 🔍 debug

    $btn.addClass("loading");

    $.post(StoreOneFBT.ajax_url, {
        action: "storeone_fbt_add_bundle",
        nonce: StoreOneFBT.nonce,
        items: items
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
 * STYLE 3 — VARIATION SAFE (FINAL)
 * =============================== */
const S1FBT_STYLE3 = {

    init() {
        this.bindEvents();
        this.initAll();
    },

    bindEvents() {

        // checkbox change
        $(document).on("change", ".style_3 .s1-fbt-checkbox", (e) => {
            const $box = $(e.target).closest(".s1-fbt-box.style_3");
            this.updateSelectedIds($box);
            this.updateTotal($box);
        });

        // add to cart
        $(document).on("click", ".style_3 .s1-fbt-add-bundle", (e) => {
            e.preventDefault();
            this.addToCart($(e.currentTarget));
        });

        // 🔥 variation found
        $(document).on(
            "found_variation",
            ".style_3 .variations_form",
            (e, variation) => {
                this.onVariationFound($(e.target), variation);
            }
        );

        // 🔄 variation reset
        $(document).on(
            "reset_data",
            ".style_3 .variations_form",
            (e) => {
                this.onVariationReset($(e.target));
            }
        );
    },

    initAll() {
        $(".s1-fbt-box.style_3").each((_, box) => {
            const $box = $(box);

            // init variations
            $box.find(".variations_form").each(function () {
                $(this).wc_variation_form();
            });

            // default checked
            $box.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);

            this.updateSelectedIds($box);
            this.updateTotal($box);
        });
    },

    /* ------------------
     * VARIATION FOUND
     * ------------------ */
    onVariationFound($form, variation) {

    if (!variation || !variation.variation_id) return;

    const productId = parseInt($form.data("product_id"), 10);
    if (!productId) return;

    const $box = $form.closest(".s1-fbt-box.style_3");

    /* ------------------
     * CHECKBOX
     * ------------------ */
    const $checkbox = $box.find(
        `.s1-fbt-checkbox[data-product-id="${productId}"]`
    );

    const price = parseFloat(variation.display_price) || 0;

    $checkbox
        .val(price)
        .attr("data-variation-id", variation.variation_id)
        .attr("data-attrs", JSON.stringify(variation.attributes));

    /* ------------------
     * PRICE (🔥 FIX)
     * ------------------ */
    const $priceHtml = $box
        .find(".s1-fbt-flex-item")
        .has(`.s1-fbt-checkbox[data-product-id="${productId}"]`)
        .find(".s1-fbt-price-html");

    // save original once
    if (!$priceHtml.data("original-html")) {
        $priceHtml.data("original-html", $priceHtml.html());
    }

    $priceHtml.html(variation.price_html);

    /* ------------------
     * IMAGE (🔥 FIX)
     * ------------------ */
    const $img = $box
        .find(".s1-fbt-flex-item")
        .has(`.s1-fbt-checkbox[data-product-id="${productId}"]`)
        .find(".s1-fbt-thumb img");

    if ($img.length && variation.image?.url) {

        // save original once
        if (!$img.data("original-src")) {
            $img
                .data("original-src", $img.attr("src"))
                .data("original-srcset", $img.attr("srcset"));
        }

        $img
            .attr("src", variation.image.url)
            .attr("srcset", variation.image.srcset || "");
    }

    this.updateSelectedIds($box);
    this.updateTotal($box);
},

    /* ------------------
     * VARIATION RESET
     * ------------------ */
    onVariationReset($form) {

    const productId = parseInt($form.data("product_id"), 10);
    if (!productId) return;

    const $box = $form.closest(".s1-fbt-box.style_3");

    const $checkbox = $box.find(
        `.s1-fbt-checkbox[data-product-id="${productId}"]`
    );

    $checkbox
        .val(0)
        .removeAttr("data-variation-id")
        .removeAttr("data-attrs");

    /* PRICE RESET */
    const $priceHtml = $box
        .find(".s1-fbt-flex-item")
        .has(`.s1-fbt-checkbox[data-product-id="${productId}"]`)
        .find(".s1-fbt-price-html");

    const originalPrice = $priceHtml.data("original-html");
    if (originalPrice) {
        $priceHtml.html(originalPrice);
    }

    /* IMAGE RESET */
    const $img = $box
        .find(".s1-fbt-flex-item")
        .has(`.s1-fbt-checkbox[data-product-id="${productId}"]`)
        .find(".s1-fbt-thumb img");

    const originalSrc    = $img.data("original-src");
    const originalSrcset = $img.data("original-srcset");

    if (originalSrc) {
        $img.attr("src", originalSrc);
    }
    if (originalSrcset) {
        $img.attr("srcset", originalSrcset);
    }

    this.updateSelectedIds($box);
    this.updateTotal($box);
},
    /* ------------------
     * IDS
     * ------------------ */
    updateSelectedIds($box) {

        const ids = new Set();

        const mainId = $box.find(".s1-fbt-add-bundle").data("main-id");
        if (mainId) ids.add(String(mainId));

        $box.find(".s1-fbt-checkbox:checked:not(:disabled)")
            .each(function () {

                const vid = $(this).attr("data-variation-id");
                const pid = $(this).data("product-id");

                ids.add(String(vid ? vid : pid));
            });

        $box.find(".s1-fbt-selected-ids")
            .val([...ids].join(","));
    },

    /* ------------------
     * TOTAL
     * ------------------ */
    /* ------------------
 * TOTAL (STYLE 3 – FIXED)
 * ------------------ */
updateTotal($box) {

    let total = 0;

    /* ✅ 1. MAIN PRODUCT PRICE */
    const basePrice =
        parseFloat(
            $box.find(".s1-fbt-total-bar").data("base-price")
        ) || 0;

    total += basePrice;

    /* ✅ 2. ADD-ON PRODUCTS */
    const $checked = $box.find(".s1-fbt-checkbox:checked:not(:disabled)");

    $checked.each(function () {
        total += parseFloat($(this).val()) || 0;
    });

    const currency = StoreOneFBT.currency_symbol || "₹";

    /* ✅ UPDATE TOTAL PRICE */
    $box.find(".s1-fbt-total-final-amount")
        .html(currency + total.toFixed(2));

    /* ✅ COUNT = main product + addons */
    let count = 1; // main product always included
    count += $checked.length;

    const labelTpl =
        $box.find(".s1-fbt-total-bar").data("one-pricelabel") ||
        "{count} items selected";

    $box.find(".s1-total-label")
        .text(labelTpl.replace("{count}", count));
   }, 

    /* ------------------
     * ADD TO CART
     * ------------------ */
    addToCart($btn) {

    const $box = $btn.closest(".s1-fbt-box.style_3");
    const items = [];

    /* =========================
     * 1️⃣ ADD MAIN PRODUCT (ALWAYS)
     * ========================= */
    const mainId = $btn.data("main-id");
    if (mainId) {
        items.push({ product_id: mainId });
    }

    /* =========================
     * 2️⃣ ADD BUNDLE PRODUCTS
     * ========================= */
    $box.find(".s1-fbt-checkbox:checked").each(function () {

        const pid   = $(this).data("product-id");
        const vid   = $(this).attr("data-variation-id");
        const attrs = $(this).attr("data-attrs");

        // ❌ skip main product checkbox (already added)
        if (pid == mainId) return;

        // ❌ variable product but variation not selected
        if (
            $(this)
                .closest(".s1-fbt-flex-item")
                .find(".variations_form").length &&
            !vid
        ) {
            return;
        }

        if (vid) {
            items.push({
                product_id: pid,
                variation_id: vid,
                variation: attrs ? JSON.parse(attrs) : {}
            });
        } else {
            items.push({ product_id: pid });
        }
    });

    if (!items.length) {
        alert("Please select variation first.");
        return;
    }

    console.log("STYLE 3 FINAL ITEMS:", items); // 🔍 debug

    $btn.addClass("loading");

    $.post(StoreOneFBT.ajax_url, {
        action: "storeone_fbt_add_bundle",
        nonce: StoreOneFBT.nonce,
        items: items
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
     * INIT ALL
     * =============================== */
    $(function () {
        S1FBT_STYLE1.init();
        S1FBT_STYLE2.init();
        S1FBT_STYLE3.init();
    });

})(jQuery);
