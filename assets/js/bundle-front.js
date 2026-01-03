jQuery(function ($) {

    const $wrap = $('.storeone-bundle-frontend');
    if (!$wrap.length) return;

    const currency = StoreOneFrontend.currency || '₹';

    function clamp(val, min, max) {
        if (val < min) return min;
        if (max > 0 && val > max) return max;
        return val;
    }

    function calculateBundle() {

        let total = 0;
        let items = [];

        const scope = $wrap.data('scope');

        $('.s1-bundle-item').each(function () {

            const $item = $(this);

            if ($item.data('optional') == 1 &&
                !$item.find('.s1-bundle-check').is(':checked')) {
                return;
            }

            let price = parseFloat($item.data('price')) || 0;
            let qty   = parseInt($item.find('.s1-qty-input').val(), 10) || 1;

            if (scope === 'store_product') {

                const type    = $item.data('discount-type');
                const percent = parseFloat($item.data('discount-percent')) || 0;
                const fixed   = parseFloat($item.data('discount-fixed')) || 0;

                if (type === 'percent') {
                    price -= price * percent / 100;
                }

                if (type === 'fixed') {
                    price -= fixed;
                }
            }

            price = Math.max(0, price);
            total += price * qty;

            items.push({
                id: $item.data('id'),
                qty: qty
            });
        });

        $('.s1-bundle-total-price').text(
            currency + total.toFixed(2)
        );

        $('#storeone_bundle_data').val(JSON.stringify(items));
    }

    $(document).on('click', '.s1-qty-btn', function () {

        const $input = $(this).siblings('.s1-qty-input');
        if (!$input.length) return;

        let val = parseInt($input.val(), 10) || 1;
        let min = parseInt($input.attr('min'), 10) || 1;
        let max = parseInt($input.attr('max'), 10) || 0;

        if ($(this).hasClass('plus')) val++;
        if ($(this).hasClass('minus')) val--;

        $input.val(clamp(val, min, max)).trigger('change');
    });

    $(document).on(
        'change keyup',
        '.s1-qty-input, .s1-bundle-check',
        calculateBundle
    );

    calculateBundle();
});
