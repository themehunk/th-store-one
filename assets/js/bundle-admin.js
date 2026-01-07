jQuery(function ($) {

    /* --------------------------------
     * Tell Woo this product type exists
     * -------------------------------- */
    if (typeof wc_product_types !== 'undefined') {
        if (!wc_product_types.includes('storeone_bundle')) {
            wc_product_types.push('storeone_bundle');
        }
    }

    $('.options_group.pricing').addClass('show_if_storeone_bundle').removeClass('hide_if_external hide_if_grouped hide_if_variable');

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

            // sync hidden qty
            $item.find('.qty-hidden').val(qty);
        });

        const finalPrice = total.toFixed(2);

        /* --------------------------------
        * 🔥 AUTO SET WC PRICE FIELDS
        * -------------------------------- */
        jQuery('#_regular_price').val(finalPrice);
        jQuery('#_price').val(finalPrice).trigger('change');

        // optional: clear sale price
        jQuery('#_sale_price').val('');

        // optional: your custom readonly display
        jQuery('.storeone-bundle-regular-input').val(finalPrice);
    }

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

                <button type="button" class="bundle-item-settings-toggle">
                    <!-- SAME SVG -->
                    ${$('.bundle-item-settings-toggle svg').first().prop('outerHTML') || ''}
                </button>

                <a href="#" class="remove">
                    ${$('.bundle-item .remove svg').first().prop('outerHTML') || '×'}
                </a>

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
        calculateBundleRegularPrice();

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
     * 1. HELPERS
     * ===================================================== */

    function getScope() {
        // store_bundle | store_product
        return $('#_storeone_discount_scope').val();
    }

    /* =====================================================
     * 2. TOP BUNDLE-LEVEL FIELDS
     * ===================================================== */

    // Fixed price (bundle scope only)
    function toggleFixedPriceField() {
        $('.show_if_storeone_bundle_scope')
            .toggle(getScope() === 'store_bundle');
    }

    // Global discount percent / fixed toggle
    function toggleBundleDiscountFields() {

        // 🔥 Only relevant in bundle scope
        if (getScope() !== 'store_bundle') return;

        const type = $('#_storeone_discount_type').val();

        $('#_storeone_discount_percent')
            .closest('.form-field')
            .toggle(type === 'percent');

        $('#_storeone_discount_fixed')
            .closest('.form-field')
            .toggle(type === 'fixed');
    }

    // 🔥 Hide / show GLOBAL discount fields by scope
    function toggleTopDiscountByScope() {

        const scope = getScope();

        const $type    = $('#_storeone_discount_type').closest('.form-field');
        const $percent = $('#_storeone_discount_percent').closest('.form-field');
        const $fixed   = $('#_storeone_discount_fixed').closest('.form-field');

        if (scope === 'store_product') {
            // ❌ per-product → no global discount
            $type.hide();
            $percent.hide();
            $fixed.hide();
        } else {
            // ✅ bundle → global discount allowed
            $type.show();
            toggleBundleDiscountFields();
        }
    }

    /* =====================================================
     * 3. PER-ITEM SETTINGS
     * ===================================================== */

    function toggleSettingsByScope() {

        const scope = getScope();

        $('.bundle-item-settings').each(function () {

            const $wrap = $(this);
            const $perProduct = $wrap.find('.bundle-settings-per-product');
            const $bundleWide = $wrap.find('.bundle-settings-bundle');

            // Sections always visible
            $perProduct.show();
            $bundleWide.show();

            // State classes
            $wrap
                .toggleClass('is-per-product', scope === 'store_product')
                .toggleClass('is-bundle-wide', scope === 'store_bundle');

            // Per-item discount allowed only in store_product
            if (scope === 'store_bundle') {
                hidePerItemDiscount($perProduct);
            } else {
                showPerItemDiscount($perProduct);
            }
        });
    }

    /* ---------- Quantity ---------- */

    function syncQuantityFields($section) {
        const enabled = $section.find('.s1-qty-toggle').is(':checked');
        $section.find('.s1-qty-field').toggle(enabled);
    }

    /* ---------- Discount ---------- */

    function hidePerItemDiscount($section) {
        $section.find('.s1-discount-type').closest('.form-field').hide();
        $section.find('.s1-discount-percent').hide();
        $section.find('.s1-discount-fixed').hide();
    }

    function showPerItemDiscount($section) {
        $section.find('.s1-discount-type').closest('.form-field').show();
        syncDiscountFields($section);
    }

    function syncDiscountFields($section) {

        // 🔥 Safety: bundle scope → per-item discount never show
        if (getScope() === 'store_bundle') {
            hidePerItemDiscount($section);
            return;
        }

        const type = $section.find('.s1-discount-type').val();

        $section.find('.s1-discount-percent').toggle(type === 'percent');
        $section.find('.s1-discount-fixed').toggle(type === 'fixed');
    }

    function syncItemSettings($section) {
        syncQuantityFields($section);
        syncDiscountFields($section);
    }

    function toggleRegularPriceByScope() {

    const scope = getScope();

    const $regularPrice = jQuery('.storeone-bundle-regular-input');

    if (scope === 'store_product') {
        // 🔒 Disable regular price
        $regularPrice
            .prop('readonly', true)
            .addClass('storeone-disabled')
            .attr('title', 'Regular price is auto-calculated for bundle products');
    } else {
        // 🔓 Enable regular price
        $regularPrice
            .prop('readonly', false)
            .removeClass('storeone-disabled')
            .removeAttr('title');
    }
}


    /* =====================================================
     * 4. INIT
     * ===================================================== */

    function initAll() {
        
        // Top bundle fields
        toggleFixedPriceField();
        toggleTopDiscountByScope();

        // Per-item behaviour
        toggleSettingsByScope();
        toggleRegularPriceByScope();

        // Sync existing items
        $('.bundle-settings-per-product').each(function () {
            syncItemSettings($(this));
        });
    }

    /* =====================================================
     * 5. EVENTS
     * ===================================================== */

    // Woo panel ready
    $(document).on('woocommerce-product-data-panel-loaded', initAll);

    // Fallback
    setTimeout(initAll, 300);

    // Discount scope change
    $(document).on('change', '#_storeone_discount_scope', function () {
        toggleFixedPriceField();
        toggleTopDiscountByScope();
        toggleSettingsByScope();
        toggleRegularPriceByScope();
    });

    // Global discount type
    $(document).on('change', '#_storeone_discount_type', function () {
        toggleBundleDiscountFields();
    });

    // Item settings toggle
    $(document).on('click', '.bundle-item-settings-toggle', function (e) {
    e.preventDefault();

    const $item = $(this).closest('.bundle-item');
    $item.find('.bundle-item-settings').stop(true, true).slideToggle(150);
    });

    // Quantity toggle
    $(document).on('change', '.s1-qty-toggle', function () {
        syncQuantityFields(
            $(this).closest('.bundle-settings-per-product')
        );
    });

    // Per-item discount type
    $(document).on('change', '.s1-discount-type', function () {
        syncDiscountFields(
            $(this).closest('.bundle-settings-per-product')
        );
    });

});
