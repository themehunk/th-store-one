(function ($) {
    "use strict";

    const S1FBT = {

        init() {
            this.bindEvents();
            this.initAll();
        },

        bindEvents() {

            // CHECKBOX CHANGE (cards + list)
            $(document).on("change", ".s1-fbt-checkbox", (e) => {
                const $wrap = $(e.target).closest(".s1-fbt-content-wrap");
                this.syncCheckboxes(e.target, $wrap);
                this.updateSelectedIds($wrap);
                this.updateTotal($wrap);
                this.toggleRowUI($wrap);
            });

            // ADD TO CART
            $(document).on("click", ".s1-fbt-add-button", (e) => {
                e.preventDefault();
                this.addToCart($(e.currentTarget));
            });
        },

        initAll() {
            $(".s1-fbt-content-wrap").each((_, el) => {
                const $wrap = $(el);
                this.updateSelectedIds($wrap);
                this.updateTotal($wrap);
                this.toggleRowUI($wrap);
            });
        },

        /* --------------------------------------------------
         * Sync card checkbox <-> list checkbox
         * -------------------------------------------------- */
        syncCheckboxes(checkbox, $wrap) {
            const $cb = $(checkbox);
            const pid = $cb.data("product-id");
            const checked = $cb.is(":checked");

            // same product ke saare checkboxes sync karo
            $wrap.find(`.s1-fbt-checkbox[data-product-id="${pid}"]`)
                .prop("checked", checked);
        },

        /* --------------------------------------------------
            * Toggle row disabled UI (line-through etc)
            * -------------------------------------------------- */
            toggleRowUI($wrap) {

                $wrap.find(".s1-fbt-checkbox").each(function () {

                    const $cb = $(this);
                    const $row = $cb.closest(".s1-fbt-row");

                    if (!$cb.is(":checked")) {
                        $row.addClass("s1-fbt-row-disabled");
                    } else {
                        $row.removeClass("s1-fbt-row-disabled");
                    }
                });
            },

        /* --------------------------------------------------
         * Collect selected IDs
         * -------------------------------------------------- */
        updateSelectedIds($wrap) {
            let ids = [];

            $wrap.find(".s1-fbt-checkbox:checked").each(function () {
                const pid = $(this).data("product-id");
                if (pid) ids.push(pid);
            });

            $wrap.find(".s1-fbt-selected-ids").val(ids.join(","));
        },

        /* --------------------------------------------------
         * Total price update
         * -------------------------------------------------- */
        updateTotal($wrap) {
            let total = 0;
            let count = 0;

            $wrap.find(".s1-fbt-checkbox:checked").each(function () {
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
                .text(count + " items selected");
        },

        /* --------------------------------------------------
         * AJAX add to cart
         * -------------------------------------------------- */
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
        S1FBT.init();
    });

})(jQuery);