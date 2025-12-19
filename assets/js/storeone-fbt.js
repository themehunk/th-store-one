(function ($) {
    "use strict";

    /* ===============================
     * STYLE 1
     * =============================== */
    const S1FBT_STYLE1 = {
        init() {
            this.bindEvents();
            this.initAll();
        },

        bindEvents() {
            $(document).on("change", ".style_1 .s1-fbt-checkbox", (e) => {
                const $wrap = $(e.target).closest(".s1-fbt-content-wrap");
                this.syncCards(e.target, $wrap);
                this.toggleCardUI($wrap);
                this.updateSelectedIds($wrap);
                this.updateTotal($wrap);
            });

            $(document).on("click", ".style_1 .s1-fbt-add-button", (e) => {
                e.preventDefault();
                this.addToCart($(e.currentTarget));
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
        },

        syncCards(checkbox, $wrap) {
            const pid = $(checkbox).data("product-id");
            const checked = $(checkbox).is(":checked");
            $wrap.find(`.s1-fbt-checkbox[data-product-id="${pid}"]`)
                .prop("checked", checked);
        },

        toggleCardUI($wrap) {
            $wrap.find(".s1-fbt-checkbox").each(function () {
                const pid = $(this).data("product-id");
                const checked = $(this).is(":checked");
                $wrap.find(`.s1-fbt-card-holder.post-${pid}`)
                    .toggleClass("is-inactive", !checked);
            });
        },

        updateSelectedIds($wrap) {
            const ids = new Set();

            const mainId = $wrap.find(".s1-fbt-add-button").data("main-id");
            if (mainId) ids.add(mainId);

            $wrap.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {
                ids.add($(this).data("product-id"));
            });

            $wrap.find(".s1-fbt-selected-ids").val([...ids].join(","));
        },

        updateTotal($wrap) {
            let total = 0;
            let count = 0;

            $wrap.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {
                const price = parseFloat($(this).val());
                if (!isNaN(price)) {
                    total += price;
                    count++;
                }
            });

            const currency = StoreOneFBT.currency_symbol || "₹";

            // ✅ TOTAL UPDATE
            $wrap.find(".s1-fbt-total-final-amount")
                .html(currency + total.toFixed(2));

            // ✅ COUNT LABEL FROM PHP SETTING
            const labelTpl = $wrap
                .find(".s1-fbt-summary")
                .data("one-pricelabel") || "{count} items selected";

            const finalLabel = labelTpl.replace("{count}", count);

            $wrap.find(".s1-fbt-summary-count")
                .text(finalLabel);
        },

        addToCart($btn) {
            const $wrap = $btn.closest(".s1-fbt-content-wrap");
            const ids = $wrap.find(".s1-fbt-selected-ids").val();

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
     * STYLE 2
     * =============================== */
    const S1FBT_STYLE2 = {
        init() {
            this.bindEvents();
            this.initAll();
        },

        bindEvents() {
            $(document).on("change", ".style_2 .s1-fbt-checkbox", (e) => {
                const $box = $(e.target).closest(".s1-fbt-box.style_2");
                this.updateUI($box);
                this.updateSelectedIds($box);
                this.updateTotal($box);
            });

            $(document).on("click", ".style_2 .s1-fbt-add-button", (e) => {
                e.preventDefault();
                this.addToCart($(e.currentTarget));
            });
        },

        initAll() {
            $(".s1-fbt-box.style_2").each((_, box) => {
                const $box = $(box);
                $box.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);
                this.updateUI($box);
                this.updateSelectedIds($box);
                this.updateTotal($box);
            });
        },

        updateUI($box) {

            $box.find(".s1-fbt-checkbox").each(function () {

                const $cb = $(this);
                const checked = $cb.is(":checked");
                const pid = $cb.data("product-id");

                /* 1️⃣ Disable row */
                $cb.closest(".s1-title-wrap")
                    .toggleClass("s1-fbt-row-disabled", !checked);

                /* 2️⃣ Disable equal item (FIX) */
                $box.find(`.s1-fbt-eq-item[data-product-id="${pid}"]`)
                    .toggleClass("is-inactive", !checked);
            });
        },

        updateSelectedIds($box) {
            const ids = new Set();

            const mainId = $box.find(".s1-fbt-add-button").data("main-id");
            if (mainId) ids.add(mainId);

            $box.find(".s1-fbt-checkbox:checked").each(function () {
                ids.add($(this).data("product-id"));
            });

            $box.find(".s1-fbt-selected-ids").val([...ids].join(","));
        },

        updateTotal($box) {
            let total = 0;
            let count = 0;

            $box.find(".s1-fbt-checkbox:checked").each(function () {
                const price = parseFloat($(this).val());
                if (!isNaN(price)) {
                    total += price;
                    count++;
                }
            });

            const currency = StoreOneFBT.currency_symbol || "₹";

            $box.find(".s1-fbt-total-final-amount")
                .html(currency + total.toFixed(2));

            $box.find(".s1-fbt-total-title span")
                .text(`Total for ${count} items:`);
        },

        addToCart($btn) {
            const $box = $btn.closest(".s1-fbt-box.style_2");
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
            let total = 0;
            let count = 0;

            $box.find(".s1-fbt-checkbox:checked").each(function () {
                const price = parseFloat($(this).val());
                if (!isNaN(price)) {
                    total += price;
                }
                count++;
            });

            const currency = StoreOneFBT.currency_symbol || "₹";

            $box.find(".s1-fbt-total-final-amount")
                .html(currency + total.toFixed(2));

            $box.find(".s1-total-label")
                .text(`Total price for ${count} items:`);
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
