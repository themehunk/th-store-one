jQuery(function ($) {

    const $wrap = $('.storeone-bundle-frontend');
    if (!$wrap.length) return;

    function getQty($item) {

        const $input = $item.find('.s1-qty-input');

        if ($input.length) {
            let v = parseInt($input.val(), 10);
            return v > 0 ? v : 1;
        }

        let d = parseInt($item.data('qty'), 10);
        return d > 0 ? d : 1;
    }

    function buildBundleData() {

        let items = [];
        const scope = $wrap.data('discount-scope');

        $('.s1-bundle-item').each(function () {

            const $item = $(this);

            if (
                $item.data('optional') == 1 &&
                !$item.find('.s1-bundle-check').is(':checked')
            ) {
                return;
            }

            items.push({
                id: $item.data('id'),
                qty: getQty($item),
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

        const bundleMin = parseInt($wrap.data('bundle-min'), 10) || 0;
        const bundleMax = parseInt($wrap.data('bundle-max'), 10) || 0;

        let totalQty = 0;
        items.forEach(i => totalQty += i.qty);

        // Min validation
        if (bundleMin > 0 && totalQty < bundleMin) {
            $('.single_add_to_cart_button').prop('disabled', true);
            return;
        }

        // Max validation
        if (bundleMax > 0 && totalQty > bundleMax) {
            $('.single_add_to_cart_button').prop('disabled', true);
            return;
        }

        $('.single_add_to_cart_button').prop('disabled', false);

    }

    $(document).on(
        'click',
        '.s1-qty-btn',
        function () {

            const $wrap = $(this).closest('.s1-qty-wrap');
            const $input = $wrap.find('.s1-qty-input');

            let val = parseInt($input.val(), 10) || 1;
            let min = parseInt($input.attr('min'), 10) || 1;
            let max = parseInt($input.attr('max'), 10) || 0;

            if ($(this).hasClass('plus')) val++;
            if ($(this).hasClass('minus')) val--;

            if (val < min) val = min;
            if (max > 0 && val > max) val = max;

            $input.val(val).trigger('change');
        }
    );

    $(document).on(
        'change keyup',
        '.s1-qty-input, .s1-bundle-check',
        buildBundleData
    );

    // initial
    buildBundleData();
});
