(function ($) {

    "use strict";

    const S1FBT = {

        init() {
            this.bindEvents();
            this.initAll();
        },

        bindEvents() {
            // Checkbox change
            $(document).on("change", ".s1-fbt-checkbox", (e) => {
                const wrap = $(e.target).closest(".s1-fbt-product-wrap");
                this.updateSelection(wrap);
                this.updateTotal(wrap);
                this.updateButtonText(wrap);
            });

            // Variation change
            $(document).on("change", ".variations_form select", (e) => {
                const wrap = $(e.target).closest(".s1-fbt-product-wrap");
                this.updateSelection(wrap);
                this.updateTotal(wrap);
                this.updateButtonText(wrap);
            });

            // Reset variation
            $(document).on("click", ".reset_variations", (e) => {
                const wrap = $(e.target).closest(".s1-fbt-product-wrap");
                setTimeout(() => {
                    this.updateSelection(wrap);
                    this.updateTotal(wrap);
                    this.updateButtonText(wrap);
                }, 80);
            });

            // ADD BUNDLE TO CART
            $(document).on("click", ".s1-fbt-add-button", (e) => {
                e.preventDefault();
                this.addBundleToCart($(e.target));
            });
        },

        

        /** INITIAL CALC */
        initAll() {
            $(".s1-fbt-product-wrap").each((i, el) => {
                const wrap = $(el);
                this.updateSelection(wrap);
                this.updateTotal(wrap);
                this.updateButtonText(wrap);
            });
        },

        /** COLLECT SELECTED IDS */
        updateSelection($wrap) {

            let selected = [];

            $wrap.find(".s1-fbt-checkbox").each(function () {

                const $cb = $(this);
                if ($cb.is(":checked") && !$cb.is(":disabled")) {

                    const vid = $cb.data("id"); // variation
                    const pid = $cb.data("product-id"); // product id

                    selected.push(vid && vid !== 0 ? vid : pid);
                }
            });

            $wrap.find(".s1-fbt-selected-ids").val(selected.join(","));
        },

        /** TOTAL PRICE CALCULATION */
        updateTotal($wrap) {

            let total = 0;
            let count = 0;

            $wrap.find(".s1-fbt-checkbox").each(function () {
                const $cb = $(this);

                if ($cb.is(":checked")) {
                    let price = parseFloat($cb.val());
                    if (!isNaN(price)) {
                        total += price;
                        count++;
                    }
                }
            });

            const currency = StoreOneFBT.currency_symbol;

            // Show total amount
            $wrap.find(".s1-fbt-total-final-amount")
                 .html(currency + total.toFixed(2));

            // Update label ("Total for X items")
            let title =
                count === 1 ? StoreOneFBT.total_single :
                count === 2 ? StoreOneFBT.total_double :
                StoreOneFBT.total_multi;

            $wrap.find(".s1-fbt-total-title").text(title);
        },

        /** UPDATE BUTTON TEXT */
        updateButtonText($wrap) {

            let count = $wrap.find(".s1-fbt-checkbox:checked").length;

            let txt =
                count === 1 ? StoreOneFBT.btn_single :
                count === 2 ? StoreOneFBT.btn_double :
                StoreOneFBT.btn_multi;

            $wrap.find(".s1-fbt-add-button").text(txt);
        },

        /** AJAX ADD TO CART */
        addBundleToCart($button) {

            let wrap = $button.closest(".s1-fbt-product-wrap");
            let ids  = wrap.find(".s1-fbt-selected-ids").val();
            let main_id = $button.data("main-id");

            if (!ids) {
                alert("Please select at least one item.");
                return;
            }

            $button.addClass("loading");

            $.ajax({
                url: StoreOneFBT.ajax_url,
                type: "POST",
                data: {
                    action: "storeone_fbt_add_bundle",
                    nonce: StoreOneFBT.nonce,
                    main_id: main_id,
                    selected_ids: ids.split(",")
                },
                success: (response) => {
                    $button.removeClass("loading");

                    $(document.body).trigger("added_to_cart", [
                        response.fragments,
                        response.cart_hash,
                        $button,
                    ]);
                },
                error: (xhr) => {
                    $button.removeClass("loading");
                    console.log("ERROR:", xhr.responseText);
                    alert("Something went wrong.");
                }
            });
        }

    };

    $(function () {
        S1FBT.init();
    });

})(jQuery);
