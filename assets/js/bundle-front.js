jQuery(function ($) {

    const $bundle = $('.storeone-bundle-frontend');
    if (!$bundle.length) return;

    const $addToCartBtn = $('.single_add_to_cart_button');
    const $hiddenInput = $('#storeone_bundle_data');

    /* ---------------------------------
     * Woo Price Formatter (safe)
     * --------------------------------- */
    function wc_price_format(amount) {
        amount = parseFloat(amount) || 0;
        if (window.wc_price_params && wc_price_params.currency_format_symbol) {
            return wc_price_params.currency_format_symbol + amount.toFixed(2);
        }
        return amount.toFixed(2);
    }

    /* ---------------------------------
     * Get qty from item
     * --------------------------------- */
    function getQty($item) {
        const qty = parseInt($item.attr('data-qty'), 10);
        return qty > 0 ? qty : 1;
    }

    /* ---------------------------------
     * Update line price UI
     * --------------------------------- */
    function updateLinePrice($item) {
        const unit = parseFloat($item.data('price')) || 0;
        const qty  = getQty($item);

        $item.find('.s1-line-qty').text(qty);
        $item.find('.s1-line-total').html(wc_price_format(unit * qty));
    }

    /* ---------------------------------
     * Build bundle JSON
     * --------------------------------- */
    function buildBundleData() {

        let items = [];
        let totalQty = 0;

        $('.s1-bundle-item').each(function () {

            const $item = $(this);
            const isOptional = $item.data('optional') == 1;

            if (isOptional && !$item.find('.s1-bundle-check').is(':checked')) {
                return;
            }

            const qty = getQty($item);
            totalQty += qty;

            items.push({
                id: $item.data('id'),
                qty: qty
            });
        });

        if (!items.length) {
            $hiddenInput.val('');
            $addToCartBtn.prop('disabled', true);
            return;
        }

        $hiddenInput.val(JSON.stringify({
            items: items
        }));

        $addToCartBtn.prop('disabled', false);
    }

    /* ---------------------------------
     * Qty buttons (+ / -)
     * --------------------------------- */
    $(document).on('click', '.s1-qty-btn', function () {

        const $item = $(this).closest('.s1-bundle-item');
        let qty = getQty($item);

        if ($(this).hasClass('plus')) qty++;
        if ($(this).hasClass('minus')) qty--;

        if (qty < 1) qty = 1;

        $item.attr('data-qty', qty);
        updateLinePrice($item);
        buildBundleData();
    });

    /* ---------------------------------
     * Optional checkbox
     * --------------------------------- */
    $(document).on('change', '.s1-bundle-check', function () {
        buildBundleData();
    });

    /* ---------------------------------
     * Variable product price support
     * --------------------------------- */
    $(document).on('found_variation', '.variations_form', function (e, variation) {

        const price = parseFloat(variation.display_price);

        $('.s1-bundle-item[data-id="' + variation.product_id + '"]')
            .attr('data-price', price)
            .find('.s1-line-unit')
            .html(wc_price_format(price));

        buildBundleData();
    });

    /* ---------------------------------
     * Init
     * --------------------------------- */
    $('.s1-bundle-item').each(function () {
        updateLinePrice($(this));
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