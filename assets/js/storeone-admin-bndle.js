jQuery(function ($) {

    /* -----------------------------
     * Auto open Bundle tab
     * ----------------------------- */
    function openTab() {
        if ($('#product-type').val() === 'storeone_bundle') {
            $('.product_data_tabs li.storeone_bundle_tab a').trigger('click');
        }
    }
    openTab();
    $('#product-type').on('change', openTab);

    /* -----------------------------
     * Show / Hide selected box
     * ----------------------------- */
    function toggleSelectedBox() {
        if ($('.storeone-bundle-selected .bundle-item').length) {
            $('.storeone-bundle-selected-wrap').slideDown(150);
        } else {
            $('.storeone-bundle-selected-wrap').slideUp(150);
        }
    }

    /* -----------------------------
     * 🔥 REGULAR PRICE CALCULATION
     * ----------------------------- */
    
    function calculateBundleRegularPrice() {

    let total = 0;

    const $list = jQuery('.storeone-bundle-selected:visible').first();

    $list.children('li.bundle-item').each(function () {

        const $item  = jQuery(this);
        const $price = $item.children('.bundle-price');

        let price = parseFloat($price.attr('data-price')) || 0;

        let qty = parseInt($item.find('.qty').val(), 10);
        if (isNaN(qty) || qty < 1) qty = 1;

        total += price * qty;

        $item.find('.qty-hidden').val(qty);
    });

    jQuery('.storeone-bundle-regular-input').val(total.toFixed(2));
}


    /* -----------------------------
     * Initial load (delay for WP admin)
     * ----------------------------- */
    toggleSelectedBox();
    setTimeout(calculateBundleRegularPrice, 80);

    /* -----------------------------
     * Add product from search
     * ----------------------------- */
    $('.storeone-bundle-search').on('select2:select', function (e) {

        const id = e.params.data.id;

        // Prevent duplicate
        if ($('.bundle-item[data-id="' + id + '"]').length) {
            $(this).val(null).trigger('change');
            return;
        }

        $.post(StoreOneBundle.ajax, {
            action: 'storeone_get_product_data',
            nonce: StoreOneBundle.nonce,
            id: id
        }, function (res) {

            if (!res.success) return;

            const p = res.data;

            $('.storeone-bundle-selected').append(`
                <li class="bundle-item" data-id="${p.id}">
                    <span class="drag">☰</span>

                    <input type="number" class="qty" min="1" value="1">

                    <img src="${p.image}" alt="">

                    <a href="${p.edit}" target="_blank" class="title">${p.title}</a>

                    <span class="bundle-price" data-price="${p.regular_price}">
                        ${p.price_html}
                    </span>

                    <span class="type">${p.type}</span>

                    <a href="#" class="remove">×</a>

                    <input type="hidden"
                           name="_storeone_bundle_products[${p.id}][id]"
                           value="${p.id}">

                    <input type="hidden"
                           class="qty-hidden"
                           name="_storeone_bundle_products[${p.id}][qty]"
                           value="1">
                </li>
            `);

            toggleSelectedBox();

            // Delay ensures DOM is ready
            setTimeout(calculateBundleRegularPrice, 50);

            // Reset search field
            $('.storeone-bundle-search').val(null).trigger('change');
        });
    });

    /* -----------------------------
     * Qty change (keyup + change)
     * ----------------------------- */
    $(document).on('keyup change', '.bundle-item .qty', function () {
        calculateBundleRegularPrice();
    });

    /* -----------------------------
     * Remove item
     * ----------------------------- */
    $(document).on('click', '.bundle-item .remove', function (e) {
        e.preventDefault();
        $(this).closest('.bundle-item').remove();

        toggleSelectedBox();
        calculateBundleRegularPrice();
    });

    /* -----------------------------
     * Sortable
     * ----------------------------- */
    if ($('.storeone-bundle-selected').length) {
        $('.storeone-bundle-selected').sortable({
            handle: '.drag',
            update: calculateBundleRegularPrice
        });
    }

});


jQuery(function ($) {

    /* =====================================================
     * Helpers
     * ===================================================== */

    function getScope() {
        return $('#_storeone_discount_scope').val();
    }

    /* =====================================================
     * Bundle-level fields (top meta box)
     * ===================================================== */

    function toggleFixedPriceField() {
        const scope = getScope();

        if (scope === 'store_bundle') {
            $('.show_if_storeone_bundle_scope').slideDown(120);
        } else {
            $('.show_if_storeone_bundle_scope').slideUp(120);
        }
    }

    function toggleBundleDiscountFields() {
        const type = $('#_storeone_discount_type').val();

        $('#_storeone_discount_percent')
            .closest('.form-field')
            .toggle(type === 'percent');

        $('#_storeone_discount_fixed')
            .closest('.form-field')
            .toggle(type === 'fixed');
    }

    /* =====================================================
     * Per-item settings dropdown
     * ===================================================== */

    function toggleSettingsByScope() {
        const scope = getScope();

        $('.bundle-settings-per-product').toggle(scope === 'store_product');
        $('.bundle-settings-bundle').toggle(scope === 'store_bundle');
    }

    function syncQuantityFields($section) {
        const enabled = $section.find('.s1-qty-toggle').is(':checked');
        $section.find('.s1-qty-field').toggle(enabled);
    }

    function syncDiscountFields($section) {
        const type = $section.find('.s1-discount-type').val();
        $section.find('.s1-discount-percent').toggle(type === 'percent');
        $section.find('.s1-discount-fixed').toggle(type === 'fixed');
    }

    function syncItemSettings($section) {
        syncQuantityFields($section);
        syncDiscountFields($section);
    }

    /* =====================================================
     * Initial load
     * ===================================================== */

    function initAll() {

        // Top bundle fields
        toggleFixedPriceField();
        toggleBundleDiscountFields();

        // Per-item sections
        toggleSettingsByScope();

        $('.bundle-settings-per-product, .bundle-settings-bundle').each(function () {
            syncItemSettings($(this));
        });
    }

    /* =====================================================
     * Event bindings
     * ===================================================== */

    // WooCommerce product panel ready
    $(document).on('woocommerce-product-data-panel-loaded', initAll);

    // Fallback for first load
    setTimeout(initAll, 300);

    // Discount scope change (global)
    $(document).on('change', '#_storeone_discount_scope', function () {
        toggleFixedPriceField();
        toggleSettingsByScope();
    });

    // Bundle-level discount type
    $(document).on('change', '#_storeone_discount_type', toggleBundleDiscountFields);

    // Per-item dropdown toggle
    $(document).on('click', '.bundle-item-settings-toggle', function () {
        $(this).siblings('.bundle-item-settings').slideToggle(150);
    });

    // Per-item quantity toggle
    $(document).on('change', '.s1-qty-toggle', function () {
        syncQuantityFields(
            $(this).closest('.bundle-settings-per-product, .bundle-settings-bundle')
        );
    });

    // Per-item discount type toggle
    $(document).on('change', '.s1-discount-type', function () {
        syncDiscountFields(
            $(this).closest('.bundle-settings-per-product, .bundle-settings-bundle')
        );
    });

});