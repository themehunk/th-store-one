jQuery(function ($) {

    const $bundle = $('.storeone-bundle-frontend');
    if (!$bundle.length) return;

    const $addToCartBtn = $('.single_add_to_cart_button');

    /* ---------------------------------
     * Woo Price Formatter (basic)
     * --------------------------------- */
    function wc_price_format(amount) {
        if (window.wc_price_params && wc_price_params.currency_format_symbol) {
            return wc_price_params.currency_format_symbol + amount.toFixed(2);
        }
        return amount.toFixed(2);
    }

    /* ---------------------------------
     * Get quantity for an item
     * --------------------------------- */
    function getQty($item) {
        const $input = $item.find('.s1-qty-input');

        if ($input.length) {
            const v = parseInt($input.val(), 10);
            return v > 0 ? v : 1;
        }

        const d = parseInt($item.data('qty'), 10);
        return d > 0 ? d : 1;
    }

    /* ---------------------------------
     * Update single item line price
     * --------------------------------- */
    function updateBundleLinePrice($item) {
        const unit = parseFloat($item.data('price')) || 0;
        const qty  = getQty($item);
        const total = unit * qty;

        $item.find('.s1-line-qty').text(qty);
        $item.find('.s1-line-total').html(wc_price_format(total));
    }

    /* ---------------------------------
     * Build bundle JSON + validate min/max
     * --------------------------------- */
    function buildBundleData() {

        let items = [];
        let totalQty = 0;

        const scope     = $bundle.data('discount-scope');
        const bundleMin = parseInt($bundle.data('bundle-min'), 10) || 0;
        const bundleMax = parseInt($bundle.data('bundle-max'), 10) || 0;

        $('.s1-bundle-item').each(function () {

            const $item = $(this);

            // Optional unchecked → skip
            if (
                $item.data('optional') == 1 &&
                !$item.find('.s1-bundle-check').is(':checked')
            ) {
                return;
            }

            const qty = getQty($item);
            totalQty += qty;

            items.push({
                id: $item.data('id'),
                qty: qty,
                discount_type: $item.data('discount-type'),
                discount_percent: $item.data('discount-percent'),
                discount_fixed: $item.data('discount-fixed')
            });
        });

        $('#storeone_bundle_data').val(
            JSON.stringify({
                scope: scope,
                items: items
            })
        );

        /* ---- Min / Max validation ---- */
        if (
            (bundleMin > 0 && totalQty < bundleMin) ||
            (bundleMax > 0 && totalQty > bundleMax)
        ) {
            $addToCartBtn.prop('disabled', true);
        } else {
            $addToCartBtn.prop('disabled', false);
        }
    }

    /* ---------------------------------
     * Qty + / − buttons
     * --------------------------------- */
    $(document).on('click', '.s1-qty-btn', function () {

        const $wrap  = $(this).closest('.s1-qty-wrap');
        const $input = $wrap.find('.s1-qty-input');

        let val = parseInt($input.val(), 10) || 1;
        const min = parseInt($input.attr('min'), 10) || 1;
        const max = parseInt($input.attr('max'), 10) || 0;

        if ($(this).hasClass('plus')) val++;
        if ($(this).hasClass('minus')) val--;

        if (val < min) val = min;
        if (max > 0 && val > max) val = max;

        $input.val(val).trigger('change');
    });

    /* ---------------------------------
     * Qty / checkbox change
     * --------------------------------- */
    $(document).on(
        'change keyup',
        '.s1-qty-input, .s1-bundle-check',
        function () {
            const $item = $(this).closest('.s1-bundle-item');
            updateBundleLinePrice($item);
            buildBundleData();
        }
    );

    /* ---------------------------------
     * Initial setup
     * --------------------------------- */
    $('.s1-bundle-item').each(function () {
        updateBundleLinePrice($(this));
    });

    buildBundleData();

});

jQuery(function ($) {

    function recalcBundleTotal() {
        let total = 0;

        $('.s1-bundle-item').each(function () {
            const $item = $(this);

            const optional = $item.find('.s1-bundle-check').length
                ? $item.find('.s1-bundle-check').is(':checked')
                : true;

            if (!optional) return;

            const price = parseFloat($item.data('price')) || 0;
            const qty   = parseInt($item.data('qty'), 10) || 1;

            total += price * qty;
        });

        $('.s1-bundle-total-amount').text(
            wc_price(total)
        );
    }

    /* ==========================
     * VARIABLE PRODUCT SUPPORT
     * ========================== */
    $(document).on('found_variation', '.variations_form', function (e, variation) {

        const $form = $(this);
        const productId = variation.product_id;
        const price = parseFloat(variation.display_price);

        $('.s1-bundle-item[data-id="' + productId + '"]')
            .attr('data-price', price)
            .find('.s1-line-unit')
            .html(wc_price(price));

        recalcBundleTotal();
    });

});

