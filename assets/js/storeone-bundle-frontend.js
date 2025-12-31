jQuery(function ($) {

    function calculateBundle() {

        let total = 0;
        let items = [];

        $('.s1-bundle-item').each(function () {

            const $item = $(this);
            const checked = $item.find('.s1-check').length
                ? $item.find('.s1-check').is(':checked')
                : true;

            if (!checked) return;

            let price = parseFloat($item.data('price'));
            let type  = $item.data('discount-type');
            let per   = parseFloat($item.data('discount-percent'));
            let fix   = parseFloat($item.data('discount-fixed'));

            if (type === 'percent') {
                price -= price * per / 100;
            }
            if (type === 'fixed') {
                price -= fix;
            }

            price = Math.max(0, price);
            total += price;

            items.push({
                id: $item.data('id'),
                price: price
            });

            $item.find('.price').text(
                StoreOneFrontend.currency + price.toFixed(2)
            );
        });

        $('#storeone_bundle_data').val(
            JSON.stringify(items)
        );

        $('.single_add_to_cart_button')
            .data('bundle-total', total);
    }

    $(document).on('change', '.s1-check', calculateBundle);
    calculateBundle();
});
