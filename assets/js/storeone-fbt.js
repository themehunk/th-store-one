(function ($) {
    "use strict";

    const S1FBT_STYLE1 = {

        init() {
            this.bindEvents();
            this.initAll();
        },

        bindEvents() {

            // Checkbox toggle
            $(document).on("change", ".style_1 .s1-fbt-checkbox", (e) => {
                const $wrap = $(e.target).closest(".s1-fbt-content-wrap");

                this.syncCards(e.target, $wrap);
                this.updateSelectedIds($wrap);
                this.updateTotal($wrap);
                this.toggleCardUI($wrap);
            });

            // Add to cart
            $(document).on("click", ".style_1 .s1-fbt-add-button", (e) => {
                e.preventDefault();
                this.addToCart($(e.currentTarget));
            });
        },

        initAll() {
            $(".style_1 .s1-fbt-content-wrap").each((_, el) => {
                const $wrap = $(el);

                // default checked (except disabled)
                $wrap.find(".s1-fbt-checkbox:not(:disabled)").prop("checked", true);

                this.updateSelectedIds($wrap);
                this.updateTotal($wrap);
                this.toggleCardUI($wrap);
            });
        },

        /* Sync same product checkboxes */
        syncCards(checkbox, $wrap) {
            const pid = $(checkbox).data("product-id");
            const checked = $(checkbox).is(":checked");

            $wrap.find(`.s1-fbt-checkbox[data-product-id="${pid}"]`)
                .prop("checked", checked);
        },

        /* Card inactive UI */
        toggleCardUI($wrap) {
            $wrap.find(".s1-fbt-checkbox").each(function () {
                const pid = $(this).data("product-id");
                const checked = $(this).is(":checked");

                const $card = $wrap.find(`.s1-fbt-card-holder.post-${pid}`);

                $card.toggleClass("is-inactive", !checked);
            });
        },

        /* 🔥 FIXED: Unique selected IDs */
        updateSelectedIds($wrap) {

            const ids = new Set();

            $wrap.find(".s1-fbt-checkbox:checked:not(:disabled)").each(function () {
                const pid = $(this).data("product-id");
                if (pid) ids.add(pid);
            });

            $wrap.find(".s1-fbt-selected-ids").val([...ids].join(","));
        },

        /* 🔥 FIXED: Correct total */
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

            $wrap.find(".s1-fbt-total-final-amount")
                .html(currency + total.toFixed(2));

            $wrap.find(".s1-fbt-summary-count")
                .text(`${count} items selected`);
        },

        /* AJAX add to cart */
        addToCart($btn) {

            const $wrap = $btn.closest(".s1-fbt-content-wrap");
            const ids = $wrap.find(".s1-fbt-selected-ids").val();
            const mainId = $btn.data("main-id");

            if (!ids) {
                alert("Please select at least one product.");
                return;
            }

            $btn.addClass("loading");

            $.ajax({
                url: StoreOneFBT.ajax_url,
                type: "POST",
                data: {
                    action: "storeone_fbt_add_bundle",
                    nonce: StoreOneFBT.nonce,
                    main_id: mainId,
                    selected_ids: ids.split(","),
                },
                success: (res) => {
                    $btn.removeClass("loading");
                    $(document.body).trigger("added_to_cart", [
                        res.fragments,
                        res.cart_hash,
                        $btn,
                    ]);
                },
                error: () => {
                    $btn.removeClass("loading");
                    alert("Something went wrong");
                },
            });
        },
    };

    $(function () {
        S1FBT_STYLE1.init();
    });

})(jQuery);



// second style

(function ($) {
    "use strict";

    const Style2FBT = {

        init() {
            this.bindEvents();
            this.initAll();
        },

        scope(el) {
            return $(el).closest(".s1-fbt-box.style_2");
        },

        bindEvents() {

            $(document).on("change", ".style_2 .s1-fbt-checkbox", (e) => {
                const $box = this.scope(e.target);
                this.updateUI($box);
                this.updateTotal($box);
                this.updateSelectedIds($box);
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
                this.updateTotal($box);
                this.updateSelectedIds($box);
            });
        },

        updateUI($box) {
            $box.find(".s1-fbt-checkbox").each(function () {

                const $cb = $(this);
                const pid = $cb.data("product-id");
                const checked = $cb.is(":checked");

                const $row = $cb.closest(".s1-title-wrap");
                const $eq = $box.find(`.s1-fbt-eq-item[data-product-id="${pid}"]`);

                $row.toggleClass("s1-fbt-row-disabled", !checked);
                $eq.toggleClass("is-inactive", !checked);
            });
        },

        updateSelectedIds($box) {
            const ids = $box.find(".s1-fbt-checkbox:checked")
                .map((_, el) => $(el).data("product-id"))
                .get();

            $box.find(".s1-fbt-selected-ids").val(ids.join(","));
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
                selected_ids: ids.split(",")
            }).done((res) => {
                $(document.body).trigger("added_to_cart", [
                    res.fragments,
                    res.cart_hash,
                    $btn
                ]);
            }).always(() => $btn.removeClass("loading"));
        }
    };

    $(Style2FBT.init.bind(Style2FBT));

})(jQuery);
